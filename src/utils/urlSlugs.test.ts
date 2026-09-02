import { describe, expect, it } from "vitest";

import {
  authorPath,
  deviceTypePath,
  manufacturerPath,
  profilePath,
  profileSocialImagePath,
  slugifyPathSegment,
} from "./urlSlugs.mjs";

describe("URL slugs", () => {
  it("lowercases values and replaces whitespace and punctuation with dashes", () => {
    expect(slugifyPathSegment("  Ålex Mihai & Co.  ")).toBe("alex-mihai-co");
    expect(authorPath("AlexMihai1804")).toBe("/contributors/alexmihai1804");
    expect(manufacturerPath("3A Smarthome")).toBe("/manufacturers/3a-smarthome");
    expect(deviceTypePath("smart_switch")).toBe("/device-types/smart-switch");
    expect(profilePath("Brand & Co", "Model / One")).toBe("/profiles/brand-co/model-one");
    expect(profileSocialImagePath("Brand & Co", "Model / One")).toBe(
      "/social-cards/profiles/brand-co/model-one.png",
    );
  });
});
