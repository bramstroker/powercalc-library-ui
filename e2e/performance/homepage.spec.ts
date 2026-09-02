import { expect, test } from "@playwright/test";

import budgets from "../../performance-budgets.json";

import { mockApi } from "../fixtures/api";

type MetricState = {
  cls: number;
  clsSessionStart: number;
  clsSessionValue: number;
  clsLastEntry: number;
  inp: number;
  lcp: number;
  supportsEventTiming: boolean;
};

declare global {
  interface Window {
    __performanceBudgetMetrics: MetricState;
  }
}

test("keeps the mobile homepage within its runtime performance budgets", async ({
  page,
  context,
}) => {
  await mockApi(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.addInitScript(() => {
    const metrics: MetricState = {
      cls: 0,
      clsSessionStart: 0,
      clsSessionValue: 0,
      clsLastEntry: 0,
      inp: 0,
      lcp: 0,
      supportsEventTiming: PerformanceObserver.supportedEntryTypes.includes("event"),
    };
    window.__performanceBudgetMetrics = metrics;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const latest = entries.at(-1);
      if (latest) metrics.lcp = latest.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & { hadRecentInput: boolean; value: number }
      >) {
        if (entry.hadRecentInput) continue;
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
  page.on("request", (request) => {
    if (/^https?:/u.test(request.url())) requestCount += 1;
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Powercalc profile library" })).toBeVisible();
  await page.getByRole("button", { name: "Explore" }).click();
  await expect(page.getByRole("navigation", { name: "Explore Powercalc" })).toBeVisible();
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => window.__performanceBudgetMetrics);
  console.log(
    `Mobile homepage: LCP ${metrics.lcp.toFixed(0)} ms, INP ${metrics.inp.toFixed(0)} ms, CLS ${metrics.cls.toFixed(3)}, ${requestCount} requests`,
  );

  expect(metrics.supportsEventTiming, "Chromium must expose Event Timing for INP").toBe(true);
  expect(requestCount, "initial homepage requests").toBeLessThanOrEqual(
    budgets.requests.initialHomepage,
  );
  expect(metrics.lcp, "mobile LCP in milliseconds").toBeGreaterThan(0);
  expect(metrics.lcp, "mobile LCP in milliseconds").toBeLessThanOrEqual(budgets.mobile.lcpMs);
  expect(metrics.inp, "mobile INP in milliseconds").toBeGreaterThan(0);
  expect(metrics.inp, "mobile INP in milliseconds").toBeLessThanOrEqual(budgets.mobile.inpMs);
  expect(metrics.cls, "mobile CLS").toBeLessThanOrEqual(budgets.mobile.cls);
});
