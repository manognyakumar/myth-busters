# MASTER BUILD PROMPT: MYTH BUSTERS — BREAST CANCER AWARENESS GAME

> Paste everything below this line into Claude Code.

---

## 0. Who this is for (read first)

This game is built and presented by **Google Developer Group on Campus - Rochester Institute of Technology of Dubai** for the RIT Dubai 2026 Breast Cancer Awareness Month event.

Club website: https://gdgocritdubai.netlify.app/
Club sign-up form: https://forms.gle/5tkfQ8CGDw3QFPLy5

Club naming rules (non-negotiable):

- Always write the club's full name exactly as: **Google Developer Group on Campus - Rochester Institute of Technology of Dubai**.
- The full name must appear on the homepage, every round-results screen, the leaderboard page, the footer, the page `<title>` / Open Graph metadata, and the About/Privacy page.
- The short form **GDGOC RIT Dubai** may be used only where space is tight (browser tab, small mobile header, social share text), and only after the full name has appeared on that page.
- Do **not** use Google brand colours, the Google logo, the Google Developer Groups logo, or the Google Sans / Google Sans Mono typefaces anywhere.
- Visual identity follows **RIT Dubai** brand guidelines, adapted to a pink breast cancer awareness campaign (section 5).

---

## 1. Project Overview

Build a complete, functional, responsive educational web game called **Myth Busters: Breast Cancer Edition**.

**Tagline:** "Spot the Myth. Discover the Truth. Make a Difference."

The purpose of this application is to raise breast cancer awareness through interactive educational games that help people distinguish myths from facts, recognize possible warning signs, understand risk factors, and learn practical awareness actions.

The experience should combine:

- The interactive educational experience and visual clarity of Nearpod (without copying Nearpod branding or assets).
- The engaging mechanics of modern educational games.
- Quiz-based myth-busting challenges.
- A calm, accessible memory-card matching game.
- Original animated characters.
- A polished pink-and-plum breast cancer awareness theme built on RIT Dubai brand rules.
- **One shared global leaderboard combining results from all five categories.**
- Educational explanations that reinforce learning after every interaction.
- A clear call to action to join the club after every completed round.

Build a real working web application, not a static design or non-functional prototype.

### Essential requirements

This is an asynchronous, self-paced game.

- Anyone can visit the website and play immediately.
- No host, teacher, moderator, or administrator is needed during gameplay.
- No room codes, joining codes, lobbies, or scheduled sessions.
- Players do not need to start or finish at the same time.
- Every player completes their own independent game session.
- Results are saved automatically to a persistent backend.
- The global leaderboard updates automatically.
- Players can return at any time to play additional rounds.
- All five categories contribute to **one overall leaderboard**.
- No account creation is required before playing.

The game must work for individual visitors at an awareness booth, university campaigns, QR-code visitors, and people accessing the website from home.

---

## 2. The Five Game Categories

Create exactly five main game categories. Display them as prominent cards on the category-selection screen.

### Category 1: Myth or Fact? — The Basics

**Character:** Detective Rosie · **Difficulty:** Easy · **Game type:** Quiz

Players investigate common misconceptions about breast cancer and decide whether each statement is a MYTH or FACT.

Topics: who can develop breast cancer; family history and inherited risk; whether every breast lump is cancerous; whether breast cancer always causes pain; basic breast cancer awareness.

Gameplay: 10 questions per round; two prominent answer choices, MYTH and FACT; a "Not sure" option; instant feedback and explanations; optional countdown timer; final results and contribution to the global leaderboard.

### Category 2: Know the Signs

**Character:** Professor Bloom · **Difficulty:** Easy to medium · **Game type:** Quiz

Players learn about possible breast cancer warning signs and the importance of noticing changes.

Topics: new or unusual breast lumps; changes in breast shape or size; skin or nipple changes; possible nipple discharge; why breast cancer may not always cause pain; when to seek professional medical evaluation.

Gameplay: 10 questions per round; instant answer feedback; clear medical explanations; trusted information sources; optional countdown timer; final results and contribution to the global leaderboard.

Use reassuring language. Do not imply that every breast change indicates cancer or that the absence of symptoms rules it out. Do not include images of bodies or step-by-step self-examination instructions; point players to a healthcare professional or the University Clinic instead.

### Category 3: Risk Factor Files

**Character:** Myth Monster · **Difficulty:** Medium · **Game type:** Quiz

Players investigate factors associated with breast cancer risk and distinguish evidence-based information from misleading claims.

Topics: age and risk; family history; inherited genetic variants; personal medical history; other established risk factors; why having no known risk factors does not eliminate risk.

Gameplay: 10 questions per round; MYTH and FACT choices; instant explanations and trusted sources; optional countdown timer; final results and contribution to the global leaderboard.

Do not imply that a risk factor guarantees a diagnosis or that this game can calculate a person's individual medical risk.

### Category 4: Pink Pairs

