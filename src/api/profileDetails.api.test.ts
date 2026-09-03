import { describe, expect, it } from "vitest";

import { plotsFromDownloadLinks, subProfileLinks, type DownloadLink } from "./profileDetails.api";

const rawUrl = (path: string) =>
  `https://raw.githubusercontent.com/bramstroker/homeassistant-powercalc/master/profile_library/signify/LCA001/${path}`;

describe("profile download links", () => {
  const links: DownloadLink[] = [
    { path: "brightness.svg", url: rawUrl("brightness.svg") },
    { path: "sub/model.json", url: rawUrl("sub/model.json") },
    { path: "attacker.svg", url: "https://attacker.example/plot.svg" },
    { path: "script.svg", url: "javascript:alert(1)" },
  ];

  it("only exposes plot URLs from the profile repository", () => {
    expect(plotsFromDownloadLinks(links)).toEqual([
      { label: "brightness", url: rawUrl("brightness.svg") },
    ]);
  });

  it("only fetches subprofiles from the profile repository", () => {
    expect(subProfileLinks(links)).toEqual([
      { path: "sub/model.json", url: rawUrl("sub/model.json") },
    ]);
  });
});
