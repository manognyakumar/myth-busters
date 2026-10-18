import { expect, type Page } from "@playwright/test";

export const CLUB = "Google Developer Group on Campus - Rochester Institute of Technology of Dubai";
export const FORM = "https://forms.gle/5tkfQ8CGDw3QFPLy5";

export const nick = (p = "E2E") => `${p}${Math.floor(Math.random() * 1e6)}`.slice(0, 16);

export async function createProfile(page: Page, next = "/play", name = nick()) {
  await page.goto(`/start?next=${encodeURIComponent(next)}`);
  await page.fill("#nickname", name);
  await page.getByText("Detective Rosie", { exact: true }).click();
  await page.getByRole("button", { name: "Start playing" }).click();
  await page.waitForURL((u) => u.pathname === next);
  return name;
}

/** Plays a full quiz round using the keyboard (answers unlock after ~1s). */
export async function playQuiz(page: Page, category = "basics") {
  if (!page.url().endsWith(`/play/${category}`)) await page.goto(`/play/${category}`);
  for (;;) {
    await page.getByRole("button", { name: /NOT SURE/ }).waitFor();
    await page.waitForTimeout(1250);
    await page.keyboard.press("m");
    const next = page.getByRole("button", { name: /Next question|See my results/ });
    await next.waitFor();
    const label = (await next.textContent()) ?? "";
    await next.click();
    if (label.includes("See my results")) break;
  }
  await page.waitForURL(/\/results\//);
  await expect(page.getByRole("heading", { name: "Round complete!" })).toBeVisible();
}

/** Solves Pink Pairs by brute force through the real UI. */
export async function playPairs(page: Page) {
  const cards = page.locator("[role=gridcell] button");
  await cards.first().waitFor();
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if ((await cards.nth(i).getAttribute("aria-label"))!.startsWith("Matched")) break;
      if ((await cards.nth(j).getAttribute("aria-label"))!.startsWith("Matched")) continue;
      await cards.nth(i).click();
      await cards.nth(j).click();
      const dialog = page.getByRole("dialog");
      const matched = await dialog.waitFor({ timeout: 3500 }).then(() => true, () => false);
      if (matched) {
        await dialog.getByRole("button", { name: /Keep playing|See my fact sheet/ }).click();
        break;
      }
      await expect(cards.nth(i)).toHaveAttribute("aria-label", /face down/);
    }
  }
  await expect(page.getByRole("heading", { name: "All pairs matched!" })).toBeVisible({ timeout: 20_000 });
}
