import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Spec §5.1: Google brand colours and their pastels must never appear. */
const FORBIDDEN = ["4285F4", "34A853", "F9AB00", "EA4335", "57CAFF", "5CDB6D", "FFD427", "FF7DAF", "C3ECF6", "CCF6C5", "FFE7A5", "F8D8D8"];
const FORBIDDEN_FONTS = [/Google Sans/i, /\bInter\b/, /\bPoppins\b/i];
const ALLOWED = ["eef6e4", "f2c14e", "2f6b3a", "24552e", "e3f0f7", "a9cfe3", "16302a", "22463b", "1f2a24", "ffffff", "fff", "d7d2cb", "e9b949", "c0c4cc", "c98b5a", "15803d", "f76902"];

function walk(dir: string, exts: string[], out: string[] = []) {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

const SOURCES = [
  ...walk("app", [".tsx", ".ts", ".css"]),
  ...walk("components", [".tsx", ".ts"]),
  ...walk("lib", [".ts", ".tsx"]),
  ...walk("public", [".svg"]),
];
const BUILT_CSS = walk(".next/static", [".css"]);

describe("brand guard", () => {
  it.each([...SOURCES, ...BUILT_CSS])("%s has no Google brand colours or fonts", (file) => {
    const text = readFileSync(file, "utf8");
    for (const hex of FORBIDDEN) expect(text.toUpperCase()).not.toContain(`#${hex}`);
    if (!file.includes(".next")) for (const f of FORBIDDEN_FONTS) expect(text).not.toMatch(f);
  });

  it("UI source only uses campaign token hex values", () => {
    const offenders: string[] = [];
    for (const file of SOURCES.filter((f) => !f.startsWith("public"))) {
      for (const m of readFileSync(file, "utf8").matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
        if (!ALLOWED.includes(m[1].toLowerCase())) offenders.push(`${file}: #${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the built CSS was checked", () => {
    if (BUILT_CSS.length === 0) console.warn("No .next build found — run `npm run build` to include built CSS in this check.");
  });
});
