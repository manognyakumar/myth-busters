# Figma → code map

Figma file: `vW82xjFuoNZZs6bNwDFZ6s` (“Myth Busters — Breast Cancer Awareness (GDGOC RIT Dubai)”).
Use this table to re-sync a screen: open the node, compare with `get_screenshot`, then update the listed file.

| Figma frame / component | Node | Code |
|---|---|---|
| Foundations (tokens, type, shape, motion, a11y) | `12:2` | `app/globals.css` (`@theme`) |
| Icons (23) | `5:3`–`5:79` | `public/figma/icons/*.svg`, `components/ui/Icon.tsx` |
| Button | `5:123` | `components/ui/Button.tsx` |
| Answer Button, Feedback Tag, Progress Bar, Timer Ring, Badge | `5:147`, `5:171`, `5:173`, `5:183`, `5:199` | `components/ui/game.tsx` |
| QR Code | `6:25` | `components/ui/QrCode.tsx` (generated client-side) |
| Medical Disclaimer | `6:266` | `components/ui/MedicalDisclaimer.tsx` |
| Pair Card | `6:291` | `components/ui/PairCard.tsx` |
| Category Card | `6:293` | `components/home/CategoryGrid.tsx` |
| Leaderboard Row | `6:406` | `components/leaderboard/LeaderboardView.tsx` (`RankTable`) |
| Header / Footer (desktop + mobile) | `6:435`, `6:453` | `components/ui/Header.tsx`, `MobileMenu.tsx`, `Footer.tsx` |
| Club CTA (desktop + mobile) | `6:959` | `components/ui/ClubCta.tsx` |
| Character/* (200px) | `3:3`, `3:17`, `3:34`, `3:50`, `3:71` | `public/figma/characters/*.svg`, `components/characters/Character.tsx` |
| Avatar/* (64px) | `3:91`, `3:106`, `3:124`, `3:141`, `3:163` | `public/figma/avatars/*.svg`, `Avatar` in `Character.tsx` |
| 01 Homepage / M1 | `17:2902` / `20:4680` | `app/(site)/page.tsx` |
| 02 Nickname & character | `7:537` | `app/(site)/start/StartScreen.tsx`, `components/player/ProfileForm.tsx` |
| 03 Category selection | `7:689` | `app/(site)/play/page.tsx`, `TimerOption.tsx`, `components/player/PlayingAs.tsx` |
| 04 How to play / M5 | `8:695` / `33:4409` | `app/(site)/how-to-play/page.tsx` |
| 05 / 06 Quiz question + feedback / M2 | `8:860`, `8:962` / `11:235` | `components/quiz/QuizGame.tsx` |
| 07 Pink Pairs — choose a mode | `8:1101` | `app/(site)/pink-pairs/page.tsx` |
| 08 / 09 / 10 Pink Pairs grid, match, completion / M3 | `9:1005`, `9:1202`, `9:1310` / `11:319` | `components/pairs/PairsGame.tsx` |
| 11 Round results + club CTA / M4 | `10:1337` / `11:411` | `components/results/ResultsScreen.tsx` |
| 12 / 12b Global leaderboard + empty | `10:2049`, `10:2453` | `components/leaderboard/LeaderboardView.tsx` |
| B1 Booth display | `11:999` | `components/leaderboard/BoothBoard.tsx` |
| 13 My progress | `10:3049` | `app/(site)/progress/ProgressView.tsx`, `components/player/Recovery.tsx` |
| 14 Beyond the game | `10:3254` | `app/(site)/beyond/page.tsx` |
| 15 Privacy & settings | `10:3647` | `app/(site)/privacy/page.tsx`, `SettingsPanel.tsx` |
