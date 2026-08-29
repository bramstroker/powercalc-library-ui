import { expect, test } from "@playwright/test";
import { mockApi } from "./fixtures/api";

test.use({ viewport: { width: 390, height: 844 } });

/** Stand-in for ScrollToTop landing after the test has scrolled, which is what CI saw. */
const scheduleLateScrollToTop = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 250);
  });

test("old pattern loses to a late scroll-to-top", async ({ page }) => {
  await mockApi(page);
  await page.goto("/profiles/signify/LCA001");
  const link = page.getByRole("link", { name: "Bram Gerritsen" });

  await scheduleLateScrollToTop(page);
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  console.log(JSON.stringify({ old: await page.evaluate(() => window.scrollY) }));
});

test("new pattern survives it", async ({ page }) => {
  await mockApi(page);
  await page.goto("/profiles/signify/LCA001");
  const link = page.getByRole("link", { name: "Bram Gerritsen" });
  await expect(link).toBeVisible();

  await scheduleLateScrollToTop(page);
  await expect
    .poll(async () => {
      await link.scrollIntoViewIfNeeded();
      return page.evaluate(() => window.scrollY);
    })
    .toBeGreaterThan(0);

  console.log(JSON.stringify({ new: await page.evaluate(() => window.scrollY) }));
});
