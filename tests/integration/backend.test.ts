/* eslint-disable @typescript-eslint/no-explicit-any -- RPC payloads are untyped JSON in tests */
/**
 * Integration tests against the local Supabase stack (`npx supabase start`, then `npm run db:seed`).
 * Uses DEV-style draft content (p_include_draft = true) so they run before clinical review.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../../scripts/env";
import { NMBP_CASES, PAIRS_CASES, QUIZ_CASES } from "../cases";

loadEnv();
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
let admin: SupabaseClient;

async function rpc<T = any>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await admin.rpc(fn, args);
  if (error) throw Object.assign(new Error(error.message), { code: error.code });
  return data as T;
}

async function newPlayer(prefix = "T") {
  const id = randomUUID();
  await rpc("mb_set_profile", { p_player: id, p_nickname: `${prefix}${id.slice(0, 8)}`, p_character: "pinky" });
  return id;
}

/** Test helper: move server timestamps back so we don't have to wait in real time. */
async function backdate(table: "answers" | "game_attempts", match: Record<string, unknown>, column: string, seconds: number) {
  const { error } = await admin
    .from(table)
    .update({ [column]: new Date(Date.now() - seconds * 1000).toISOString() })
    .match(match);
  if (error) throw error;
}

async function playQuiz(player: string, opts: { category?: string; timed?: boolean; correct?: boolean } = {}) {
  const { category = "basics", timed = false, correct = true } = opts;
  const s = await rpc("mb_start_quiz", { p_player: player, p_category: category, p_timed: timed, p_include_draft: true });
  for (let i = 0; i < s.total; i++) {
    await rpc("mb_serve_question", { p_player: player, p_attempt: s.attempt_id, p_idx: i });
    await backdate("answers", { attempt_id: s.attempt_id, idx: i }, "served_at", 3);
    const { data: ans } = await admin.from("answers").select("question_id").match({ attempt_id: s.attempt_id, idx: i }).single();
    const { data: q } = await admin.from("questions").select("answer").eq("id", ans!.question_id).single();
    const choice = correct ? q!.answer : q!.answer === "MYTH" ? "FACT" : "MYTH";
    await rpc("mb_submit_answer", { p_player: player, p_attempt: s.attempt_id, p_idx: i, p_choice: choice });
  }
  return { attempt: s.attempt_id as string, total: s.total as number };
}

beforeAll(async () => {
  if (!URL || !SERVICE || !ANON) throw new Error("Configure .env.local (see README) and run `npx supabase start`");
  admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
  const { count } = await admin.from("questions").select("*", { count: "exact", head: true });
  if (!count) throw new Error("No questions — run `npm run db:seed`");
});

describe("SQL scoring matches the spec formulas", () => {
  it.each(NMBP_CASES)("mb_nmbp(%i, %i) = %i", async (raw, max, expected) => {
    expect(await rpc("mb_nmbp", { raw, max_raw: max })).toBe(expected);
  });
  it.each(QUIZ_CASES)("mb_quiz_points(%s, %s, %i, %i) = %i", async (c, t, r, total, e) => {
    expect(await rpc("mb_quiz_points", { is_correct: c, timed: t, remaining_s: r, total_s: total })).toBe(e);
  });
  it.each(PAIRS_CASES)("mb_pairs_score(%i, %i, %s) = %i", async (s, f, ch, e) => {
    expect(await rpc("mb_pairs_score", { elapsed_s: s, incorrect_flips: f, challenge: ch })).toBe(e);
  });
});

