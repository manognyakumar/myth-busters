/**
 * Upserts reviewed content from supabase/seed/*.json into the database.
 * Usage: npm run db:seed   (reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local or env)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { loadEnv } from "./env";

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");

const db = createClient(url, key, { auth: { persistSession: false } });
const questions = JSON.parse(readFileSync("supabase/seed/questions.json", "utf8"));
const pairs = JSON.parse(readFileSync("supabase/seed/matching_pairs.json", "utf8"));

async function main() {
  const q = await db.from("questions").upsert(questions);
  if (q.error) throw q.error;
  const p = await db.from("matching_pairs").upsert(pairs);
  if (p.error) throw p.error;
  console.log(`Seeded ${questions.length} questions and ${pairs.length} matching pairs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
