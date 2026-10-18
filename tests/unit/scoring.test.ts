import { describe, expect, it } from "vitest";
import { MAX_RAW, nmbp, pairsScore, quizPoints } from "@/lib/scoring";
import { NMBP_CASES, PAIRS_CASES, QUIZ_CASES } from "../cases";

describe("NMBP normalisation", () => {
  it.each(NMBP_CASES)("nmbp(%i, %i) = %i", (raw, max, expected) => expect(nmbp(raw, max)).toBe(expected));

  it("every mode maps its full range onto 0–1000", () => {
    for (const max of Object.values(MAX_RAW)) {
      expect(nmbp(0, max)).toBe(0);
      expect(nmbp(max, max)).toBe(1000);
      for (let raw = 0; raw <= max; raw += 37) {
        const v = nmbp(raw, max);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1000);
      }
    }
  });

  it("an untimed perfect 10-question quiz earns 667", () => {
    expect(nmbp(10 * quizPoints(true, false, 0, 20), MAX_RAW.quiz10)).toBe(667);
  });
});

describe("quiz points", () => {
  it.each(QUIZ_CASES)("correct=%s timed=%s remaining=%i/%i → %i", (c, t, r, total, e) => expect(quizPoints(c, t, r, total)).toBe(e));
});

describe("Pink Pairs score", () => {
  it.each(PAIRS_CASES)("%is, %i flips, challenge=%s → %i", (s, f, ch, e) => expect(pairsScore(s, f, ch)).toBe(e));

  it("maximum raw scores match the spec", () => {
    expect(pairsScore(0, 0, false)).toBe(MAX_RAW.pairs_easy);
    expect(pairsScore(0, 0, true)).toBe(MAX_RAW.pairs_challenge);
  });
});
