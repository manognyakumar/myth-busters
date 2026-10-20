"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Character } from "@/components/characters/Character";
import { ButtonLink, Button } from "@/components/ui/Button";
import { ClubCta } from "@/components/ui/ClubCta";
import { Confetti } from "@/components/ui/Confetti";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Badge, FeedbackTag, type FeedbackResult } from "@/components/ui/game";
import { ErrorPanel, Loading } from "@/components/ui/StateScreens";
import { trackCta } from "@/lib/api";
import { getCategory } from "@/lib/categories";
import { CLINIC_LINE, CLUB_NAME } from "@/lib/site";
import { api, ApiFailure, errorText, isKiosk, usePlayer } from "@/lib/player";
import { useCountUp } from "@/lib/useCountUp";

type QuizReview = { statement: string; answer: "MYTH" | "FACT"; outcome: FeedbackResult; points: number; explanation: string; source_name: string; source_url: string };
type PairReview = { type: string; card_a: string; card_b: string; label_a: string; label_b: string; explanation: string; source_name: string | null; source_url: string | null };
export type Result = {
  attempt_id: string;
  category: string;
  mode: "quiz" | "pairs_easy" | "pairs_challenge";
  timed: boolean;
  status: "in_progress" | "completed" | "rejected";
  rejected_reason: string | null;
  raw_score: number;
  max_raw_score: number;
  nmbp: number;
  correct: number;
  incorrect: number;
  not_sure: number;
  total_questions: number;
  elapsed_seconds: number;
  incorrect_flips: number;
  total_nmbp: number;
  rounds_completed: number;
  categories_completed: number;
  rank: number | null;
  achievements: { id: string; name: string; rule: string }[];
  review: (QuizReview | PairReview)[];
};