describe("quiz rounds", () => {
  it("a perfect untimed 10-question round earns 667 NMBP and counts once", async () => {
    const p = await newPlayer();
    const { attempt } = await playQuiz(p, { timed: false });
    const r1 = await rpc("mb_complete_quiz", { p_player: p, p_attempt: attempt });
    expect(r1.raw_score).toBe(1000);
    expect(r1.nmbp).toBe(667);
    expect(r1.total_nmbp).toBe(667);
    expect(r1.new_achievements.map((a: any) => a.id)).toEqual(expect.arrayContaining(["first_investigation", "perfect_round"]));

    // Duplicate completion and repeated clicks award nothing.
    const r2 = await rpc("mb_complete_quiz", { p_player: p, p_attempt: attempt });
    const r3 = await rpc("mb_complete_quiz", { p_player: p, p_attempt: attempt });
    expect(r2.total_nmbp).toBe(667);
    expect(r3.total_nmbp).toBe(667);
    const { data: t } = await admin.from("player_totals").select("*").eq("player_id", p).single();
    expect(t!.rounds_completed).toBe(1);
  });

  it("a replay awards new valid points to the same single total", async () => {
    const p = await newPlayer();
    const a = await playQuiz(p);
    await rpc("mb_complete_quiz", { p_player: p, p_attempt: a.attempt });
    const b = await playQuiz(p, { category: "signs" });
    const r = await rpc("mb_complete_quiz", { p_player: p, p_attempt: b.attempt });
    expect(r.total_nmbp).toBe(1334);
    expect(r.categories_completed).toBe(2);
  });

  it("the Ultimate round serves 15 questions and normalises against 2,250", async () => {
    const p = await newPlayer();
    const { attempt, total } = await playQuiz(p, { category: "ultimate" });
    expect(total).toBe(15);
    const r = await rpc("mb_complete_quiz", { p_player: p, p_attempt: attempt });
    expect(r.max_raw_score).toBe(2250);
    expect(r.nmbp).toBe(667);
  });

  it("wrong answers never deduct points", async () => {
    const p = await newPlayer();
    const { attempt } = await playQuiz(p, { correct: false });
    const r = await rpc("mb_complete_quiz", { p_player: p, p_attempt: attempt });
    expect(r.raw_score).toBe(0);
    expect(r.nmbp).toBe(0);
  });

  it("an answer arriving under 1 second after serving rejects the whole attempt", async () => {
    const p = await newPlayer();
    const s = await rpc("mb_start_quiz", { p_player: p, p_category: "basics", p_timed: true, p_include_draft: true });
    await rpc("mb_serve_question", { p_player: p, p_attempt: s.attempt_id, p_idx: 0 });
    const r = await rpc("mb_submit_answer", { p_player: p, p_attempt: s.attempt_id, p_idx: 0, p_choice: "MYTH" });
    expect(r.rejected).toBe(true);
    const { data } = await admin.from("game_attempts").select("status").eq("id", s.attempt_id).single();
    expect(data!.status).toBe("rejected");
    await expect(rpc("mb_complete_quiz", { p_player: p, p_attempt: s.attempt_id })).resolves.toMatchObject({ status: "rejected" });
    const { data: t } = await admin.from("player_totals").select("*").eq("player_id", p).maybeSingle();
    expect(t).toBeNull();
  });

  it("the server never reveals answers before the player answers", async () => {
    const p = await newPlayer();
    const s = await rpc("mb_start_quiz", { p_player: p, p_category: "risk", p_timed: false, p_include_draft: true });
    const q = await rpc("mb_serve_question", { p_player: p, p_attempt: s.attempt_id, p_idx: 0 });
    expect(Object.keys(q)).not.toContain("answer");
    expect(JSON.stringify(s)).not.toMatch(/MYTH|FACT/);
  });

  it("questions can't be answered out of order or twice", async () => {
    const p = await newPlayer();
    const s = await rpc("mb_start_quiz", { p_player: p, p_category: "basics", p_timed: false, p_include_draft: true });
    await expect(rpc("mb_serve_question", { p_player: p, p_attempt: s.attempt_id, p_idx: 3 })).rejects.toThrow("out_of_order");
    await rpc("mb_serve_question", { p_player: p, p_attempt: s.attempt_id, p_idx: 0 });
    await backdate("answers", { attempt_id: s.attempt_id, idx: 0 }, "served_at", 3);
    await rpc("mb_submit_answer", { p_player: p, p_attempt: s.attempt_id, p_idx: 0, p_choice: "NOT_SURE" });
    await expect(rpc("mb_submit_answer", { p_player: p, p_attempt: s.attempt_id, p_idx: 0, p_choice: "MYTH" })).rejects.toThrow(
      "already_answered",
    );
  });

  it("only approved questions are served when drafts are off", async () => {
    const p = await newPlayer();
    const { count } = await admin.from("questions").select("*", { count: "exact", head: true }).eq("review_status", "approved");
    if ((count ?? 0) >= 10) return; // content has been approved — nothing to assert here
    await expect(
      rpc("mb_start_quiz", { p_player: p, p_category: "basics", p_timed: false, p_include_draft: false }),
    ).rejects.toThrow("not_enough_questions");
  });
});

