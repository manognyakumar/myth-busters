/** Shared scoring cases — run against both lib/scoring.ts and the SQL functions. */
export const NMBP_CASES: [raw: number, max: number, expected: number][] = [
  [1200, 1500, 800],
  [1800, 2250, 800],
  [1600, 2000, 800],
  [2400, 3000, 800],
  [1000, 1500, 667], // perfect untimed 10-question round
  [1500, 2250, 667], // perfect untimed Ultimate round
  [1500, 1500, 1000],
  [0, 1500, 0],
  [200, 2000, 100],
  [1175, 2000, 588], // 587.5 rounds half up
  [1, 2000, 1], // 0.5 rounds up
  [3, 3000, 1],
];

export const QUIZ_CASES: [correct: boolean, timed: boolean, remaining: number, total: number, expected: number][] = [
  [true, true, 20, 20, 150],
  [true, true, 15, 20, 137],
  [true, true, 0, 20, 100],
  [true, true, 25, 20, 150], // clamped
  [true, false, 20, 20, 100], // untimed: no speed bonus
  [false, true, 20, 20, 0], // never negative
  [false, false, 0, 20, 0],
];

export const PAIRS_CASES: [seconds: number, flips: number, challenge: boolean, expected: number][] = [
  [0, 0, false, 2000],
  [0, 0, true, 3000],
  [40, 2, false, 900],
  [21, 6, false, 1175],
  [72, 0, false, 200],
  [200, 30, false, 200], // floor of 200
  [200, 30, true, 300], // floor applies before ×1.5
  [30, 3, true, 1650],
  [31, 1, true, 1763], // 1175 × 1.5 = 1762.5 → 1763
];
