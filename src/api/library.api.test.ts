import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ENDPOINTS } from "../config/api";

import { fetchLibrary, fetchLibraryChanges, libraryChangesSince } from "./library.api";

const jsonResponse = (body: unknown) =>
  ({ ok: true, json: () => Promise.resolve(body) }) as Response;

describe("fetchLibrary", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the library endpoint and returns the parsed json", async () => {
    const payload = { manufacturers: [] };
    vi.mocked(fetch).mockResolvedValue(jsonResponse(payload));

    await expect(fetchLibrary()).resolves.toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.LIBRARY);
  });

  it("throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(fetchLibrary()).rejects.toThrow("Failed to fetch library");
  });
});

describe("fetchLibraryChanges", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests only profile additions and measurement updates", async () => {
    const payload = { items: [], next_cursor: null };
    const signal = new AbortController().signal;
    vi.mocked(fetch).mockResolvedValue(jsonResponse(payload));

    await expect(
      fetchLibraryChanges({
        cursor: "next page",
        signal,
        since: "2026-07-02T00:00:00.000Z",
      }),
    ).resolves.toEqual(payload);

    const [requestUrl, options] = vi.mocked(fetch).mock.calls[0];
    const url = new URL(String(requestUrl));
    expect(url.origin + url.pathname).toBe(API_ENDPOINTS.LIBRARY_CHANGES);
    expect(url.searchParams.get("limit")).toBe("30");
    expect(url.searchParams.get("types")).toBe("profile_added,measurement_updated");
    expect(url.searchParams.get("cursor")).toBe("next page");
    expect(url.searchParams.get("since")).toBe("2026-07-02T00:00:00.000Z");
    expect(options).toEqual({ signal });
  });

  it("calculates a stable two-calendar-month window", () => {
    expect(libraryChangesSince(new Date("2026-09-02T20:30:00Z"))).toBe("2026-07-02T00:00:00.000Z");
    expect(libraryChangesSince(new Date("2026-03-31T20:30:00Z"))).toBe("2026-01-31T00:00:00.000Z");
  });

  it("throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(fetchLibraryChanges()).rejects.toThrow("Failed to fetch library changes");
  });
});