**Character:** Pinky · **Difficulty:** Easy or Challenge · **Game type:** Memory-card matching game

Pink Pairs is a calm, accessible memory game suitable for all ages, including visitors who do not enjoy timed quizzes. Players flip cards to match related information in two formats.

**Format A: Myth and Fact** — match a common myth with its medically supported correction.
Example: "Breast cancer only happens to women." ↔ "Men can develop breast cancer too."

**Format B: Awareness Theme and Action** — match an awareness theme with an appropriate action. These four themes come from the official RIT Dubai event poster and must be used as written:

- **LEARN** — Know what is normal for you.
- **CHECK** — A change doesn't always mean cancer, but noticed changes are worth checking with a healthcare professional.
- **SUPPORT** — You are not alone. A kind conversation can encourage someone to seek help.
- **TAKE CARE** — Your health matters. Make time for regular check-ups and healthy habits.

#### Pink Pairs modes

**Easy Mode:** 8 face-down cards; 4 matching pairs; no countdown timer; relaxed gameplay with large cards.

**Challenge Mode:** 16 face-down cards; 8 matching pairs; track elapsed time and incorrect flips; slightly more challenging card layout.

Maintain at least 9 reviewed matching pairs: 5 myth-and-correction pairs and 4 theme-and-action pairs. Challenge Mode uses 8 pairs per attempt and rotates the available pairs across replays.

The five myth pairs should start from the event poster's Myth or Fact section (four myths, plus its one fact reworded as a myth to correct):

| Myth card | Correction card |
| --- | --- |
| "I don't have a family history, so I'm not at risk." | Family history is one of many risk factors. Anyone can develop breast cancer. |
| "A breast lump always means cancer." | Many changes are not cancer, but new or persistent ones should be checked. |
| "Screening recommendations are the same for everyone." | Screening depends on age, risk factors and medical history. Ask a professional. |
| "Breast cancer only happens to women." | Men can develop breast cancer too. |
| "Finding a change early doesn't matter." | Noticing a change early and getting advice can lead to better outcomes. |

#### Pink Pairs gameplay

1. Display a short instruction screen.
2. Shuffle the cards and display them face down.
3. The player flips one card.
4. The player flips a second card.
5. If the cards match, keep them face up.
6. If they do not match, briefly show both cards and turn them face down again.
7. Prevent additional flips while unmatched cards are being turned back over.
8. When a match is found, enlarge the pair for approximately two seconds.
9. Display the full educational explanation and identify the matching relationship.
10. Provide an optional audio playback button to read the pair aloud (Web Speech API).
11. Continue until every pair has been matched.
12. Display a completion screen and a mini fact sheet listing every pair from that attempt.

The match explanation and final fact sheet are essential learning features, not optional decorations.

#### Pink Pairs scoring

- Starting score: 2,000 points.
- Subtract 25 points per elapsed second.
- Subtract 50 points per incorrect two-card flip.
- Minimum completed base score: 200 points.
- Challenge Mode multiplier: ×1.5.

`Base score = max(200, 2000 - (25 × elapsed seconds) - (50 × incorrect flips))`

`Challenge score = round(base score × 1.5)`

Elapsed time is measured on the server (attempt start to completion timestamps), not trusted from the browser. Easy Mode must not show a countdown timer to the player.

### Category 5: The Ultimate Myth Buster

**Character:** Captain Courage · **Difficulty:** Challenging · **Game type:** Mixed quiz

The final mixed challenge for players who want to test what they have learned across the other categories.

Include questions about: basic myths and facts; warning signs; risk factors; breast cancer in men; screening and early detection; misinformation and common misconceptions; appropriate health-seeking actions.

Gameplay: 15 questions per round; a balanced mixture of topics and difficulties; instant explanations and trusted sources; optional countdown timer; final results, achievements, and contribution to the global leaderboard.

Questions should test understanding rather than rely on confusing language or medically misleading statements.

---

## 3. Original Character System

Create five original illustrated characters (SVG, so they scale and can be animated with CSS) that guide players throughout the experience. All characters use the campaign palette in section 5; none may use Google brand colours.

| Character | Appearance | Personality | Role | Catchphrase | Accent colour |
| --- | --- | --- | --- | --- | --- |
| **Pinky** — Awareness Ambassador | Friendly pink awareness-ribbon mascot with expressive eyes and small hands | Warm, welcoming, encouraging | Greets players, introduces Pink Pairs, celebrates achievements | "Every fact you learn makes a difference!" | Rose `#EC4899` |
| **Detective Rosie** — Myth Hunter | Pink detective with magnifying glass, detective hat and ribbon badge | Curious, clever, observant | Guides Myth or Fact? — The Basics; presents statements as mysteries | "Let's investigate this claim!" | Magenta `#BE185D` |
| **Professor Bloom** — Fact Expert | Friendly professor in a white lab coat with a pink ribbon pin | Calm, knowledgeable, reassuring | Explains answers, introduces warning signs | "Here's what the evidence tells us." | Plum `#30152F` + white |
| **Myth Monster** — Misinformation Mascot | Playful lavender cloud creature surrounded by question marks | Mischievous but harmless | Represents misconceptions and misleading claims | "Sounds convincing... but is it true?" | Lavender `#C4B5FD` |
| **Captain Courage** — Achievement Hero | Friendly superhero with a pink cape and awareness ribbon | Energetic, positive, motivational | Introduces The Ultimate Myth Buster, celebrates achievements | "Knowledge is a powerful first step!" | Deep rose `#9D174D` |

