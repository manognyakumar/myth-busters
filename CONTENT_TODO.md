# Content to-do before launch

All 58 questions and 9 matching pairs are seeded as **draft**. Nothing is served in production until a qualified reviewer
(e.g. the University Clinic) approves it:

```bash
npm run content:approve -- --list
npm run content:approve -- --reviewer "University Clinic — Dr. …" --ids b01,b02,p01
npm run db:seed
```

## Sources

Every source URL was checked to load (HTTP 200) on 18 Oct 2026, and its page text was read to confirm it supports the claim:
WHO breast cancer fact sheet, NCI (male breast cancer, prevention, BRCA, mammograms, screening, myths, antiperspirants, age, alcohol,
understanding breast changes), NHS (symptoms, breast pain, breast lumps).

## Open items

- **UAE health authority sources.** No official UAE page stating screening guidance could be verified:
  - The MOHAP site (mohap.gov.ae) did not respond from the build environment.
  - DHA has no stable breast-screening page we could cite; only the home page (https://www.dha.gov.ae/en) is linked, on Beyond the Game.
  - Please add a verified MOHAP or DHA breast-screening URL. Candidate questions to re-cite: `u01`, `u02`, and pair `p03`.
- **Reviewer focus areas.**
  - Statistics quoted from WHO: `u14` (0.5–1% of cases occur in men) and `b01` / `b06` / `p01` (80% of cases have no specific risk factor other than sex and age).
  - `b05` (younger adults) cites NCI “Age and Cancer Risk”, which is about cancer in general.
  - `r11` (postmenopausal hormone therapy) and `r12` (tobacco) are worded exactly as in the WHO fact sheet.
- **SUPPORT theme.** The Pink Pairs pair `p08` and the Beyond-the-game SUPPORT card have no medical claim, so they have no source; they
  only encourage seeking professional help.
- **Retention period.** The Privacy page says “to be confirmed by the club before launch”.
