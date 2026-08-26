import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ENDPOINTS } from "../config/api";

import { fetchLibrary } from "./library.api";

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
    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.LIBRARY, {
      signal: expect.any(AbortSignal),
    });
  });

  it("throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(fetchLibrary()).rejects.toThrow("Failed to fetch library");
  });
});