Animations:

- Pinky: waving, jumping, thumbs-up, celebrating completed rounds.
- Detective Rosie: examining statements, pointing toward answer cards, inspecting clues.
- Professor Bloom: revealing information cards, highlighting facts, lightbulb icon.
- Myth Monster: looking puzzled, presenting questionable claims, dissolving into harmless question marks when the truth is revealed.
- Captain Courage: victory poses, badge reveals, subtle celebration effects.

Never portray people who believe myths as foolish. Myth Monster represents misinformation, not the people who encounter it.

### Character selection

Before the first game, allow players to choose a nickname and favourite character. Save the selected character to the player's anonymous profile and allow it to be changed later. Each character must have a consistent illustration, accent colour, expressions, and a circular leaderboard avatar.

---

## 4. Homepage and Navigation

Create a polished homepage featuring Pinky and Detective Rosie.

- **Top strip:** a white strip carrying the RIT Dubai logo (if an approved logo file is supplied in `/public/brand/`; otherwise leave a clearly marked placeholder and list it in the setup notes) and the club's full name: *Google Developer Group on Campus - Rochester Institute of Technology of Dubai*.
- **Main heading:** MYTH BUSTERS
- **Subtitle:** Breast Cancer Awareness Edition
- **Tagline:** "Spot the Myth. Discover the Truth. Make a Difference."
- **Description:** "Think you know the facts about breast cancer? Investigate common myths, discover the truth, match important information, and learn how awareness can make a difference."

### Main buttons

- **PLAY NOW** — opens the category selection screen.
- **PINK PAIRS** — starts Pink Pairs directly.
- **GLOBAL LEADERBOARD** — opens the one shared leaderboard.
- **MY PROGRESS** — personal results and achievements.
- **HOW TO PLAY** — explains the quiz and memory game.
- **BEYOND THE GAME** — trusted awareness resources.
- **JOIN OUR CLUB** — secondary button opening https://forms.gle/5tkfQ8CGDw3QFPLy5 in a new tab.

Include a character gallery, a short awareness message ("You matter. Your health matters."), and the medical-information disclaimer.

### Category cards

Display exactly these five main categories:

1. Myth or Fact? — The Basics
2. Know the Signs
3. Risk Factor Files
4. Pink Pairs
5. The Ultimate Myth Buster

Each card shows its character, difficulty, a short description, and a clear Play button. Keep the leaderboard, profile, and awareness resources in the main navigation rather than treating them as additional game categories.

### Footer (every page)

- "Built by Google Developer Group on Campus - Rochester Institute of Technology of Dubai" linking to https://gdgocritdubai.netlify.app/
- "Join our club" link to https://forms.gle/5tkfQ8CGDw3QFPLy5
- "Have questions? Visit the University Clinic."
- The short medical disclaimer and a link to Privacy.

---

## 5. Visual Design and Brand System

The visual identity follows **RIT Dubai brand guidelines** (one typeface, nearly square corners, flat surfaces, strict text-on-colour contrast pairs, plain friendly voice), with the RIT orange lead colour replaced by **campaign pink** for Breast Cancer Awareness Month. It must feel premium, playful and suitable for university students: friendly without looking childish, informative without looking clinical.

### 5.1 Colour tokens

Define these once as CSS variables / Tailwind theme tokens and use only these. Do not hard-code other hex values.

| Token | Hex | Role |
| --- | --- | --- |
| `blush` | `#FCE7F3` | Light page bands, card tints, matched-card fill |
| `rose` | `#EC4899` | Accents, progress bars, icons, large headlines on dark plum, confetti |
| `magenta` | `#BE185D` | **Primary buttons**, links on white, Pink Pairs card backs, key brand fields |
| `magenta-deep` | `#9D174D` | Hover / pressed state for magenta |
| `lavender` | `#EDE9FE` | Secondary panels, "Not sure" button, info cards |
| `lavender-mid` | `#C4B5FD` | Myth Monster, secondary text on plum, chart accents |
| `plum` | `#30152F` | Dark backgrounds for quiz and leaderboard screens |
| `ink` | `#292235` | Main body text on light backgrounds |
| `white` | `#FFFFFF` | Page background, card faces |
| `warm-gray` | `#D7D2CB` | Borders and dividers (from the RIT palette) |
| `gold` / `silver` / `bronze` | `#E9B949` / `#C0C4CC` / `#C98B5A` | Podium only |
| `success` | `#15803D` | Correct-answer tag (always with icon + word) |
| `rit-orange` | `#F76902` | **Only** inside the official RIT logo. Never as a UI colour. |

