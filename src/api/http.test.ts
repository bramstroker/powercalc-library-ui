import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchJson } from "./http";

const abortError = (signal: AbortSignal | null | undefined): Error => {
  const error = new Error("Aborted");
  const reason = signal?.reason;

  if (typeof reason === "object" && reason !== null && "name" in reason) {
    error.name = String(reason.name);
  }

  return error;
};

describe("fetchJson", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("aborts a stalled request after its deadline", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation((_url, init) => {
      const signal = init?.signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(abortError(signal)), { once: true });
      });
    });

    const request = fetchJson("https://api.example.test/data", "Request failed");
    const expectation = expect(request).rejects.toMatchObject({ name: "TimeoutError" });

    await vi.advanceTimersByTimeAsync(30_000);
    await expectation;
  });

  it("forwards caller cancellation to fetch", async () => {
    const caller = new AbortController();
    vi.mocked(fetch).mockImplementation((_url, init) => {
      const signal = init?.signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(abortError(signal)), { once: true });
      });
    });

    const request = fetchJson("https://api.example.test/data", "Request failed", caller.signal);
    const expectation = expect(request).rejects.toMatchObject({ name: "AbortError" });

    caller.abort();
    await expectation;
  });
});
