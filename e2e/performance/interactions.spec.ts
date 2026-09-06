import { expect, test, type Page } from "@playwright/test";
import budgets from "../../performance-budgets.json";
import library from "./fixtures/library.json";

const count = library.manufacturers.reduce(
  (total, manufacturer) => total + manufacturer.models.length,
  0,
);

const ready = async (page: Page) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true", { timeout: 15_000 });
  await expect(
    page.getByRole("textbox", { name: "Search all profiles", exact: true }),
  ).toBeVisible();
};

const timed = async (
  label: string,
  action: () => Promise<void>,
  limit = budgets.runtime.interactionCompletionMs,
) => {
  const start = Date.now();
  await action();
  const elapsed = Date.now() - start;
  console.log(`${label}: ${elapsed} ms`);
  expect(elapsed, label).toBeLessThanOrEqual(limit);
};

const search = (page: Page) =>
  page.getByRole("textbox", { name: "Search all profiles", exact: true });

declare global {
  interface Window {
    __searchCompletionMs: number | null;
  }
}

const timedSearch = async (page: Page, label: string, term: string) => {
  // Measure input-to-painted-results in the browser. Node-side assertion retries and transport
  // latency must not become part of the user's search latency on a busy CI runner.
  await page.evaluate((query) => {
    const paginationSelector = ".MuiTablePagination-displayedRows";
    const previous = document.querySelector(paginationSelector)?.textContent;
    const input = document.querySelector('input[aria-label="Search all profiles"]');
    const main = document.querySelector("#main-content");
    if (!previous || !input || !main) throw new Error("Catalogue is not ready for search timing");
    window.__searchCompletionMs = null;
    input.addEventListener(
      "input",
      () => {
        const started = performance.now();
        let painting = false;
        const observer = new MutationObserver(() => {
          const current = document.querySelector(paginationSelector)?.textContent;
          if (
            painting ||
            !current ||
            current === previous ||
            new URLSearchParams(location.search).get("q") !== query
          )
            return;
          painting = true;
          observer.disconnect();
          clearTimeout(timeout);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              window.__searchCompletionMs = performance.now() - started;
            }),
          );
        });
        const timeout = setTimeout(() => observer.disconnect(), 10_000);
        observer.observe(main, { subtree: true, childList: true, characterData: true });
      },
      { once: true, capture: true },
    );
  }, term);
  await search(page).fill(term);
  await page.waitForFunction(() => window.__searchCompletionMs !== null, null, { timeout: 10_000 });
  const elapsed = await page.evaluate(() => window.__searchCompletionMs!);
  console.log(`${label}: ${elapsed.toFixed(0)} ms (input to painted results)`);
  expect(elapsed, label).toBeLessThanOrEqual(budgets.runtime.interactionCompletionMs);
};

// Cold-load network performance is measured separately. Search timings include debounce and
// rendering; other actions also include Playwright overhead. Neither is a field INP percentile.
test.beforeEach(async ({ context, page }) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 1_600_000 / 8,
    uploadThroughput: 750_000 / 8,
  });
});