Forbidden colours: Google Blue `#4285F4`, Google Green `#34A853`, Google Yellow `#F9AB00`, Google Red `#EA4335` and their halftones/pastels (`#57CAFF`, `#5CDB6D`, `#FFD427`, `#FF7DAF`, `#C3ECF6`, `#CCF6C5`, `#FFE7A5`, `#F8D8D8`). Do not use any red/green/blue/yellow four-colour combinations.

### 5.2 Approved text-on-colour pairs (contrast ratio)

Use only these pairs for text. Body text must be 4.5:1 or higher.

| Text | Background | Ratio | Use |
| --- | --- | --- | --- |
| `ink` | `white` | 15.3 | Body text |
| `ink` | `blush` / `lavender` | 13.0 / 12.9 | Text on tinted cards |
| `white` | `plum` | 16.5 | Text on quiz and leaderboard screens |
| `blush` | `plum` | 14.0 | Secondary text on plum |
| `lavender-mid` | `plum` | 8.9 | Captions on plum |
| `rose` | `plum` | 4.7 | Headlines and highlighted numbers on plum |
| `white` | `magenta` | 6.0 | Primary button labels |
| `magenta` | `white` / `blush` | 6.0 / 5.1 | Links, tags, emphasised words |
| `plum` | `rose` | 4.7 | Text on rose fills (badges, chips) |

Never use: white text on `rose` (3.5, fails), small `rose` text on white, or any logo on a pink or plum background (place the RIT logo on a white or black strip only).

### 5.3 Typography

- **Archivo** (Google Fonts) is the only typeface, matching the RIT Dubai guide. Load weights 400, 600, 800, 900 and the width axis.
- Hero / page titles: Archivo Black 900 or ExtraBold 800 at 125% width (`font-stretch: 125%`), tight leading (~1.0), sentence case, left-aligned (centered only on the homepage hero and podium).
- Body: Archivo Regular 400, line height 1.6, line length 45–65 characters.
- Labels and buttons: Archivo SemiBold 600.
- Captions: Regular 400 in `lavender-mid` on plum or `ink` at 70% opacity on light.
- Do not use Inter, Poppins, Google Sans or Google Sans Mono.

### 5.4 Shape, surface and motion

- Corners: 6px on buttons, cards and panels; 4px on tags and chips; answer buttons may use 12px for a friendlier game feel. Pink Pairs cards 10px.
- Borders: thin `warm-gray` on light cards; 2px `magenta` on important boxes.
- Surfaces are flat. One campaign exception: a single subtle `plum → #4A1D45` background gradient is allowed on the quiz, results and leaderboard screens. No drop shadows larger than a 1px hairline, no glows, no glassmorphism.
- Celebrations: small confetti (rose, blush, lavender-mid, white), star bursts and badge reveals lasting under 1.5 seconds. No flashing; nothing above 3 flashes per second.
- Under `prefers-reduced-motion`, replace all motion with fades or instant state changes.

### 5.5 Screen styling

- Homepage, How to Play, Beyond the Game, Privacy: white background with blush bands.
- Quiz, feedback, results and leaderboard: plum background, white text, rose highlights.
- MYTH button: plum-outlined white card with an ✕ icon and the word MYTH. FACT button: magenta card with a ✓ icon and the word FACT. "Not sure": lavender card with a ? icon. Correctness is always shown by icon + word + colour, never colour alone.
- Progress bar: rose fill on a 20% white track. Timer: a ring in rose that turns `blush` in the last 5 seconds (no red).

### 5.6 Pink Pairs cards

- **Card backs:** `magenta` with a thin white awareness-ribbon outline.
- **Card faces:** white with `ink` text and an optional simple line icon in `magenta`.
- **Matched cards:** `blush` fill, ✓ icon, and a "Matched" label.
- Card text 12 words or fewer; full explanations go in the match pop-up.

### 5.7 Voice

Plain, friendly and direct; talk to players as "you". Short headlines that say what the player can do. No emoji in headlines (one at most in a caption). Calm, non-alarming tone: "A change is worth checking", never "A lump means cancer".

### 5.8 Accessibility

- All text meets the pairs in 5.2 (WCAG AA).
- Never rely on colour alone to communicate correctness.
- Full keyboard navigation (answer keys: M = Myth, F = Fact, N = Not sure; arrow keys + Enter in Pink Pairs) and screen-reader labels; live regions announce results.
- Visible 3px `rose` focus ring with 2px offset.
- Support reduced motion.
- Touch targets at least 48 × 48px, suitable for booth tablets.
- Untimed quiz mode available everywhere.

---

## 6. Quiz Gameplay

