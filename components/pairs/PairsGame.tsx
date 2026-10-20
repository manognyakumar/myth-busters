"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Character } from "@/components/characters/Character";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PairCardView } from "@/components/ui/PairCard";
import { ClubCta } from "@/components/ui/ClubCta";
import { ErrorPanel, Loading } from "@/components/ui/StateScreens";
import type { Result } from "@/components/results/ResultsScreen";
import { api, ApiFailure, errorText, usePlayer } from "@/lib/player";
import { downloadStoryImage } from "@/lib/storyImage";
import { useCountUp } from "@/lib/useCountUp";

type Mode = "easy" | "challenge";
type Card = { id: string; text: string; kind: string; matched: boolean };
type Pair = {
  id: string;
  type: "myth_fact" | "theme_action";
  card_a: string;
  card_b: string;
  label_a: string;
  label_b: string;
  explanation: string;
  source_name: string | null;
  source_url: string | null;
};
type FlipResult = { matched: boolean; incorrect_flips: number; pairs_found: number; pairs_total: number; pair?: Pair };

const MISMATCH_MS = 1200;
const ENLARGE_MS = 2000;

function speak(text: string) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    s.speak(new SpeechSynthesisUtterance(text));
  } catch {}
}
const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Figma 08 card grid (9:1005), 09 match explanation (9:1202), 10 completion & fact sheet (9:1310), M3 mobile (11:319). */
export function PairsGame({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { ready, profile } = usePlayer();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<string[]>([]); // face-up, not yet matched
  const [locked, setLocked] = useState(false);
  const [flips, setFlips] = useState(0);
  const [matched, setMatched] = useState<Pair[]>([]);
  const [enlarged, setEnlarged] = useState<string[]>([]);
  const [dialog, setDialog] = useState<Pair | null>(null);
  const [status, setStatus] = useState<string>("");
  const [mismatch, setMismatch] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const total = mode === "easy" ? 4 : 8;
  const cols = 4;
  const done = matched.length === total;

  useEffect(() => {
    if (ready && !profile) router.replace(`/start?next=/pink-pairs/${mode}`);
  }, [ready, profile, router, mode]);

  const begin = useCallback(async () => {
    setError(null);
    try {
      const r = await api<{ attempt_id: string; cards: Card[] }>("/api/pairs/start", { mode });
      setAttemptId(r.attempt_id);
      setCards(r.cards);
      setOpen([]);
      setMatched([]);
      setFlips(0);
      setResult(null);
      setStartedAt(performance.now());
    } catch (e) {
      setError(e instanceof ApiFailure ? e.code : "server_error");
    }
  }, [mode]);

  useEffect(() => {
    if (ready && profile && !attemptId) void begin();
  }, [ready, profile, attemptId, begin]);

  // Elapsed display (Challenge only). The score uses server timestamps.
  useEffect(() => {
    if (startedAt == null || done || mode === "easy") return;
    const id = setInterval(() => setElapsed((performance.now() - startedAt) / 1000), 500);
    return () => clearInterval(id);
  }, [startedAt, done, mode]);

  async function flip(card: Card) {
    if (locked || card.matched || open.includes(card.id) || !attemptId || dialog) return;
    if (open.length === 0) {
      setOpen([card.id]);
      setStatus(`${card.kind}: ${card.text}`);
      return;
    }
    const first = open[0];
    setOpen([first, card.id]);
    setLocked(true);
    try {
      const r = await api<FlipResult>("/api/pairs/flip", { attemptId, a: first, b: card.id });
      setFlips(r.incorrect_flips);
      if (r.matched && r.pair) {
        const pair = r.pair;
        setCards((cs) => cs.map((c) => (c.id === first || c.id === card.id ? { ...c, matched: true } : c)));
        setMatched((m) => [...m, pair]);
        setOpen([]);
        setEnlarged([first, card.id]);
        setStatus(`It’s a match! ${pair.card_a} — ${pair.card_b}`);
        setTimeout(() => {
          setEnlarged([]);
          setDialog(pair);
          setLocked(false);
        }, ENLARGE_MS);
      } else {
        setMismatch(true);
        setStatus("Not a match. The cards will turn back over.");
        setTimeout(() => {
          setOpen([]);
          setLocked(false);
          setMismatch(false);
        }, MISMATCH_MS);
      }
    } catch (e) {
      setOpen([]);
      setLocked(false);
      setError(e instanceof ApiFailure ? e.code : "server_error");
    }
  }

  async function closeDialog() {
    setDialog(null);
    window.speechSynthesis?.cancel();
    if (matched.length === total && attemptId) {
      try {
        setResult(await api<Result>("/api/pairs/complete", { attemptId }));
      } catch (e) {
        setError(e instanceof ApiFailure ? e.code : "server_error");
      }
    } else {
      cardRefs.current[focusIdx]?.focus();
    }
  }

  function onGridKey(e: React.KeyboardEvent) {
    const n = cards.length;
    let next = focusIdx;
    if (e.key === "ArrowRight") next = Math.min(n - 1, focusIdx + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, focusIdx - 1);
    else if (e.key === "ArrowDown") next = Math.min(n - 1, focusIdx + cols);
    else if (e.key === "ArrowUp") next = Math.max(0, focusIdx - cols);
    else return;
    e.preventDefault();
    setFocusIdx(next);
    cardRefs.current[next]?.focus();
  }

  const readAloudCurrent = useMemo(() => {
    if (dialog) return `${dialog.label_a}: ${dialog.card_a}. ${dialog.label_b}: ${dialog.card_b}. ${dialog.explanation}`;
    const last = matched[matched.length - 1];
    return last ? `${last.label_a}: ${last.card_a}. ${last.label_b}: ${last.card_b}.` : "Flip two cards to find a matching pair.";
  }, [dialog, matched]);

  if (error)
    return <ErrorPanel message={errorText(error)} onRetry={() => (attemptId ? setError(null) : begin())} character="pinky" />;
  if (!ready || !profile || !attemptId) return <Loading label="Shuffling the cards…" />;
  if (result) return <Completion result={result} pairs={matched} mode={mode} onReplay={() => setAttemptId(null)} />;

  return (
    <div className="flex flex-col">
      {/* Game bar */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:gap-4 lg:px-16 lg:py-5">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-label-sm font-semibold text-magenta">{mode === "easy" ? "Easy Mode" : "Challenge Mode"}</p>
          <h1 className="text-h3 font-extrabold lg:text-h2">Find all {total} pairs</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          <Stat label="Pairs found" value={`${matched.length} / ${total}`} />
          {mode === "challenge" && <Stat label="Elapsed time" value={fmtTime(elapsed)} />}
          <Stat label="Incorrect flips" value={String(flips)} />
          {speechSupported() && (
            <button
              type="button"
              onClick={() => speak(readAloudCurrent)}
              className="flex min-h-12 items-center gap-2.5 rounded-ui border border-warm-gray px-3.5 py-2.5 text-label font-semibold"
            >
              <Icon name="speaker" size={20} className="text-magenta" />
              Read aloud
            </button>
          )}
          <Button
            variant="soft"
            onClick={() => {
              if (confirm("Quit this round? It won’t count toward the leaderboard.")) router.push("/pink-pairs");
            }}
          >
            Quit
          </Button>
        </div>
        {mode === "easy" && <p className="text-caption opacity-70 lg:hidden">No timer in Easy Mode — take your time.</p>}
      </div>

      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      {/* Game area */}
      <div className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-10 lg:px-16 lg:py-10">
          <div
            role="grid"
            aria-label="Bee Pairs cards"
            aria-rowcount={cards.length / cols}
            onKeyDown={onGridKey}
            className={`grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4 ${mode === "easy" ? "lg:w-[880px]" : "lg:w-[720px]"} lg:shrink-0`}
          >
            {cards.map((card, i) => {
              const faceUp = card.matched || open.includes(card.id);
              const big = enlarged.includes(card.id);
              return (
                <div role="gridcell" key={card.id}>
                  <button
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    type="button"
                    tabIndex={i === focusIdx ? 0 : -1}
                    onFocus={() => setFocusIdx(i)}
                    onClick={() => void flip(card)}
                    aria-disabled={locked || card.matched}
                    aria-label={
                      card.matched
                        ? `Matched: ${card.text}`
                        : faceUp
                          ? `${card.kind}: ${card.text}`
                          : `Card ${i + 1}, face down. Press Enter to flip.`
                    }
                    className={`block w-full rounded-pair [perspective:900px] transition-transform duration-300 ${
                      mode === "easy" ? "h-[208px] lg:h-[260px]" : "h-[208px]"
                    } ${big ? "relative z-10 scale-110" : ""}`}
                  >
                    <span
                      className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                        faceUp ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      <PairCardView state="back" className="absolute inset-0 [backface-visibility:hidden]" />
                      <PairCardView
                        state={card.matched ? "matched" : "face"}
                        kind={card.kind}
                        text={card.text}
                        icon={card.kind === "Theme" || card.kind === "Action" ? "heart" : "search"}
                        className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                      />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Side panel */}
          <aside className="flex flex-1 flex-col gap-4 rounded-ui bg-white p-6">
            <div className="flex items-center gap-3">
              <Character id="pinky" size={90} />
              <p className="flex-1 text-body">
                {mismatch
                  ? "Not a match this time — they’ll flip back. You’ve got this!"
                  : matched.length === 0
                    ? "Flip two cards. Can you find the pair that belongs together?"
                    : "Great matching! Every fact you learn makes a difference."}
              </p>
            </div>
            {mismatch && (
              <p className="flex items-center gap-2 rounded-tag bg-lavender px-3 py-2 text-caption">
                <Icon name="x" size={18} />
                Not a match, cards turn back in a moment. Flipping is paused.
              </p>
            )}
            <h2 className="text-h3 font-extrabold">Matched so far</h2>
            {matched.length === 0 ? (
              <p className="text-body opacity-70">No pairs yet.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {matched.map((p) => (
                  <li key={p.id} className="flex items-start gap-2.5 text-body">
                    <Icon name="check" size={20} className="mt-1 text-magenta" />
                    <span>
                      {p.card_a} ↔ {p.card_b}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="flex items-center gap-2.5 border-t border-warm-gray py-3 text-caption opacity-70">
              <Icon name="grid" size={20} />
              Arrow keys to move, Enter to flip. The rose outline shows keyboard focus.
            </p>
          </aside>
        </div>
      </div>

      {dialog && <MatchDialog pair={dialog} last={done} onClose={() => void closeDialog()} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-ui bg-blush px-4 py-2">
      <span className="text-caption opacity-70">{label}</span>
      <span className="text-h3 font-extrabold" aria-live="polite">
        {value}
      </span>
    </div>
  );
}

/** Figma 09 Bee Pairs — match explanation (9:1202). */
function MatchDialog({ pair, last, onClose }: { pair: Pair; last: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const relation = pair.type === "myth_fact" ? "Myth ↔ Correction" : "Theme ↔ Action";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum/70 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        className="anim-pop flex max-h-[90dvh] w-full max-w-[556px] flex-col items-center gap-4 overflow-y-auto rounded-ui bg-white p-6 text-center text-ink lg:p-8"
      >
        <h2 id="match-title" className="flex items-center gap-2 text-h3 font-extrabold lg:text-h2">
          <Icon name="star" size={28} className="text-magenta" />
          It’s a match!
        </h2>
        <span className="rounded-tag bg-rose px-2 py-1 text-label-sm font-semibold text-plum">{relation}</span>
        <div className="flex w-full items-center justify-center gap-3">
          <PairCardView state="matched" text={pair.card_a} className="min-h-[180px] w-[146px]" />
          <Icon name="arrow" size={24} className="text-magenta" />
          <PairCardView state="matched" text={pair.card_b} className="min-h-[180px] w-[146px]" />
        </div>
        <p className="text-body lg:text-[18px]">{pair.explanation}</p>
        {pair.source_url && (
          <a href={pair.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-label font-semibold text-magenta underline">
            <Icon name="external" size={18} />
            Source: {pair.source_name} (opens in a new tab)
          </a>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {speechSupported() && (
            <Button variant="soft" icon="speaker" onClick={() => speak(`${pair.card_a}. ${pair.card_b}. ${pair.explanation}`)}>
              Read aloud
            </Button>
          )}
          <Button ref={closeRef} size="large" onClick={onClose}>
            {last ? "See my fact sheet" : "Keep playing"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Figma 10 Bee Pairs — completion & fact sheet (9:1310). */
function Completion({ result: r, pairs, mode, onReplay }: { result: Result; pairs: Pair[]; mode: Mode; onReplay: () => void }) {
  const points = useCountUp(r.nmbp ?? 0);
  const modeLabel = mode === "easy" ? "Easy Mode" : "Challenge Mode";
  if (r.status === "rejected") {
    return (
      <ErrorPanel
        character="monster"
        message="That round finished faster than our fair-play check allows, so it doesn’t count toward the leaderboard. Try again at a calm pace — the cards aren’t going anywhere!"
        onRetry={onReplay}
      />
    );
  }
  const base = mode === "challenge" ? Math.round(r.raw_score / 1.5) : r.raw_score;
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-4 py-10 lg:flex-row lg:gap-10 lg:px-16 lg:py-14">
          <Character id="pinky" size={180} motion="wave" />
          <div className="flex flex-1 flex-col gap-3.5">
            <p className="text-label-sm font-semibold text-magenta">
              {modeLabel}, {pairs.length} pairs
            </p>
            <h1 className="font-display text-[40px] leading-none lg:text-title">All pairs matched!</h1>
            <div className="flex flex-wrap gap-3">
              <Tile label="Time" value={fmtTime(r.elapsed_seconds)} />
              <Tile label="Incorrect flips" value={String(r.incorrect_flips)} />
              <Tile label="Score" value={`${r.raw_score.toLocaleString()} / ${r.max_raw_score.toLocaleString()}`} />
              <div className="flex flex-col gap-0.5 rounded-ui bg-magenta px-4 py-3 text-white">
                <span className="text-caption">Myth Buster Points</span>
                <span className="text-[32px] font-black leading-[1.2]">+{points}</span>
              </div>
            </div>
            <p className="text-caption opacity-70">
              max(200, 2,000 − (25 × {r.elapsed_seconds} seconds) − (50 × {r.incorrect_flips} incorrect flips)) = {base.toLocaleString()}
              {mode === "challenge" ? ` × 1.5 = ${r.raw_score.toLocaleString()}` : ""} → {r.raw_score.toLocaleString()} /{" "}
              {r.max_raw_score.toLocaleString()} × 1,000 = {r.nmbp} Myth Buster Points
            </p>
          </div>
        </div>
      </section>
      <section aria-labelledby="factsheet" className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-10 lg:px-16 lg:py-14">
        <h2 id="factsheet" className="text-h2 font-extrabold">
          Your fact sheet
        </h2>
        <p className="text-body-lg">Every pair you matched this round, with why it matters.</p>
        <ul className="flex flex-col gap-3">
          {pairs.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-ui border border-warm-gray p-4 lg:flex-row lg:items-center lg:gap-6">
              <span className="w-fit rounded-tag bg-lavender px-2 py-1 text-label-sm font-semibold">
                {p.type === "myth_fact" ? "Myth ↔ Correction" : "Theme ↔ Action"}
              </span>
              <span className={`text-label font-semibold lg:w-[180px] ${p.type === "myth_fact" ? "line-through" : ""}`}>{p.card_a}</span>
              <Icon name="arrow" size={20} className="hidden text-magenta lg:inline-block" />
              <span className="text-label font-semibold text-magenta lg:w-[220px]">{p.card_b}</span>
              <span className="flex-1 text-body">
                {p.explanation}{" "}
                {p.source_url && (
                  <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-magenta underline">
                    Source: {p.source_name}
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={`/results/${r.attempt_id}`} size="large">
            See round results
          </ButtonLink>
          <Button variant="secondary" icon="external" onClick={() => void downloadStoryImage(pairs, modeLabel)}>
            Download story image (1080 × 1920)
          </Button>
          <Button variant="soft" onClick={onReplay}>
            Play again
          </Button>
        </div>
        <ClubCta className="mt-6" />
      </section>
    </>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-ui bg-white px-4 py-3">
      <span className="text-caption">{label}</span>
      <span className="text-[32px] font-extrabold leading-[1.2]">{value}</span>
    </div>
  );
}