test("searches, filters, paginates and opens a profile with a representative catalogue", async ({
  page,
}, info) => {
  const mobile = info.project.name === "mobile-chromium";
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await timed("Usable catalogue", () => ready(page), budgets.runtime.usableCatalogueMs);
  await expect(page.getByText(`1–25 of ${count}`, { exact: true })).toBeVisible();
  await timedSearch(page, "Typo search", "tradrfi");
  await expect(page).toHaveURL(/q=tradrfi/);
  await expect(page.getByText(`1–25 of ${count}`, { exact: true })).toHaveCount(0);
  await expect(page.getByText("No profiles match", { exact: false })).toHaveCount(0);
  await search(page).fill("");
  await expect(page).not.toHaveURL(/q=/);
  await timed(
    "Open filters",
    async () => {
      if (mobile) await page.getByRole("button", { name: "Filters", exact: true }).click();
      await expect(page.getByTestId("facet-deviceType")).toBeVisible();
    },
    budgets.runtime.filterPanelMs,
  );
  await timed("Device facet", async () => {
    await page.getByTestId("facet-deviceType").getByRole("checkbox", { name: /Light/ }).click();
    await expect(
      page.getByTestId("facet-deviceType").getByRole("checkbox", { name: /Light/ }),
    ).toBeChecked();
    await expect(page).toHaveURL(/deviceType=light/);
  });
  if (mobile) await page.getByRole("button", { name: /Show \d+ results/ }).click();
  await page
    .getByTestId("active-filter-chips")
    .getByRole("button", { name: "Device type: Light", exact: true })
    .press("Delete");
  await expect(page.getByText(`1–25 of ${count}`, { exact: true })).toBeVisible();
  await timed("Next page", async () => {
    await page.getByRole("button", { name: "Go to next page" }).click();
    await expect(page.getByText(`26–50 of ${count}`, { exact: true })).toBeVisible();
  });
  await page.waitForTimeout(750);
  await expect(page.getByText(`26–50 of ${count}`, { exact: true })).toBeVisible();
  await timed(
    "Open profile",
    async () => {
      if (mobile) await page.getByTestId("library-card-list").getByRole("link").first().click();
      else await page.getByRole("row").nth(1).click();
      await expect(page).toHaveURL(/\/profiles\//);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    },
    budgets.runtime.profileOpenMs,
  );
  expect(requests.filter((url) => url.endsWith("/library/full"))).toHaveLength(1);
  expect(requests.filter((url) => url.endsWith("/analytics/profiles"))).toHaveLength(1);
});

for (const mode of ["slow", "unavailable"] as const) {
  test(`keeps search usable with ${mode} analytics`, async ({ page }, info) => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let resolved = false;
    await page.route("**/analytics/profiles", async (route) => {
      if (mode === "unavailable") return route.fulfill({ status: 503, body: "Unavailable" });
      await pending;
      resolved = true;
      await route.fulfill({ json: [] }).catch(() => {});
    });
    try {
      await ready(page);
      await expect(page.getByText(`1–25 of ${count}`, { exact: true })).toBeVisible();
      await timedSearch(page, "Search while analytics is unavailable", "ikea");
      await expect(page).toHaveURL(/q=ikea/);
      await expect(page.getByText(`1–25 of ${count}`, { exact: true })).toHaveCount(0);
      const results =
        info.project.name === "mobile-chromium"
          ? page.getByTestId("library-card-list").getByRole("link").first()
          : page.getByRole("row").nth(1);
      await expect(results).toContainText("IKEA");
      expect(resolved).toBe(false);
    } finally {
      release();
    }
  });
}

test("keeps typo search responsive when the catalogue grows fourfold", async ({ page }) => {
  const grown = {
    manufacturers: library.manufacturers.map((manufacturer) => ({
      ...manufacturer,
      models: Array.from({ length: 4 }, (_, copy) =>
        manufacturer.models.map((model) => ({
          ...model,
          id: `${model.id}-growth-${copy}`,
          legacy_ids: [],
        })),
      ).flat(),
    })),
  };
  // This scenario tests CPU/render growth, not download size: cold network transfer uses the
  // real compressed library API response in homepage.spec.ts.
  await page.route("**/library/full", (route) => route.fulfill({ json: grown }));
  await ready(page);
  await expect(
    page.getByText(`1–25 of ${(count * 4).toLocaleString("en-US")}`, { exact: true }),
  ).toBeVisible();
  await timedSearch(page, "Typo search with 2996 profiles", "philps");
  await expect(page).toHaveURL(/q=philps/);
  await expect(
    page.getByText(`1–25 of ${(count * 4).toLocaleString("en-US")}`, { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("No profiles match", { exact: false })).toHaveCount(0);
});