The Basics, Know the Signs, and Risk Factor Files each have 10 questions. The Ultimate Myth Buster has 15 questions.

The server randomly selects questions from the relevant reviewed question bank, avoiding questions the player completed in their last 2 attempts of that category where enough questions exist.

### Quiz screen

Display: category name; question number (e.g. 3 / 10); statement; relevant character; progress bar; optional countdown timer (default 20 seconds per question); MYTH and FACT answer buttons; "Not sure" option; short instructions.

### Answer flow

1. Lock the answer.
2. Stop the question timer.
3. Send the answer to the server, which checks it and returns correctness, points and the explanation.
4. Show whether the answer is correct (icon + word + colour).
5. Display Professor Bloom with a simple explanation.
6. Provide a trusted source link (opens in a new tab).
7. Animate the score earned.
8. Display a Next Question button.

"Not sure" reveals the answer and explanation and awards zero points. If the timer expires, reveal the answer and explanation and award zero points. Players can turn the timer off before a round starts. Never deduct points for an incorrect answer.

---

## 7. Question Bank and Medical Accuracy

Create at least 50 quiz questions across the quiz categories, stored as seed data (`supabase/seed/questions.json` or SQL) so reviewers can edit content without touching code.

Each question must contain: unique ID; statement; correct answer (MYTH or FACT); short explanation; optional detailed explanation; source name and URL; category; difficulty; review status (`draft` or `approved`); reviewer; review date.

Only questions with `review status = approved` are served to players. Seed all questions as `draft` with `reviewer = null`, add an admin-free CLI script (`npm run content:approve`) that marks reviewed items approved, and a `DEV_SERVE_DRAFT=true` flag for local testing. The club will have the University Clinic or another qualified reviewer approve content before launch.

Topics must include family history, genetic risk, warning signs, breast cancer in men, age, risk factors, screening, early detection, misinformation, and seeking professional medical advice. Include all five myths and the four themes from the event poster.

### Example questions

| Statement | Answer | Explanation |
| --- | --- | --- |
| Only people with a family history of breast cancer can develop it. | MYTH | Family history can increase risk, but many people diagnosed have no known family history. |
| Men can develop breast cancer. | FACT | Breast cancer is much more common in women, but men can also develop it. |
| Every breast lump is cancerous. | MYTH | Many breast lumps are benign, but a new or unusual lump should be checked by a healthcare professional. |
| Breast cancer always causes pain. | MYTH | Breast cancer may not cause pain. The absence of pain does not rule it out. |
| Breast cancer can occur in younger adults. | FACT | Risk generally increases with age, but younger adults can also develop breast cancer. |
| A new change in breast shape, skin, or nipple appearance may need medical evaluation. | FACT | New or persistent breast changes should be assessed by a healthcare professional. |
| Having no symptoms means breast cancer is impossible. | MYTH | Breast cancer may be present before symptoms appear. Screening recommendations depend on age, individual risk, and local guidance. |
| Family history is the only factor that influences breast cancer risk. | MYTH | Age, inherited genetic variants, personal medical history, and other factors can influence risk. |
| Screening recommendations are the same for everyone. | MYTH | Screening depends on your age, personal risk factors and medical history. A healthcare professional can advise what is right for you. |

### Source requirements

Use reputable sources such as the World Health Organization, the US National Cancer Institute, relevant UAE health authorities (e.g. Dubai Health Authority, UAE Ministry of Health and Prevention), and other established cancer-awareness and healthcare organizations. Every medical claim must cite a real page that supports it; verify each URL resolves. Do not fabricate statistics, citations, or medical guidance. If you cannot verify a source for a claim, leave the question in `draft` and list it in `CONTENT_TODO.md`.

The game provides general educational information, not a diagnostic tool or a substitute for professional medical advice.

---

## 8. Unified Scoring System — One Leaderboard for Everything

**This is one of the most important requirements of the application.**

Create **ONE global leaderboard for all five categories combined**. Do not create separate leaderboards for quizzes, Pink Pairs, difficulty levels, categories or time periods. The leaderboard shows a single ranking of players by total accumulated **Myth Buster Points**.

### Why normalization is required

Different modes have different scoring ranges: a 10-question quiz can award up to 1,500 raw points, the 15-question Ultimate Myth Buster up to 2,250, and Pink Pairs has its own time-and-mistake formula. Raw scores must not be added directly. Convert each completed round into **Normalized Myth Buster Points (NMBP)** on a common 0–1,000 scale.

### Normalization formula

`NMBP = round(1000 × raw score / maximum possible raw score)` (round half up; clamp to 0–1,000)

Maximum raw score per mode:

| Mode | Max raw score |
| --- | --- |
| 10-question quiz (timed or untimed) | 1,500 |
| 15-question Ultimate Myth Buster (timed or untimed) | 2,250 |
| Pink Pairs Easy | 2,000 |
| Pink Pairs Challenge | 3,000 |

