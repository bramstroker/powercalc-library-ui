import { describe, expect, it, vi } from "vitest";

import { loadPrerenderedOrLive } from "./clientLoader";

const args = (serverLoader: () => Promise<unknown>) =>
  ({ serverLoader }) as Parameters<typeof loadPrerenderedOrLive>[0];

describe("loadPrerenderedOrLive", () => {
  it("uses generated route data when it exists", async () => {
    const liveLoader = vi.fn();
    const generated = { modelId: "existing" };

    await expect(
      loadPrerenderedOrLive(
        args(async () => generated),
        liveLoader,
      ),
    ).resolves.toBe(generated);
    expect(liveLoader).not.toHaveBeenCalled();
  });

  it("loads a newly added route from the live API after a prerender 404", async () => {
    const live = { modelId: "new-profile" };
    const liveLoader = vi.fn(async () => live);

    await expect(
      loadPrerenderedOrLive(
        args(async () => {
          throw new Response("Not Found", { status: 404 });
        }),
        liveLoader,
      ),
    ).resolves.toBe(live);
    expect(liveLoader).toHaveBeenCalledOnce();
  });

  it("does not hide non-404 failures", async () => {
    const failure = new Response("Unavailable", { status: 503 });
    const liveLoader = vi.fn();

    await expect(
      loadPrerenderedOrLive(
        args(async () => {
          throw failure;
        }),
        liveLoader,
      ),
    ).rejects.toBe(failure);
    expect(liveLoader).not.toHaveBeenCalled();
  });
});