describe("Pink Pairs", () => {
  async function solve(player: string, mode: "pairs_easy" | "pairs_challenge", wrongFirst = 0) {
    const s = await rpc("mb_start_pairs", { p_player: player, p_mode: mode, p_include_draft: true });
    const { data: att } = await admin.from("game_attempts").select("cards").eq("id", s.attempt_id).single();
    const layout = att!.cards as { id: string; pair_id: string }[];
    const byPair = new Map<string, string[]>();
    for (const c of layout) byPair.set(c.pair_id, [...(byPair.get(c.pair_id) ?? []), c.id]);
    const pairs = [...byPair.values()];
    for (let i = 0; i < wrongFirst; i++) {
      const r = await rpc("mb_flip_pair", { p_player: player, p_attempt: s.attempt_id, p_card_a: pairs[0][0], p_card_b: pairs[1][0] });
      expect(r.matched).toBe(false);
    }
    for (const [a, b] of pairs) {
      const r = await rpc("mb_flip_pair", { p_player: player, p_attempt: s.attempt_id, p_card_a: a, p_card_b: b });
      expect(r.matched).toBe(true);
      expect(r.pair.explanation.length).toBeGreaterThan(10);
    }
    return { attempt: s.attempt_id as string, cards: s.cards as unknown[] };
  }

  it("Easy uses 8 cards / 4 pairs and Challenge 16 cards / 8 pairs, with no pair ids exposed", async () => {
    const p = await newPlayer();
    const easy = await rpc("mb_start_pairs", { p_player: p, p_mode: "pairs_easy", p_include_draft: true });
    const ch = await rpc("mb_start_pairs", { p_player: p, p_mode: "pairs_challenge", p_include_draft: true });
    expect(easy.cards).toHaveLength(8);
    expect(ch.cards).toHaveLength(16);
    expect(JSON.stringify(ch.cards)).not.toContain("pair_id");
  });

  it("scores from server time and incorrect flips, then normalises", async () => {
    const p = await newPlayer();
    const { attempt } = await solve(p, "pairs_easy", 2);
    await backdate("game_attempts", { id: attempt }, "started_at", 40);
    const r = await rpc("mb_complete_pairs", { p_player: p, p_attempt: attempt });
    expect(r.status).toBe("completed");
    expect(r.incorrect_flips).toBe(2);
    expect(r.elapsed_seconds).toBeGreaterThanOrEqual(40);
    expect(r.raw_score).toBe(Math.max(200, 2000 - 25 * r.elapsed_seconds - 100));
    expect(r.total_nmbp).toBe(r.nmbp);
  });

  it("Challenge applies ×1.5 before normalising and awards Pink Pair Pro", async () => {
    const p = await newPlayer();
    const { attempt } = await solve(p, "pairs_challenge");
    await backdate("game_attempts", { id: attempt }, "started_at", 30);
    const r = await rpc("mb_complete_pairs", { p_player: p, p_attempt: attempt });
    expect(r.max_raw_score).toBe(3000);
    expect(r.raw_score).toBe(Math.round(Math.max(200, 2000 - 25 * r.elapsed_seconds) * 1.5));
    expect(r.new_achievements.map((a: any) => a.id)).toContain("pink_pair_pro");
  });

  it("rejects impossibly fast rounds (Easy < 8s)", async () => {
    const p = await newPlayer();
    const { attempt } = await solve(p, "pairs_easy");
    const r = await rpc("mb_complete_pairs", { p_player: p, p_attempt: attempt });
    expect(r.status).toBe("rejected");
    expect(r.total_nmbp).toBe(0);
  });

  it("can't complete before every pair is matched", async () => {
    const p = await newPlayer();
    const s = await rpc("mb_start_pairs", { p_player: p, p_mode: "pairs_easy", p_include_draft: true });
    await expect(rpc("mb_complete_pairs", { p_player: p, p_attempt: s.attempt_id })).rejects.toThrow("incomplete");
  });
});

