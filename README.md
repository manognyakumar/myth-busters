# Myth Busters: Breast Cancer Edition

*Spot the Myth. Discover the Truth. Make a Difference.*

Myth Busters is a self-paced breast cancer awareness game built by **Google Developer Group on Campus - Rochester Institute of Technology of Dubai** for the RIT Dubai 2026 Breast Cancer Awareness Month event.

It has five categories:
- Myth or Fact? — The Basics
- Know the Signs
- Risk Factor Files
- Pink Pairs
- The Ultimate Myth Buster

Every completed round adds normalised Myth Buster Points to **one global leaderboard**.

- Frontend: Next.js 15 (App Router) with React 19, TypeScript and Tailwind CSS v4. The UI is implemented from the Figma file (see `docs/figma-map.md`).
- Backend: Supabase, using Postgres, anonymous auth, RLS and Realtime broadcast.
- Hosting: Netlify.

## How it works

```
Browser ──(anonymous Supabase JWT)──▶ Next.js route handlers (/app/api/*)
                                     │  verify JWT · validate input · per-IP rate limit
                                     ▼
                         Postgres SECURITY DEFINER functions (service_role only)
                         answer checking · server timestamps · scoring · NMBP · totals
                                     │
                                     └──▶ realtime.send('leaderboard_changed') ──▶ open leaderboards refetch
```

- **The server is the only authority.**
  - Answers are checked one at a time.
  - Correct answers are never sent before the player answers.
  - Elapsed time comes from database timestamps.
  - Completion is idempotent, so duplicate clicks award nothing.
- **Fair-play rejections:**
  - Any quiz answer that arrives under 1 s after its question was served rejects the whole round.
  - Pink Pairs rounds under 8 s (Easy) or 20 s (Challenge) are rejected.
- **Rate limits:**
  - 30 rounds per hour per player.
  - A generous per-IP limit: campus Wi-Fi and booth tablets share an IP.
- **RLS is enabled and forced on every table.** The `anon` and `authenticated` roles have no table or function privileges at all.
- **Scoring:**
  - The formulas live in `supabase/migrations/*_schema.sql` (`mb_nmbp`, `mb_quiz_points`, `mb_pairs_score`).
  - `lib/scoring.ts` mirrors them, and both are tested against the same cases in `tests/cases.ts`.

## Run it locally

Prerequisites: Node 22 and Docker Desktop.

```bash
npm install
npx supabase start            # local Postgres/Auth/Realtime (first run downloads images)
npx supabase status           # copy the API URL, anon key and service_role key
cp .env.example .env.local    # fill in the values; set DEV_SERVE_DRAFT=true for local testing
npm run db:seed               # load supabase/seed/*.json (questions + matching pairs)
npm run dev                   # http://localhost:3000
```

`supabase/config.toml` enables anonymous sign-ins and raises the per-IP anonymous sign-in limit to 1,000 per hour for booth use.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Used only for anonymous sign-in and the realtime channel. It has no table access. |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Lets the route handlers call the game RPCs |
| `RECOVERY_PEPPER` | **server only** | Secret used to hash cross-device recovery codes (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | client | Public URL used in the booth "Scan to play" QR code and in metadata |
| `DEV_SERVE_DRAFT` | server | `true` serves unreviewed content. **Must be `false` in production.** |
| `NEXT_PUBLIC_BASE_PATH` | build | Optional, e.g. `/mythbusters` when served under a subpath |

## Content review (required before launch)

All quiz questions and matching pairs live in `supabase/seed/questions.json` and `supabase/seed/matching_pairs.json`. Reviewers can edit these files without touching code.

Everything ships as `draft`. Only `approved` items are served in production.

```bash
npm run content:approve -- --list                                   # see status
npm run content:approve -- --reviewer "University Clinic — Dr. X" --ids b01,b02,p01
npm run content:approve -- --reviewer "University Clinic — Dr. X" --all
npm run content:approve -- --unapprove --ids b05
npm run db:seed                                                     # push to the database
```

To launch, each quiz category needs at least 10 approved questions (Ultimate needs 15 drawn from all categories), and Pink Pairs needs at least 8 approved pairs.

See `CONTENT_TODO.md` for unverified sources and open items.

## Tests

```bash
npm test             # Vitest: scoring units, brand guard (forbidden colours/fonts, incl. built CSS) and
                     # backend integration tests against local Supabase (RLS, idempotency, fair-play, concurrency)
npm run e2e          # Playwright: desktop + tablet + mobile journeys, axe-core WCAG AA checks
```

The integration and e2e tests need `npx supabase start`, `npm run db:seed` and `DEV_SERVE_DRAFT=true` in `.env.local`.

Run `npm run build` before `npm test` so the brand guard also scans the built CSS.

## Deploy (Supabase Free + Netlify)

1. **Supabase.**
   - Create a free project at supabase.com.
   - In *Authentication → Providers*, enable **Anonymous sign-ins**.
   - In *Authentication → Rate Limits*, raise **anonymous sign-ins** (for example to 1,000/hour) for the booth.
   - Push the schema and seed the content:
     ```bash
     npx supabase link --project-ref <ref>
     npx supabase db push
     NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run db:seed
     ```
   - Free projects pause after 7 days without traffic. Open the dashboard (or play a round) before the event.
2. **Netlify.**
   - Import the repo. `netlify.toml` sets the build, and the Next.js runtime is applied automatically.
   - Add the environment variables above, with `DEV_SERVE_DRAFT=false`.
3. **Linking from the club site** (https://gdgocritdubai.netlify.app/). Pick one:
   - **Separate site (simplest).** Deploy as e.g. `gdgoc-mythbusters.netlify.app` and add a button on the club site.
   - **Subpath.** Build the game with `NEXT_PUBLIC_BASE_PATH=/mythbusters`. Then add this to the club site's `_redirects`:
     ```
     /mythbusters/*  https://gdgoc-mythbusters.netlify.app/mythbusters/:splat  200
     ```

## Event day

- **Booth TV:** open `/leaderboard?display=booth`. It shows the same single leaderboard, full-screen, with QR codes to play and to join the club. It updates automatically.
- **Booth tablets:** open `/start?kiosk=1`, or tick *Booth tablet mode* on the Privacy page. After each round the results screen offers **Next player** and resets automatically after 90 s idle, so the next visitor never inherits someone else's scores.
- **CTA conversion:** `select * from cta_events;` gives the anonymous `results_shown` and `join_clicked` totals.

## Still to do before launch

- [x] RIT Dubai logo added at `public/brand/RIT_2018_logo_Dubai.png` (shown on white only).
- [ ] Get clinical review and approval of all content (`CONTENT_TODO.md`).
- [ ] Add a verified UAE health authority (MOHAP or DHA) screening source.
- [ ] Have the club confirm the data retention period shown on the Privacy page.

## Project map

- `app/(site)/*`: pages (Home, Start, Play, Quiz, Pink Pairs, Results, Leaderboard and booth, Progress, How to play, Beyond, Privacy)
- `app/api/*`: route handlers (the only way the browser reaches the backend)
- `components/*`: UI built from the Figma components
- `supabase/migrations`: schema, RLS and game functions
- `supabase/seed`: reviewed content
- `docs/figma-map.md`: Figma node → file map
- `DESIGN_NOTES.md`: deliberate differences from Figma
