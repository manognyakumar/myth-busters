import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CLUB, FORM, createProfile, nick, playPairs, playQuiz } from "./helpers";

test.describe("visitor journeys", () => {
  test("homepage shows the full club name, all main buttons work @responsive", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toContainText(`Built by ${CLUB}`);
    await expect(page).toHaveTitle(new RegExp(CLUB));
    for (const [name, path] of [
      ["PLAY NOW", "/play"],
      ["PINK PAIRS", "/pink-pairs"],
      ["GLOBAL LEADERBOARD", "/leaderboard"],
      ["MY PROGRESS", "/progress"],
      ["HOW TO PLAY", "/how-to-play"],
      ["BEYOND THE GAME", "/beyond"],
    ]) {
      await page.goto("/");
      await page.getByRole("link", { name, exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    }
    await page.goto("/");
    await expect(page.getByRole("link", { name: /JOIN OUR CLUB/ }).first()).toHaveAttribute("href", FORM);
  });

  test("a new visitor can start immediately, finish a quiz and see results with the club CTA @responsive", async ({ page }) => {
    await createProfile(page, "/play/basics");
    await playQuiz(page, "basics");
    const cta = page.locator("#club-cta-heading").locator("..").locator("..");
    await expect(cta).toContainText(CLUB);
    const join = page.getByRole("link", { name: /Join our club/ }).first();
    await expect(join).toHaveAttribute("href", FORM);
    await expect(join).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("img", { name: /QR code linking to the club sign-up form/ }).locator("svg")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Review your answers" })).toBeVisible();
    await expect(page.getByText(/Source:/).first()).toBeVisible();
    // Results persist after closing and reopening.
    const url = page.url();
    await page.goto("/");
    await page.goto(url);
    await expect(page.getByRole("heading", { name: "Round complete!" })).toBeVisible();
    await page.goto("/progress");
    await expect(page.getByText("Completed rounds")).toBeVisible();
  });

  test("all five categories are reachable", async ({ page }) => {
    await createProfile(page, "/play");
    for (const href of ["/play/basics", "/play/signs", "/play/risk", "/pink-pairs/easy", "/pink-pairs/challenge", "/play/ultimate"]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
    await page.goto("/play/ultimate");
    await expect(page.getByText(/Question 1 \/ 15/)).toBeVisible();
    for (const c of ["signs", "risk"]) {
      await page.goto(`/play/${c}`);
      await expect(page.getByText(/Question 1 \/ 10/)).toBeVisible();
    }
  });

  test("Pink Pairs Easy: 8 cards, flips lock during turn-back, explanations and fact sheet", async ({ page }) => {
    await createProfile(page, "/pink-pairs/easy");
    const cards = page.locator("[role=gridcell] button");
    await expect(cards).toHaveCount(8);
    // Flip lock: after a mismatch the board ignores further flips until the cards turn back.
    const faceDown = async () => {
      const idx: number[] = [];
      for (let i = 0; i < 8; i++) if ((await cards.nth(i).getAttribute("aria-label"))!.includes("face down")) idx.push(i);
      return idx;
    };
    for (let attempt = 0; attempt < 6; attempt++) {
      const [a, b, c] = await faceDown();
      await cards.nth(a).click();
      await cards.nth(b).click();
      const mismatch = await page.getByText("Flipping is paused").waitFor({ timeout: 800 }).then(() => true, () => false);
      if (!mismatch) {
        await page.getByRole("button", { name: "Keep playing" }).click();
        continue;
      }
      await cards.nth(c).click({ force: true });
      await expect(cards.nth(c)).toHaveAttribute("aria-label", /face down/);
      await expect(cards.nth(a)).toHaveAttribute("aria-label", /face down/);
      break;
    }
    await page.waitForTimeout(8000); // stay above the 8s fair-play minimum
    await playPairs(page);
    await expect(page.getByRole("heading", { name: "Your fact sheet" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Join our club/ }).first()).toHaveAttribute("href", FORM);
    await page.getByRole("link", { name: "See round results" }).click();
    await expect(page.getByRole("heading", { name: "Round complete!" })).toBeVisible();
  });

  test("Pink Pairs Challenge shows 16 cards and elapsed time", async ({ page }) => {
    await createProfile(page, "/pink-pairs/challenge");
    await expect(page.locator("[role=gridcell] button")).toHaveCount(16);
    await expect(page.getByText("Elapsed time")).toBeVisible();
  });

  test("Easy Mode shows no timer", async ({ page }) => {
    await createProfile(page, "/pink-pairs/easy");
    await expect(page.locator("[role=gridcell] button")).toHaveCount(8);
    await expect(page.getByText("Elapsed time")).toHaveCount(0);
    await expect(page.getByRole("timer")).toHaveCount(0);
  });

  test("the leaderboard updates automatically when another player finishes", async ({ browser }) => {
    const viewer = await browser.newPage();
    await viewer.goto("/leaderboard");
    await expect(viewer.getByRole("heading", { name: "GLOBAL MYTH BUSTERS" })).toBeVisible();
    const player = await browser.newPage();
    const name = await createProfile(player, "/play/risk", nick("Live"));
    await playQuiz(player, "risk");
    await expect(viewer.getByText(name)).toBeVisible({ timeout: 20_000 });
    await viewer.close();
    await player.close();
  });

  test("untimed play hides the timer", async ({ page }) => {
    await createProfile(page, "/play");
    await page.getByRole("switch", { name: "Question timer" }).click();
    await page.goto("/play/basics");
    await page.getByRole("button", { name: /NOT SURE/ }).waitFor();
    await expect(page.getByRole("timer")).toHaveCount(0);
  });

  test("booth tablets: Next player starts a fresh identity", async ({ page }) => {
    await page.goto("/start?kiosk=1");
    const first = nick("Kiosk");
    await page.fill("#nickname", first);
    await page.getByRole("button", { name: "Start playing" }).click();
    await page.waitForURL("/play");
    await playQuiz(page, "basics");
    await page.getByRole("button", { name: "Next player" }).click();
    await page.waitForURL("/start");
    await expect(page.locator("#nickname")).toHaveValue("");
    await page.goto("/leaderboard");
    await expect(page.getByText(first)).toBeVisible();
  });

  test("leaderboard empty state and friendly error message", async ({ page }) => {
    await page.route("**/api/leaderboard*", (r) =>
      r.fulfill({ json: { total_players: 0, rows: [], page: 0, page_size: 50, me: null } }),
    );
    await page.goto("/leaderboard");
    await expect(page.getByRole("heading", { name: "Be the first Myth Buster!" })).toBeVisible();
    await page.unroute("**/api/leaderboard*");
    await page.route("**/api/leaderboard*", (r) => r.fulfill({ status: 500, json: { error: "server_error" } }));
    await page.goto("/leaderboard");
    await expect(page.getByText(/couldn’t load the leaderboard/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("booth display shows the same leaderboard with both QR codes", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/leaderboard?display=booth");
    await expect(page.getByRole("heading", { name: "Scan to play" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Join our club" })).toBeVisible();
    await expect(page.getByText(CLUB).filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator("header")).toBeHidden();
  });
});

test.describe("accessibility", () => {
  for (const path of ["/", "/play", "/how-to-play", "/beyond", "/privacy", "/leaderboard", "/pink-pairs", "/start", "/progress"]) {
    test(`axe: ${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).disableRules(["region"]).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
    });
  }

  test("axe: quiz question and feedback screens", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await createProfile(page, "/play/basics");
    await page.getByRole("button", { name: /NOT SURE/ }).waitFor();
    const a = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).disableRules(["region"]).analyze();
    expect(a.violations.map((v) => v.id)).toEqual([]);
    await page.waitForTimeout(1200);
    await page.keyboard.press("n");
    await page.getByRole("button", { name: "Next question" }).waitFor();
    await page.waitForTimeout(700); // let the reveal animation settle
    const b = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).disableRules(["region"]).analyze();
    expect(b.violations.map((v) => `${v.id}: ${v.nodes.map((n) => `${n.target} ${n.any.map((x) => x.message).join()}`).join(" | ")}`)).toEqual([]);
  });
});
