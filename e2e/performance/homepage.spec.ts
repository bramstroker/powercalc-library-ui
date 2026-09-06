import { expect, test } from "@playwright/test";

import budgets from "../../performance-budgets.json";

type MetricState = {
  cls: number;
  clsSessionStart: number;
  clsSessionValue: number;
  clsLastEntry: number;
  inp: number;
  lcp: number;
  supportsEventTiming: boolean;
  shifts: unknown[];
};

declare global {
  interface Window {
    __performanceBudgetMetrics: MetricState;
  }
}

test("keeps the homepage within its runtime performance budgets", async ({
  page,
  context,
  browserName,
}, testInfo) => {
  const isMobile = testInfo.project.name === "mobile-chromium";

  expect(browserName, "performance budgets run in Chromium").toBe("chromium");

  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 1_600_000 / 8,
    uploadThroughput: 750_000 / 8,
  });

  await page.addInitScript(() => {
    const metrics: MetricState = {
      cls: 0,
      clsSessionStart: 0,
      clsSessionValue: 0,
      clsLastEntry: 0,
      inp: 0,
      lcp: 0,
      supportsEventTiming: PerformanceObserver.supportedEntryTypes.includes("event"),
      shifts: [],
    };
    window.__performanceBudgetMetrics = metrics;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const latest = entries.at(-1);
      if (latest) metrics.lcp = latest.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
          sources: Array<{
            node?: Element;
            previousRect: DOMRectReadOnly;
            currentRect: DOMRectReadOnly;
          }>;
        }
      >) {
        if (entry.hadRecentInput) continue;
        metrics.shifts.push({
          time: entry.startTime,
          value: entry.value,
          sources: entry.sources.map((source) => ({
            text: source.node?.textContent?.slice(0, 100),
            tag: source.node?.tagName,
            className: source.node?.className,
            before: source.previousRect.toJSON(),
            after: source.currentRect.toJSON(),
          })),
        });
        const startsNewSession =
          entry.startTime - metrics.clsLastEntry > 1_000 ||
          entry.startTime - metrics.clsSessionStart > 5_000;
        if (startsNewSession) {
          metrics.clsSessionStart = entry.startTime;
          metrics.clsSessionValue = entry.value;
        } else {
          metrics.clsSessionValue += entry.value;
        }
        metrics.clsLastEntry = entry.startTime;
        metrics.cls = Math.max(metrics.cls, metrics.clsSessionValue);
      }
    }).observe({ type: "layout-shift", buffered: true });

    if (metrics.supportsEventTiming) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEventTiming[]) {
          if (entry.interactionId > 0) metrics.inp = Math.max(metrics.inp, entry.duration);
        }
      }).observe({
        type: "event",
        buffered: true,
        durationThreshold: 16,
      } as PerformanceObserverInit & { durationThreshold: number });
    }
  });

  let requestCount = 0;
  const scriptRequests = new Set<string>();
  let scriptTransferBytes = 0;
  cdp.on("Network.responseReceived", (event) => {
    if (event.type === "Script") scriptRequests.add(event.requestId);
  });
  cdp.on("Network.loadingFinished", (event) => {
    if (scriptRequests.has(event.requestId)) scriptTransferBytes += event.encodedDataLength;
  });
  page.on("request", (request) => {
    if (/^https?:/u.test(request.url())) requestCount += 1;
  });

  const started = Date.now();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByText("1–25 of 749", { exact: true })).toBeVisible();
  const usableMs = Date.now() - started;
  expect(usableMs, "usable catalogue on a cold slow connection").toBeLessThanOrEqual(
    budgets.runtime.usableCatalogueMs,
  );
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Find a power profile" })).toBeVisible();
  await page.getByRole("button", { name: "Explore" }).click();
  await expect(page.getByRole("navigation", { name: "Explore Powercalc" })).toBeVisible();
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => window.__performanceBudgetMetrics);
  await testInfo.attach("layout-shifts", {
    body: JSON.stringify(metrics.shifts, null, 2),
    contentType: "application/json",
  });
  if (metrics.cls > 0.1) console.log(JSON.stringify(metrics.shifts));
  console.log(
    `${isMobile ? "Mobile" : "Desktop"} homepage: LCP ${metrics.lcp.toFixed(0)} ms, observed interaction ${metrics.inp.toFixed(0)} ms, CLS ${metrics.cls.toFixed(3)}, ${requestCount} requests, ${(scriptTransferBytes / 1024).toFixed(1)} KiB JS transferred, usable ${usableMs} ms`,
  );

  expect(
    scriptTransferBytes,
    "actual JavaScript transfer including lazy chunks and headers",
  ).toBeGreaterThan(0);
  expect(scriptTransferBytes / 1024).toBeLessThanOrEqual(
    isMobile
      ? budgets.javascript.runtimeMobileTransferKiB
      : budgets.javascript.runtimeDesktopTransferKiB,
  );

  expect(metrics.cls, `${isMobile ? "mobile" : "desktop"} CLS`).toBeLessThanOrEqual(
    isMobile ? budgets.mobile.cls : budgets.desktop.cls,
  );

  expect(requestCount, "initial homepage requests including dynamic chunks").toBeLessThanOrEqual(
    isMobile ? budgets.requests.initialHomepage : budgets.requests.desktopHomepage,
  );
  expect(metrics.supportsEventTiming, "Chromium must expose Event Timing for INP").toBe(true);
  expect(metrics.lcp, "LCP in milliseconds").toBeGreaterThan(0);
  expect(metrics.lcp, "LCP in milliseconds").toBeLessThanOrEqual(budgets.mobile.lcpMs);

  expect(metrics.inp, "observed interaction latency in milliseconds").toBeLessThanOrEqual(
    budgets.mobile.inpMs,
  );
});