**Untimed rule:** untimed quizzes earn no speed bonus but are normalized against the same timed maximum. A perfect untimed 10-question round therefore earns 1,000 / 1,500 → 667 NMBP. This keeps untimed play available without advantaging it.

For Pink Pairs, the Challenge multiplier applies before normalization.

Worked examples (illustrations of the calculation, not player records): a quiz score of 1,200/1,500 → 800 NMBP; Ultimate 1,800/2,250 → 800; Pink Pairs Easy 1,600/2,000 → 800; Pink Pairs Challenge 2,400/3,000 → 800.

### Overall leaderboard scoring

`Total Myth Buster Points = sum of NMBP from all valid completed attempts`

- Playing more categories gives more chances to earn points.
- Additional rounds can improve a player's position.
- Pink Pairs and quiz results contribute to the same total.
- All valid results are saved against the player's persistent anonymous ID.

### Score integrity

- The server is the only authority on answers, raw scores, elapsed time, NMBP and totals.
- Answers are checked server-side one at a time; correct answers are never sent to the browser before the player answers.
- Each attempt has a server-issued ID; completion is idempotent (unique constraint on attempt ID). Duplicate completions and repeated clicks award nothing.
- Reject impossible attempts: quiz rounds where any answer arrives under 1 second after the question was served, Pink Pairs Easy under 8 seconds, Challenge under 20 seconds.
- Rate-limit attempt creation per player (e.g. 30 per hour) and per IP.
- Record category, mode, difficulty, timed/untimed, raw score, NMBP, elapsed time, accuracy, completion time and player ID.
- Clients cannot write to `game_attempts`, `answers` or totals directly; only server functions can.

### Quiz raw scoring

- Correct answer: 100 points. Incorrect, "Not sure" or timed-out: 0 points.
- Correct-answer speed bonus (timed mode only): `floor(50 × remaining time / total question time)`, computed from server timestamps.
- Maximum raw score: 1,500 (10 questions), 2,250 (15 questions).

### Pink Pairs raw scoring

As defined in section 2. Maximum raw score: Easy 2,000, Challenge 3,000.

### Tie-breaking rules

1. Higher average NMBP per completed attempt.
2. More distinct categories completed.
3. More completed rounds.
4. Earlier time the tied total was reached.

Display total Myth Buster Points prominently, with completed rounds and categories explored as supporting statistics.

---

## 9. Round Results Screen and Club Call to Action

Every completed round (all four quizzes and both Pink Pairs modes) ends on a results screen showing:

1. Raw score, NMBP earned for this round, new total Myth Buster Points, and new global rank (with an animated count-up).
2. Correct / incorrect / not-sure breakdown (quizzes) or time and incorrect flips (Pink Pairs).
3. A review list of every statement or pair with its explanation and source link.
4. Any achievement earned.
5. Three key takeaways: "Know what is normal for you", "Noticed a change? Talk to a healthcare professional", "Have questions? Visit the University Clinic."
6. **Club call-to-action panel** (magenta panel, white text):
   - Heading: "Enjoyed Myth Busters?"
   - Text: "This game was built by Google Developer Group on Campus - Rochester Institute of Technology of Dubai. Join us to build more projects like this."
   - Primary button **Join our club** → https://forms.gle/5tkfQ8CGDw3QFPLy5 (new tab, `rel="noopener"`).
   - A QR code of the same link beside the button for booth-tablet players (generate client-side, e.g. `qrcode` package).
7. Buttons: Play again, Try another category, View global leaderboard.

Track (anonymously, server-side) how many results screens are shown and how many Join-our-club clicks occur, so the club can see the conversion rate.

---

## 10. Global Leaderboard Design

Create one dedicated leaderboard page titled **GLOBAL MYTH BUSTERS**.

Subtitle: "One community. Five challenges. Every fact makes a difference."
Under the subtitle in small text: "Hosted by Google Developer Group on Campus - Rochester Institute of Technology of Dubai".

### Main display

- One shared ranking of all players (top 50, paginated beyond).
- Top-three podium: gold (1st), silver (2nd), bronze (3rd), with each player's character avatar beside their podium.
- Each row: rank, nickname, character avatar, total Myth Buster Points, completed rounds, categories explored, average NMBP.
- A Play Now button.
- Plum background with the single subtle gradient allowed in 5.4, rose highlights, no glows. Animations are subtle and don't repeatedly interrupt visitors.

### Booth display mode

`/leaderboard?display=booth` shows the same leaderboard full-screen for a TV or laptop at the booth: larger type, no navigation, auto-updating, with a "Scan to play" QR code linking to the game homepage and a "Join our club" QR code linking to https://forms.gle/5tkfQ8CGDw3QFPLy5. This is a display of the same single leaderboard, not a separate ranking.

### My Ranking

A clearly visible **My Ranking** section within the same page: current rank, total Myth Buster Points, completed rounds, categories explored, achievements, and a Continue playing button. It is a personal view of the same global leaderboard.

