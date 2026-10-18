# Design notes — where code differs from the Figma file

The spec is the authority on behaviour and brand rules; Figma is the authority on layout. Deliberate differences:

1. **Display typeface.** Figma mocks use *Archivo Black* because Figma has no width axis. Per the Foundations note
   (“code is the source of truth”), titles render in variable **Archivo 900 at `font-stretch: 125%`** (`font-display` utility).
   Some titles are sized down slightly so the wider face still fits on one line.
2. **Mobile layouts** exist in Figma only for Home, Quiz, Pink Pairs Easy and Results (M1–M4). Other screens follow the same
   patterns (16px gutter, stacked cards, full-width buttons, 48px targets).
3. **“Up N places”** on the results rank tile is shown as “on the one global leaderboard” — rank history isn’t stored, and we don’t
   invent movement.
4. **Results review list** shows every statement (Figma truncates to four with “+ 6 more”), because spec §9 requires the full list.
5. **Pink Pairs completion** also shows the club CTA panel so the CTA appears on every end-of-round screen.
6. **Feedback headline** uses the first sentence of the reviewed short explanation; the rest goes in Professor Bloom’s card.
7. **Settings panel** adds “Delete my data” and a “Booth tablet mode” toggle (shared-device safety), not in the mock.
8. **Character motion** is applied to whole-character SVGs (bob, wave, pop, dissolve). The Figma SVGs are used unedited.
9. **Privacy “How long”** keeps the Figma placeholder text until the club confirms a retention period (see README).
10. **White on `success`** (the “Correct” tag) comes from Figma but isn’t in the spec §5.2 pairs table. It measures 5.0:1, which passes AA.
11. **CHECK action card** in Pink Pairs is longer than 12 words, because the spec requires the event poster text verbatim.
12. **Character motion** applies to the whole character, not to individual limbs (spec §3 describes per-limb actions). To animate
    limbs, split the Figma SVG groups into separately animated layers.
13. **Phone refresh (Oct 2026).** The header shows only the RIT Dubai logo and menu (club name text removed; it stays in the footer, CTA and
    page metadata). On phones, game cards put the character top-right with a full-width button, the hero stage shows the busted-myth
    card with Rosie and Pinky, and "Meet your guides" becomes 2-column cards with name, role and catchphrase together. Avatars are
    re-cropped (78px art at -7,2) so the whole head fits the ring. Figma M1 and the mobile Header component are updated to match;
    the mobile "Meet your guides" section exists only in code.
