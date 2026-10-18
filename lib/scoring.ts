/**
 * Scoring formulas (spec §2, §8). The database functions mb_nmbp / mb_quiz_points / mb_pairs_score are the authority;
 * these mirrors exist for display and are tested against the same cases as the SQL.
 */
export const MAX_RAW = { quiz10: 1500, quiz15: 2250, pairs_easy: 2000, pairs_challenge: 3000 } as const;

/** NMBP = round(1000 × raw / max), half up, clamped to 0–1000. */
export function nmbp(raw: number, maxRaw: number) {
  return Math.max(0, Math.min(1000, Math.floor((1000 * raw) / maxRaw + 0.5)));
}

/** 100 for a correct answer + floor(50 × remaining / total) in timed mode. Never negative. */
export function quizPoints(correct: boolean, timed: boolean, remainingSeconds: number, totalSeconds: number) {
  if (!correct) return 0;
  if (!timed) return 100;
  const r = Math.max(0, Math.min(remainingSeconds, totalSeconds));
  return 100 + Math.floor((50 * r) / totalSeconds);
}

/** max(200, 2000 − 25 × seconds − 50 × incorrect flips); Challenge × 1.5 (rounded). */
export function pairsScore(elapsedSeconds: number, incorrectFlips: number, challenge: boolean) {
  const base = Math.max(200, 2000 - 25 * elapsedSeconds - 50 * incorrectFlips);
  return challenge ? Math.round(base * 1.5) : base;
}