### Automatic updates

Whenever a player completes a valid game: validate on the backend → calculate NMBP → save the attempt → add points to the player's total exactly once (in the same transaction) → recalculate rank → push the update to open leaderboards via realtime subscriptions (poll every 10 seconds as fallback) → show the player's updated total and rank. No manual refresh.

Do not invent player names or scores to fill the leaderboard. With few or no players, show the genuine results and an empty-state invitation ("Be the first Myth Buster!").

---

## 11. Player Identity and Privacy

- Players play without creating an account. On first visit they choose a nickname (3–16 characters, letters/numbers/spaces, profanity filtered server-side, unique case-insensitively) and a character, then start immediately.
- Use Supabase Anonymous Sign-in to create a persistent anonymous player ID.
- Do not request a real name, phone number, email address, student ID or medical history. Collect no personal health information.
- Display only nicknames and character avatars publicly.
- Allow nickname and character changes.
- The Privacy page explains in plain language what is stored (nickname, character, scores, anonymous ID, timestamps), why, and for how long, and states that browser storage alone cannot recognize a player on another device.
- Offer optional cross-device recovery: a one-time recovery code shown on the My Progress page that the player can enter on another device. Do not require email.
- Row Level Security prevents players from reading private data or editing other people's profiles, attempts or scores.

---

## 12. Personal Progress and Achievements

A My Progress page that uses the same data as the global leaderboard, showing: total Myth Buster Points; current global rank; completed rounds; categories explored; personal best NMBP; quiz accuracy; Pink Pairs best times; earned achievements; recent attempts.

Achievements (awarded only after server verification):

| Achievement | Rule |
| --- | --- |
| First Investigation | Complete your first quiz. |
| Myth Hunter | Correctly identify 5 myths in one attempt. |
| Fact Finder | Correctly identify 5 fact statements in one attempt. |
| Perfect Round | Answer every question correctly in a round. |
| Pink Pair Pro | Complete Pink Pairs Challenge Mode. |
| Awareness Champion | Complete 10 rounds. |
| Personal Best | Beat your previous best NMBP. |
| Knowledge Explorer | Complete all five categories. |

Badge style: circular, magenta or rose fill with a white line icon; locked badges in `lavender` with a lock icon.

---

## 13. Beyond the Game — Awareness Resources

A page called **Beyond the Game** with: general breast cancer information; common warning signs; risk factors; screening guidance from appropriate health authorities; guidance to contact a healthcare professional about new or concerning changes; supportive information for people affected by breast cancer; links to the World Health Organization, National Cancer Institute and relevant UAE health authorities.

Organize it around the event poster's four themes: **Learn**, **Check**, **Support**, **Take Care**.

Include this disclaimer:

"This game provides general educational information and is not a substitute for professional medical advice, diagnosis, or treatment. If you notice a new or concerning change, contact a qualified healthcare professional."

Include the booth message as an awareness prompt (not a substitute for medical care):

"Have questions? Visit the University Clinic."

End the page with the club panel from section 9 (Join our club button and QR code).

---

## 14. Technical Requirements

### Stack

- Frontend: Next.js (App Router) + React + TypeScript.
- Styling: Tailwind CSS with the tokens in section 5 as the theme (no default Tailwind palette colours in the UI).
- Backend and database: Supabase (PostgreSQL, Anonymous Auth, Row Level Security, Realtime, and Postgres functions or Edge Functions for scoring).
- Hosting: Netlify (the club site already runs on Netlify) with the Next.js runtime. Document how to point a subpath or subdomain of the club site at the game.
- Fonts: Archivo via `next/font/google`.

### Backend responsibilities

Question delivery and randomization; quiz attempt creation and completion; Pink Pairs attempt tracking; answer validation; raw score validation; NMBP calculation; cumulative totals; global ranking; anonymous profiles; achievement validation; duplicate-submission prevention; rate limiting; privacy controls; CTA click counting. The frontend is never the authority for scores or totals.

### Database tables

- `players` — id (auth uid), nickname, character, recovery_code_hash, created_at.
- `questions` — id, statement, answer, explanation_short, explanation_long, source_name, source_url, category, difficulty, review_status, reviewer, reviewed_at.
- `matching_pairs` — id, pair_type (myth_fact | theme_action), card_a, card_b, explanation, source_name, source_url, review_status.
- `game_attempts` — id, player_id, category, mode, difficulty, timed, started_at, completed_at, raw_score, max_raw_score, nmbp, accuracy, incorrect_flips, status (in_progress | completed | rejected).
- `answers` — attempt_id, question_id, served_at, answered_at, choice, correct, points.
- `player_totals` — player_id, total_nmbp, rounds_completed, categories_completed, avg_nmbp, total_reached_at (updated in the same transaction as attempt completion).
- `achievements`, `player_achievements`.
- `cta_events` — results_shown and join_clicked counts (no personal data).

