import { describe, expect, it } from "vitest";

import { safeGithubPullRequestUrl, safeHttpsUrl, safeProfileResourceUrl } from "./externalUrls";

describe("safeHttpsUrl", () => {
  it("accepts absolute HTTPS URLs without credentials", () => {
    expect(safeHttpsUrl(" https://www.example.com/products/one ")).toBe(
      "https://www.example.com/products/one",
    );
  });

  it.each([
    "http://example.com",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "https://user:password@example.com/private",
    "/relative",
    "not a URL",
  ])("rejects unsafe external URL %s", (url) => {
    expect(safeHttpsUrl(url)).toBeNull();
  });
});

describe("safeGithubPullRequestUrl", () => {
  it("accepts a pull request in the library repository", () => {
    expect(
      safeGithubPullRequestUrl("https://github.com/bramstroker/homeassistant-powercalc/pull/5002"),
    ).toBe("https://github.com/bramstroker/homeassistant-powercalc/pull/5002");
  });

  it.each([
    "https://example.com/bramstroker/homeassistant-powercalc/pull/5002",
    "https://github.com/attacker/repository/pull/5002",
    "https://github.com/bramstroker/homeassistant-powercalc/issues/5002",
  ])("rejects non-library pull request URL %s", (url) => {
    expect(safeGithubPullRequestUrl(url)).toBeNull();
  });
});

describe("safeProfileResourceUrl", () => {
  it("accepts a raw file in the library repository", () => {
    const url =
      "https://raw.githubusercontent.com/bramstroker/homeassistant-powercalc/master/profile_library/signify/LCA001/model.json";
    expect(safeProfileResourceUrl(url)).toBe(url);
  });

  it.each([
    "https://example.com/bramstroker/homeassistant-powercalc/master/model.json",
    "https://raw.githubusercontent.com/attacker/repository/master/model.json",
    "http://raw.githubusercontent.com/bramstroker/homeassistant-powercalc/master/model.json",
  ])("rejects untrusted profile resource URL %s", (url) => {
    expect(safeProfileResourceUrl(url)).toBeNull();
  });
});
