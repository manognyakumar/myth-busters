"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Character } from "@/components/characters/Character";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { AnswerButton, FeedbackTag, TimerRing, type Choice, type FeedbackResult } from "@/components/ui/game";
import { ErrorPanel, Loading } from "@/components/ui/StateScreens";
import { CHARACTERS } from "@/lib/characters";
import type { CategoryInfo } from "@/lib/categories";
import { api, ApiFailure, errorText, usePlayer } from "@/lib/player";
import { getTimerOn } from "@/lib/prefs";
import { useCountUp } from "@/lib/useCountUp";

type Start = { attempt_id: string; total: number; timed: boolean; question_time: number | null };
type Question = { idx: number; total: number; statement: string; timed: boolean; question_time: number | null; remaining: number | null };
type Feedback = {
  rejected: boolean;
  outcome: FeedbackResult;
  correct: boolean;
  points: number;
  answer: "MYTH" | "FACT";
  statement: string;
  explanation_short: string;
  explanation_long: string | null;
  source_name: string;
  source_url: string;
  score: number;
  is_last: boolean;
};

/** Minimum time before answers unlock — the server rejects any answer under 1s after serving. */
const ANSWER_UNLOCK_MS = 1100;

/** Figma 05 Quiz — question (8:860), 06 Quiz — feedback (8:962), M2 Quiz — mobile (11:235). */
export function QuizGame({ category }: { category: CategoryInfo }) {
  const router = useRouter();
  const { ready, profile } = usePlayer();
  const [start, setStart] = useState<Start | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);
  const deadline = useRef<number | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const guide = CHARACTERS[category.character];

  useEffect(() => {
    if (ready && !profile) router.replace(`/start?next=${encodeURIComponent(category.href)}`);
  }, [ready, profile, router, category.href]);

  const loadQuestion = useCallback(async (attemptId: string, idx: number) => {
    setBusy(true);
    try {
      const q = await api<Question>("/api/quiz/question", { attemptId, idx });
      setQuestion(q);
      setFeedback(null);
      setChosen(null);
      setUnlocked(false);
      setTimeout(() => setUnlocked(true), ANSWER_UNLOCK_MS);
      if (q.timed && q.remaining != null) {
        deadline.current = performance.now() + q.remaining * 1000;
        setRemaining(q.remaining);
      } else {
        deadline.current = null;
        setRemaining(null);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof ApiFailure ? e.code : "server_error");
    } finally {
      setBusy(false);
    }
  }, []);

  const begin = useCallback(async () => {
    setError(null);
    try {
      const s = await api<Start>("/api/quiz/start", { category: category.id, timed: getTimerOn() });
      setStart(s);
      setScore(0);
      await loadQuestion(s.attempt_id, 0);
    } catch (e) {
      setError(e instanceof ApiFailure ? e.code : "server_error");
    }
  }, [category.id, loadQuestion]);

  useEffect(() => {
    if (ready && profile && !start) void begin();
  }, [ready, profile, start, begin]);

  const answer = useCallback(
    async (choice: Choice | "TIMEOUT") => {
      if (!start || !question || feedback || busy) return;
      if (choice !== "TIMEOUT" && !unlocked) return;
      setBusy(true);
      deadline.current = null; // stop the timer
      if (choice !== "TIMEOUT") setChosen(choice);
      try {
        const f = await api<Feedback>("/api/quiz/answer", { attemptId: start.attempt_id, idx: question.idx, choice });
        if (f.rejected) {
          setRejected(true);
          return;
        }
        setFeedback(f);
        setScore(f.score);
        setTimeout(() => nextRef.current?.focus(), 50);
      } catch (e) {
        setError(e instanceof ApiFailure ? e.code : "server_error");
      } finally {
        setBusy(false);
      }
    },
    [start, question, feedback, busy, unlocked],
  );

  // Countdown — display only; the server measures time from its own timestamps.
  useEffect(() => {
    if (!question?.timed || feedback) return;
    const id = setInterval(() => {
      if (deadline.current == null) return;
      const left = Math.max(0, (deadline.current - performance.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        deadline.current = null;
        void answer("TIMEOUT");
      }
    }, 200);
    return () => clearInterval(id);
  }, [question, feedback, answer]);

  async function next() {
    if (!start || !question || !feedback) return;
    if (feedback.is_last) {
      setBusy(true);
      try {
        await api("/api/quiz/complete", { attemptId: start.attempt_id });
        router.push(`/results/${start.attempt_id}`);
      } catch (e) {
        setError(e instanceof ApiFailure ? e.code : "server_error");
        setBusy(false);
      }
      return;
    }
    await loadQuestion(start.attempt_id, question.idx + 1);
  }

  // Keyboard: M / F / N while answering; Enter on feedback is handled by the focused Next button.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || feedback || !question) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const map: Record<string, Choice> = { m: "MYTH", f: "FACT", n: "NOT_SURE" };
      const c = map[e.key.toLowerCase()];
      if (c) {
        e.preventDefault();
        void answer(c);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, feedback, question]);

  if (rejected) {
    return (
      <Shell>
        <ErrorPanel
          dark
          character="monster"
          message="That round was answered faster than our fair-play check allows, so it can’t count toward the leaderboard. Start a new round and take a moment to read each statement."
          onRetry={() => {
            setRejected(false);
            setStart(null);
          }}
        />
      </Shell>
    );
  }
  if (error) {
    return (
      <Shell>
        <ErrorPanel dark message={errorText(error)} onRetry={() => (start ? loadQuestion(start.attempt_id, question?.idx ?? 0) : begin())} />
      </Shell>
    );
  }
  if (!ready || !profile || !start || !question) {
    return (
      <Shell>
        <Loading dark label="Getting your round ready…" />
      </Shell>
    );
  }

  const total = question.total;
  return (
    <Shell>
      {/* Quiz bar */}
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:gap-8 lg:px-16 lg:py-6">
        <div className="flex items-center gap-3 lg:contents">
          <div className="flex flex-1 flex-col gap-1 lg:flex-none">
            <p className="text-label-sm font-semibold text-lavender-mid">{category.title}</p>
            <p className="text-h3 font-extrabold text-white">
              Question {question.idx + 1} / {total}
            </p>
          </div>
          <Segments total={total} current={question.idx} answered={!!feedback} />
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-caption text-lavender-mid">Score</span>
            <span className="text-h3 font-extrabold text-rose" aria-live="polite">
              {score}
            </span>
          </div>
          {question.timed && remaining != null && (
            <TimerRing remaining={feedback ? remaining : remaining} total={question.question_time ?? 20} size={58} />
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm("Quit this round? It won’t count toward the leaderboard.")) router.push("/play");
            }}
            className="hidden min-h-12 items-center rounded-ui border-2 border-blush bg-plum px-6 py-3 text-label font-semibold text-white hover:bg-plum-end lg:inline-flex"
          >
            Quit round
          </button>
        </div>
        <div className="lg:hidden">
          <Segments total={total} current={question.idx} answered={!!feedback} mobile />
        </div>
      </div>

      <p className="sr-only" aria-live="assertive">
        {feedback ? `${feedbackWord(feedback.outcome)}. The answer is ${feedback.answer}. ${feedback.explanation_short}` : ""}
      </p>

      {!feedback ? (
        <QuestionView
          statement={question.statement}
          guideName={guide.name}
          catchphrase={guide.catchphrase}
          character={category.character}
          disabled={!unlocked || busy}
          onAnswer={(c) => void answer(c)}
        />
      ) : (
        <FeedbackView feedback={feedback} chosen={chosen} timed={question.timed} onNext={() => void next()} busy={busy} nextRef={nextRef} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="bg-plum-gradient min-h-[70vh] text-white">{children}</div>;
}

function feedbackWord(o: FeedbackResult) {
  return { correct: "Correct", incorrect: "Not quite", not_sure: "Answer revealed", timeout: "Time’s up" }[o];
}

/** Figma "Progress: 10 questions" (19:2854): one segment per question. */
function Segments({ total, current, answered, mobile = false }: { total: number; current: number; answered: boolean; mobile?: boolean }) {
  return (
    <div
      className={`${mobile ? "flex" : "hidden lg:flex"} flex-1 items-center gap-1.5`}
      role="progressbar"
      aria-label="Round progress"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current + (answered ? 1 : 0)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 rounded-[4px] ${i < current || (i === current && answered) ? "bg-rose" : i === current ? "bg-white" : "bg-track"}`}
        />
      ))}
    </div>
  );
}

function QuestionView({
  statement,
  guideName,
  catchphrase,
  character,
  disabled,
  onAnswer,
}: {
  statement: string;
  guideName: string;
  catchphrase: string;
  character: CategoryInfo["character"];
  disabled: boolean;
  onAnswer: (c: Choice) => void;
}) {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pb-12 pt-2 lg:flex-row lg:items-start lg:gap-12 lg:px-16 lg:pb-[72px] lg:pt-10">
      <div className="flex items-center gap-3 lg:w-[300px] lg:shrink-0 lg:flex-col lg:gap-4">
        <p className="order-2 rounded-ui bg-white px-3 py-2.5 text-label font-semibold text-ink lg:order-1 lg:px-4 lg:py-3">{catchphrase}</p>
        <div className="order-1 lg:order-2">
          <Character id={character} size={90} className="lg:hidden" />
          <Character id={character} size={280} motion="bob" className="hidden lg:block" />
        </div>
        <p className="order-3 hidden text-label-sm font-semibold text-lavender-mid lg:block">{guideName}</p>
      </div>
      <div className="flex flex-1 flex-col gap-4 lg:gap-7">
        <h1 className="font-display text-[28px] leading-[1.05] lg:text-[56px] lg:leading-[0.98]">{statement}</h1>
        <p className="hidden text-body-lg text-blush lg:block">Is this a myth or a fact?</p>
        <div className="grid grid-cols-2 gap-3 lg:gap-5">
          <AnswerButton choice="MYTH" onClick={() => onAnswer("MYTH")} disabled={disabled} />
          <AnswerButton choice="FACT" onClick={() => onAnswer("FACT")} disabled={disabled} />
        </div>
        <AnswerButton choice="NOT_SURE" onClick={() => onAnswer("NOT_SURE")} disabled={disabled} />
        <p className="text-caption text-lavender-mid">
          Not sure? That’s okay — you’ll see the answer and explanation, and score 0 for this one. Keyboard: M = Myth, F = Fact, N = Not
          sure.
        </p>
      </div>
    </div>
  );
}

function splitFirstSentence(text: string): [string, string] {
  const m = text.match(/^(.+?[.!?])\s+([\s\S]*)$/);
  return m ? [m[1], m[2]] : [text, ""];
}

function FeedbackView({
  feedback: f,
  chosen,
  timed,
  onNext,
  busy,
  nextRef,
}: {
  feedback: Feedback;
  chosen: Choice | null;
  timed: boolean;
  onNext: () => void;
  busy: boolean;
  nextRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const points = useCountUp(f.points);
  const [headline, rest] = splitFirstSentence(f.explanation_short);
  const bonus = f.correct && timed ? f.points - 100 : 0;
  const busted = f.answer === "MYTH";
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 pb-12 pt-4 lg:flex-row lg:items-start lg:px-16 lg:pb-[72px] lg:pt-10">
      <div className="flex flex-1 flex-col items-start gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <FeedbackTag result={f.outcome} />
          {chosen && chosen !== "NOT_SURE" && <p className="text-label font-semibold text-blush">You answered {chosen}</p>}
        </div>
        <p className={`text-[28px] font-black leading-[1.08] tracking-[-0.5px] text-white lg:text-[48px] ${busted ? "opacity-80" : ""}`}>
          {busted ? (
            <span className="bg-[linear-gradient(transparent_52%,var(--color-rose)_52%,var(--color-rose)_68%,transparent_68%)] box-decoration-clone">
              {f.statement}
            </span>
          ) : (
            f.statement
          )}
        </p>
        <p className="text-h3 font-extrabold text-white lg:text-h2">{headline}</p>
        <div className="grid w-full grid-cols-2 gap-3 lg:gap-5" aria-hidden>
          {(["MYTH", "FACT"] as const).map((c) => (
            <div
              key={c}
              className={`flex h-[120px] flex-col items-center justify-center gap-2.5 rounded-answer p-6 lg:h-[168px] ${
                c === "FACT" ? "bg-magenta text-white" : "bg-white text-ink"
              } ${c === f.answer ? "border-4 border-rose" : "opacity-35"}`}
            >
              <span className={`flex rounded-full p-2.5 ${c === "FACT" ? "bg-white text-magenta" : "bg-plum text-white"}`}>
                <Icon name={c === "FACT" ? "check" : "x"} size={28} />
              </span>
              <span className="text-h3 font-extrabold lg:text-h2">{c}</span>
            </div>
          ))}
        </div>
        <div className="flex w-full items-center gap-5 rounded-ui bg-row px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-score font-black text-rose">+{points}</span>
            <span className="text-caption text-lavender-mid">points this question</span>
          </div>
          <p className="flex-1 text-body text-blush">
            {f.correct
              ? timed
                ? `100 for a correct answer + ${bonus} speed bonus`
                : "100 for a correct answer (untimed rounds have no speed bonus)"
              : f.outcome === "timeout"
                ? "Time ran out, so no points this time. No points are ever taken away."
                : f.outcome === "not_sure"
                  ? "No points for “Not sure”, and none taken away. Now you know!"
                  : "No points this time, and none taken away. Now you know!"}
          </p>
        </div>
        {busted && (
          <div className="flex items-center gap-3">
            <Character id="monster" size={80} motion="dissolve" />
            <p className="text-caption text-lavender-mid">Myth busted — the question marks drift away.</p>
          </div>
        )}
      </div>

      <section aria-label="Explanation" className="anim-pop flex flex-col items-start gap-4 rounded-ui bg-white p-6 text-ink lg:w-[520px] lg:shrink-0 lg:p-8">
        <div className="flex w-full items-center gap-4">
          <Character id="bloom" size={110} />
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-label-sm font-semibold text-magenta">Professor Bloom</p>
            <p className="text-h3 font-extrabold">Here’s what the evidence tells us.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label font-semibold">The answer:</span>
          <span className="inline-flex items-center gap-1.5 rounded-tag bg-plum px-2.5 py-1 text-label-sm font-semibold text-white">
            <Icon name={f.answer === "FACT" ? "check" : "x"} size={16} />
            {f.answer}
          </span>
        </div>
        {rest && <p className="text-body-lg">{rest}</p>}
        {f.explanation_long && <p className="text-body">{f.explanation_long}</p>}
        <p className="text-body">Every person’s experience is different. When in doubt, ask and listen.</p>
        <a
          href={f.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-2 border-t border-warm-gray py-3 text-label font-semibold text-magenta underline"
        >
          <Icon name="external" size={18} />
          Source: {f.source_name} (opens in a new tab)
        </a>
        <Button ref={nextRef} size="large" className="w-full" onClick={onNext} disabled={busy}>
          {f.is_last ? "See my results" : "Next question"}
        </Button>
      </section>
    </div>
  );
}
