import { describe, expect, it } from "vitest";

import { contributorAvatarUrl, localAvatarPath } from "./avatarPaths";

const avatarPaths = {
  alice: "/avatars/alice-a1b2c3d4e5f6",
};

describe("contributor avatar URLs", () => {
  it("resolves downloaded avatars case-insensitively", () => {
    expect(localAvatarPath("Alice", avatarPaths)).toBe("/avatars/alice-a1b2c3d4e5f6-192.webp");
    expect(localAvatarPath("Alice", avatarPaths, 96)).toBe("/avatars/alice-a1b2c3d4e5f6-96.webp");
    expect(contributorAvatarUrl("Alice", 192, avatarPaths)).toBe(
      "/avatars/alice-a1b2c3d4e5f6-192.webp",
    );
  });

  it("falls back to GitHub when an avatar was not downloaded", () => {
    expect(contributorAvatarUrl("missing user", 192, avatarPaths)).toBe(
      "https://github.com/missing%20user.png?size=192",
    );
  });

  it("requests the compact GitHub fallback for list avatars", () => {
    expect(contributorAvatarUrl("missing user", 96, avatarPaths)).toBe(
      "https://github.com/missing%20user.png?size=96",
    );
  });

  it("keeps legacy manifest entries usable during migration", () => {
    expect(localAvatarPath("Alice", { alice: "/avatars/alice.webp" }, 96)).toBe(
      "/avatars/alice.webp",
    );
  });
});
