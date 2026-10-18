/**
 * Marks reviewed content as approved in supabase/seed/*.json (the source of truth), then run `npm run db:seed`.
 *
 *   npm run content:approve -- --reviewer "University Clinic (Dr. Name)" --ids b01,b02,p01
 *   npm run content:approve -- --reviewer "..." --all
 *   npm run content:approve -- --list            # show review status
 *   npm run content:approve -- --unapprove --ids b05
 */
import { readFileSync, writeFileSync } from "node:fs";

type Item = { id: string; review_status: string; reviewer: string | null; reviewed_at: string | null; statement?: string; card_a?: string };
const files = ["supabase/seed/questions.json", "supabase/seed/matching_pairs.json"];
const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const value = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};

if (flag("list")) {
  for (const f of files) {
    const items: Item[] = JSON.parse(readFileSync(f, "utf8"));
    for (const it of items) console.log(`${it.review_status.padEnd(8)} ${it.id.padEnd(4)} ${(it.statement ?? it.card_a ?? "").slice(0, 80)}`);
  }
  process.exit(0);
}

const reviewer = value("reviewer");
const ids = value("ids")?.split(",").map((s) => s.trim()).filter(Boolean);
const all = flag("all");
const unapprove = flag("unapprove");
if (!unapprove && !reviewer) throw new Error('--reviewer "Name / organisation" is required');
if (!all && !ids?.length) throw new Error("Pass --ids a,b,c or --all");

let changed = 0;
for (const f of files) {
  const items: Item[] = JSON.parse(readFileSync(f, "utf8"));
  for (const it of items) {
    if (!all && !ids!.includes(it.id)) continue;
    if (unapprove) Object.assign(it, { review_status: "draft", reviewer: null, reviewed_at: null });
    else Object.assign(it, { review_status: "approved", reviewer, reviewed_at: new Date().toISOString() });
    changed++;
  }
  writeFileSync(f, JSON.stringify(items, null, 2) + "\n");
}
console.log(`${unapprove ? "Unapproved" : "Approved"} ${changed} item(s). Now run: npm run db:seed`);
