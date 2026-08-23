import { describe, expect, it } from "vitest";

import { contributorAvatarUrl, localAvatarPath } from "./avatarPaths";

const avatarPaths = {
  alice: "/avatars/alice.jpg",
};

describe("contributor avatar URLs", () => {
  it("resolves downloaded avatars case-insensitively", () => {
    expect(localAvatarPath("Alice", avatarPaths)).toBe("/avatars/alice.jpg");
    expect(contributorAvatarUrl("Alice", avatarPaths)).toBe("/avatars/alice.jpg");
  });

  it("falls back to GitHub when an avatar was not downloaded", () => {
    expect(contributorAvatarUrl("missing user", avatarPaths)).toBe(
      "https://github.com/missing%20user.png?size=192",
    );
  });
});