describe("one global leaderboard", () => {
  it("quiz and Pink Pairs results add to the same total and appear in one ranking", async () => {
    const p = await newPlayer("Mix");
    const q = await playQuiz(p);
    await rpc("mb_complete_quiz", { p_player: p, p_attempt: q.attempt });
    const s = await rpc("mb_start_pairs", { p_player: p, p_mode: "pairs_easy", p_include_draft: true });
    const { data: att } = await admin.from("game_attempts").select("cards").eq("id", s.attempt_id).single();
    const groups = new Map<string, string[]>();
    for (const c of att!.cards as { id: string; pair_id: string }[]) groups.set(c.pair_id, [...(groups.get(c.pair_id) ?? []), c.id]);
    for (const [a, b] of groups.values()) await rpc("mb_flip_pair", { p_player: p, p_attempt: s.attempt_id, p_card_a: a, p_card_b: b });
    await backdate("game_attempts", { id: s.attempt_id }, "started_at", 60);
    const r = await rpc("mb_complete_pairs", { p_player: p, p_attempt: s.attempt_id });
    expect(r.total_nmbp).toBe(667 + r.nmbp);
    expect(r.categories_completed).toBe(2);

    const board = await rpc("mb_leaderboard", { p_limit: 100, p_offset: 0 });
    const rows = board.rows.filter((x: any) => x.nickname.startsWith("Mix") && x.nickname.endsWith(p.slice(0, 8)));
    expect(rows).toHaveLength(1);
    expect(rows[0].total_nmbp).toBe(r.total_nmbp);
    expect(Object.keys(rows[0])).not.toContain("player_id");
  });

  it("concurrent players don't interfere with each other's totals", async () => {
    const players = await Promise.all([newPlayer("C"), newPlayer("C"), newPlayer("C")]);
    const attempts = await Promise.all(players.map((p) => playQuiz(p)));
    const results = await Promise.all(players.map((p, i) => rpc("mb_complete_quiz", { p_player: p, p_attempt: attempts[i].attempt })));
    for (const r of results) expect(r.total_nmbp).toBe(667);
  });

  it("applies the tie-break: higher average NMBP ranks first on equal totals", async () => {
    const a = await newPlayer("TieA");
    const b = await newPlayer("TieB");
    const total = 900000 + Math.floor(Math.random() * 1000);
    await admin.from("player_totals").insert([
      { player_id: a, total_nmbp: total, rounds_completed: 3, categories: ["basics"], avg_nmbp: total / 3, best_nmbp: 1 },
      { player_id: b, total_nmbp: total, rounds_completed: 2, categories: ["basics"], avg_nmbp: total / 2, best_nmbp: 1 },
    ]);
    expect(await rpc("mb_rank", { p_player: b })).toBeLessThan(await rpc("mb_rank", { p_player: a }));
    await admin.from("players").delete().in("id", [a, b]);
  });
});

describe("row level security", () => {
  let user: SupabaseClient;
  let uid: string;

  beforeAll(async () => {
    user = createClient(URL, ANON, { auth: { persistSession: false } });
    const { data, error } = await user.auth.signInAnonymously();
    if (error) throw error;
    uid = data.user!.id;
    await rpc("mb_set_profile", { p_player: uid, p_nickname: `R${uid.slice(0, 8)}`, p_character: "rosie" });
  });

  it("clients cannot write attempts, answers or totals directly", async () => {
    const a = await user.from("game_attempts").insert({ player_id: uid, category: "basics", mode: "quiz", difficulty: "easy", nmbp: 1000 });
    expect(a.error).not.toBeNull();
    const t = await user.from("player_totals").upsert({ player_id: uid, total_nmbp: 999999 });
    expect(t.error).not.toBeNull();
    const ans = await user.from("answers").insert({ attempt_id: randomUUID(), idx: 0, question_id: "b01" });
    expect(ans.error).not.toBeNull();
  });

  it("clients cannot read answers, players or other private data", async () => {
    const q = await user.from("questions").select("answer");
    expect(q.data ?? []).toHaveLength(0);
    const pl = await user.from("players").select("*");
    expect(pl.data ?? []).toHaveLength(0);
  });

  it("clients cannot call the scoring RPCs directly", async () => {
    const r = await user.rpc("mb_complete_quiz", { p_player: uid, p_attempt: randomUUID() });
    expect(r.error).not.toBeNull();
    const t = await user.rpc("mb_set_profile", { p_player: randomUUID(), p_nickname: "Hacker", p_character: "pinky" });
    expect(t.error).not.toBeNull();
  });
});