Provide a `leaderboard` view or RPC that applies the tie-break rules.

### Security

Secrets stay server-side; RLS on every table; input validation on every endpoint; rate limiting; clients cannot modify totals; idempotent completion.

If Supabase credentials are not available, build everything against a local Supabase (`supabase start`), list every environment variable in `.env.example`, and clearly state in the README what must be configured. Do not claim the global leaderboard works until persistent storage and score validation are connected and tested.

---

## 15. Required Screens

1. Homepage.
2. Nickname and character selection.
3. Five-category selection.
4. How to Play.
5. Quiz question screen.
6. Quiz feedback and explanation.
7. Pink Pairs difficulty selection.
8. Pink Pairs card grid.
9. Pink Pairs match explanation.
10. Pink Pairs completion and fact sheet.
11. Unified round results screen with the club call-to-action (section 9).
12. **One global leaderboard page for all five categories combined** (plus its booth display mode).
13. Personal progress and achievements.
14. Beyond the Game awareness resources.
15. Privacy information and settings.

Every button must work. No decorative controls, placeholder rankings or incomplete navigation.

---

## 16. Testing and Reliability

Write automated tests (Vitest for scoring logic, Playwright for end-to-end flows) covering:

- A new visitor can start playing immediately.
- All five categories are reachable and playable.
- Quiz questions and explanations display correctly; only approved questions are served in production.
- Pink Pairs Easy uses 8 cards / 4 pairs; Challenge uses 16 cards / 8 pairs.
- Matched cards stay face up; unmatched cards turn back; flips are blocked during the turn-back.
- Match explanations and fact sheets display.
- Quiz and Pink Pairs scoring follow the formulas exactly (unit tests with edge cases: 0 seconds, floor of 200, untimed).
- Every mode normalizes to 0–1,000; untimed perfect quiz = 667.
- All five categories add to the same total; exactly one leaderboard exists.
- Duplicate submissions award no extra points; replays award new valid points.
- Concurrent players don't interfere.
- Results persist after closing and reopening.
- The leaderboard updates automatically.
- Scores can't be changed through browser tools (direct table writes are rejected by RLS).
- The results screen shows the Join our club button and QR code linking to https://forms.gle/5tkfQ8CGDw3QFPLy5.
- The full club name appears on the homepage, results screens, leaderboard and footer.
- No Google brand colour hex values exist in the codebase (add a test that greps the built CSS for the forbidden list in 5.1).
- All text/background pairs meet the contrast table in 5.2 (axe-core check).
- Works on mobile, tablet and desktop; keyboard navigation and reduced motion work.
- Empty leaderboard shows the invitation message; database errors show a friendly retry message.
- No fake scores, invented citations or fabricated medical statistics.

---

## 17. Final Deliverable and Build Phases

Deliver a complete working application with: five game categories; original SVG characters; a responsive homepage; four quiz experiences including the Ultimate Myth Buster; a fully functional Pink Pairs; at least 50 quiz questions and 9+ matching pairs ready for review; automatic scoring and explanations; **one unified global leaderboard**; normalized scoring; cumulative Myth Buster Points; anonymous participation and privacy protections; progress and achievements; Beyond the Game resources; the club call-to-action on every results screen; a README with setup, environment variables, content-review steps and Netlify deployment instructions.

**Phase 1 — Core experience:** brand tokens and layout; homepage and category selection; character selection; quiz engine; Pink Pairs Easy and Challenge; feedback and results screens with the club CTA; question and matching-pair content.

**Phase 2 — One unified leaderboard:** anonymous player IDs; server-side answer checking and score validation; NMBP for all modes; cumulative totals; the global ranking page and booth mode; realtime updates.

**Phase 3 — Progress and polish:** achievements and My Progress; character animations; audio read-aloud; accessibility refinements; downloadable Pink Pairs fact sheet (1080 × 1920 image for Instagram stories, in campaign colours with the club's full name); full test suite and deployment.

Build functional gameplay and reliable data handling before decorative effects. After each phase, run the tests and summarize what works and what is still missing.

### FINAL NON-NEGOTIABLE REQUIREMENTS

1. There is **exactly ONE global leaderboard** for the entire application. All valid completed attempts across Myth or Fact? — The Basics, Know the Signs, Risk Factor Files, Pink Pairs and The Ultimate Myth Buster add normalized points to each player's cumulative Myth Buster Points. No separate leaderboard pages, tabs or rankings for categories, game types, difficulties or time periods.
2. Every results screen links to the club form at https://forms.gle/5tkfQ8CGDw3QFPLy5.
3. The club is always named **Google Developer Group on Campus - Rochester Institute of Technology of Dubai**, and no Google brand colours or Google typefaces are used.
4. Players can participate independently at any time, and completed results automatically update the shared global leaderboard.
5. This must be a real, functional, medically responsible educational game, not a visual prototype.