const fmt = (n: number) => n.toLocaleString("en-US");
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Figma 11 Round results (unified) + club CTA (10:1337), M4 mobile (11:411). */
export function ResultsScreen({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const { newPlayer } = usePlayer();
  const [r, setR] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kiosk, setKioskState] = useState(false);
  const counted = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setR(await api<Result>(`/api/attempt/${attemptId}`));
    } catch (e) {
      setError(e instanceof ApiFailure ? e.code : "server_error");
    }
  }, [attemptId]);

  useEffect(() => {
    void load();
    setKioskState(isKiosk());
  }, [load]);

  // Count each results screen once per attempt (anonymous).
  useEffect(() => {
    if (!r || r.status !== "completed" || counted.current) return;
    counted.current = true;
    const key = `mythbusters-shown-${r.attempt_id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    trackCta("results_shown");
  }, [r]);

  const nextPlayer = useCallback(async () => {
    await newPlayer();
    router.push("/start");
  }, [newPlayer, router]);

  // Booth tablets: hand over to the next visitor after 90s without interaction.
  useEffect(() => {
    if (!kiosk) return;
    let t = setTimeout(nextPlayer, 90_000);
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(nextPlayer, 90_000);
    };
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [kiosk, nextPlayer]);

  if (error)
    return (
      <Shell>
        <ErrorPanel dark message={errorText(error)} onRetry={load} />
      </Shell>
    );
  if (!r)
    return (
      <Shell>
        <Loading dark label="Adding up your points…" />
      </Shell>
    );

  const cat = getCategory(r.category);
  const isQuiz = r.mode === "quiz";
  const playAgain = isQuiz ? `/play/${r.category}` : `/pink-pairs/${r.mode === "pairs_easy" ? "easy" : "challenge"}`;
  const modeLabel = isQuiz ? `${cat?.title}, ${r.timed ? "timed" : "untimed"} round` : `Bee Pairs, ${r.mode === "pairs_easy" ? "Easy" : "Challenge"} Mode`;

  if (r.status === "rejected") {
    return (
      <Shell>
        <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-16">
          <ErrorPanel
            dark
            character="monster"
            message="This round finished faster than our fair-play check allows, so it doesn’t count toward the leaderboard. Every fact still counts — try another round at your own pace."
          />
          <div className="mt-8">
            <ClubCta />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Confetti />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 pb-16 pt-6 lg:px-16 lg:pt-12">
        {/* Summary */}
        <section className="flex flex-col items-center gap-4 text-center lg:flex-row lg:gap-8 lg:text-left">
          <Character id="captain" size={120} motion="pop" className="lg:hidden" />
          <Character id="captain" size={180} motion="pop" className="hidden lg:block" />
          <div className="flex flex-col gap-2.5">
            <p className="text-label-sm font-semibold text-lavender-mid">{modeLabel}</p>
            <h1 className="font-display text-[36px] leading-none text-white lg:text-title">Round complete!</h1>
            <p className="text-body text-blush lg:text-body-lg">“Knowledge is a powerful first step!” — Captain Courage</p>
            <p className="text-caption text-lavender-mid">Hosted by {CLUB_NAME}</p>
          </div>
        </section>

        {/* Score tiles */}
        <section aria-label="Your points" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <Tile label={isQuiz || r.mode === "pairs_easy" ? "Raw score" : "Raw score (×1.5)"} value={r.raw_score} sub={`of ${fmt(r.max_raw_score)}`} />
          <Tile label="Myth Buster Points earned" value={r.nmbp} prefix="+" sub="normalised 0–1,000" highlight />
          <Tile label="New total" value={r.total_nmbp} sub="Myth Buster Points" />
          <Tile label="Global rank" value={r.rank ?? 0} prefix="#" sub="on the one global leaderboard" />
        </section>

        {/* Breakdown + achievements */}
        <section className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap gap-3" aria-label="Breakdown">
            {isQuiz ? (
              <>
                <Stat icon="check" tone="success" text={`${r.correct} correct`} />
                {r.incorrect > 0 && <Stat icon="x" tone="blush" text={`${r.incorrect} not quite`} />}
                {r.not_sure > 0 && <Stat icon="question" tone="lavender" text={`${r.not_sure} not sure or timed out`} />}
              </>
            ) : (
              <>
                <Stat icon="clock" tone="lavender" text={`Time ${fmtTime(r.elapsed_seconds)}`} />
                <Stat icon="x" tone="blush" text={`${r.incorrect_flips} incorrect flip${r.incorrect_flips === 1 ? "" : "s"}`} />
              </>
            )}
          </div>
          {r.achievements.map((a) => (
            <div key={a.id} className="anim-pop flex items-center gap-4 rounded-ui bg-white px-5 py-3 text-ink">
              <p className="text-label-sm font-semibold text-magenta">Achievement unlocked</p>
              <Badge name={a.name} rule={a.rule} earned />
            </div>
          ))}
        </section>

        {/* Review */}
        <section aria-labelledby="review-heading" className="flex flex-col gap-3">
          <h2 id="review-heading" className="text-h3 font-extrabold text-white lg:text-h2">
            {isQuiz ? "Review your answers" : "Your fact sheet"}
          </h2>
          <ul className="flex flex-col gap-3">
            {r.review.map((item, i) => (
              <li key={i} className="flex flex-col gap-4 rounded-ui bg-row p-5 lg:flex-row lg:gap-6">
                {"statement" in item ? <QuizItem q={item} /> : <PairItem p={item} />}
              </li>
            ))}
          </ul>
        </section>

        {/* Takeaways */}
        <section aria-labelledby="takeaways-heading" className="flex flex-col gap-4">
          <h2 id="takeaways-heading" className="text-h3 font-extrabold text-white lg:text-h2">
            Three things to remember
          </h2>
          <ul className="grid gap-4 lg:grid-cols-3">
            {(
              [
                ["book", "Everyone learns differently"],
                ["search", "Not sure how to help? Ask first, then listen"],
                ["heart", CLINIC_LINE],
              ] as [IconName, string][]
            ).map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 rounded-ui bg-blush p-5 text-label font-semibold text-ink">
                <Icon name={icon} className="text-magenta" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <ClubCta />

        <nav aria-label="Next steps" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {kiosk && (
            <Button size="large" onClick={nextPlayer} icon="users">
              Next player
            </Button>
          )}
          <ButtonLink href={playAgain} size="large" variant={kiosk ? "onPlum" : "primary"}>
            Play again
          </ButtonLink>
          <ButtonLink href="/play" size="large" variant="onPlum">
            Try another category
          </ButtonLink>
          <ButtonLink href="/leaderboard" size="large" variant="onPlum">
            View global leaderboard
          </ButtonLink>
        </nav>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="bg-plum-gradient min-h-[70vh] text-white">{children}</div>;
}

function Tile({ label, value, sub, prefix = "", highlight = false }: { label: string; value: number; sub: string; prefix?: string; highlight?: boolean }) {
  const shown = useCountUp(value, 1200);
  return (
    <div className={`flex flex-col gap-1 rounded-ui p-4 lg:p-6 ${highlight ? "bg-magenta text-white" : "bg-row"}`}>
      <p className={`text-label-sm font-semibold ${highlight ? "" : "text-lavender-mid"}`}>{label}</p>
      <p className={`text-[32px] font-black leading-none lg:text-score ${highlight ? "" : "text-rose"}`}>
        {prefix}
        {value === 0 && prefix === "#" ? "—" : fmt(shown)}
      </p>
      <p className={`text-caption ${highlight ? "" : "text-blush"}`}>{sub}</p>
    </div>
  );
}

function Stat({ icon, tone, text }: { icon: IconName; tone: "success" | "blush" | "lavender"; text: string }) {
  const cls = { success: "bg-success text-white", blush: "bg-blush text-ink", lavender: "bg-lavender text-ink" }[tone];
  return (
    <span className={`inline-flex items-center gap-2 rounded-tag px-3.5 py-2 text-label font-semibold ${cls}`}>
      <Icon name={icon} size={20} />
      {text}
    </span>
  );
}

function SourceLink({ name, url }: { name: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-caption text-lavender-mid underline">
      <Icon name="external" size={16} />
      Source: {name}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function QuizItem({ q }: { q: QuizReview }) {
  return (
    <>
      <div className="flex flex-col gap-2 lg:w-[440px] lg:shrink-0">
        <p className={`text-label font-semibold text-white ${q.answer === "MYTH" ? "line-through" : ""}`}>{q.statement}</p>
        <div className="flex flex-wrap items-center gap-2">
          <FeedbackTag result={q.outcome} />
          <span className="rounded-tag bg-rose px-2 py-1 text-label-sm font-semibold text-plum">Answer: {q.answer}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-body text-blush">{q.explanation}</p>
        <SourceLink name={q.source_name} url={q.source_url} />
      </div>
    </>
  );
}

function PairItem({ p }: { p: PairReview }) {
  return (
    <>
      <div className="flex flex-col gap-2 lg:w-[440px] lg:shrink-0">
        <p className="text-label-sm font-semibold text-lavender-mid">{p.label_a}</p>
        <p className={`text-label font-semibold text-white ${p.type === "myth_fact" ? "line-through" : ""}`}>{p.card_a}</p>
        <p className="text-label-sm font-semibold text-lavender-mid">{p.label_b}</p>
        <p className="text-label font-semibold text-white">{p.card_b}</p>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-body text-blush">{p.explanation}</p>
        {p.source_name && p.source_url && <SourceLink name={p.source_name} url={p.source_url} />}
      </div>
    </>
  );
}
