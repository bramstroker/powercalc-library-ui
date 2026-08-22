import { describe, expect, it } from "vitest";

import {
  authorPath,
  manufacturerPath,
  profilePath,
  slugifyPathSegment,
} from "./urlSlugs.mjs";

describe("URL slugs", () => {
  it("lowercases values and replaces whitespace and punctuation with dashes", () => {
    expect(slugifyPathSegment("  Ålex Mihai & Co.  ")).toBe("alex-mihai-co");
    expect(authorPath("AlexMihai1804")).toBe("/author/alexmihai1804");
    expect(manufacturerPath("3A Smarthome")).toBe("/manufacturer/3a-smarthome");
    expect(profilePath("Brand & Co", "Model / One")).toBe(
      "/profiles/brand-co/model-one",
    );
  });
});
