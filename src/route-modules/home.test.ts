import { describe, expect, it, vi } from "vitest";

import { SITE_NAME, SITE_URL } from "../config/site";

import { meta } from "./home";

vi.mock("../components/LibraryGrid", () => ({ LibraryGrid: () => null }));

const metadataFor = (search: string) =>
  meta({ location: { search } } as Parameters<typeof meta>[0]);

describe("home metadata", () => {
  it("uses the q search parameter in the page title", () => {
    const metadata = metadataFor("?q=Hue%20bulb");

    expect(metadata).toContainEqual({ title: `Hue bulb · ${SITE_NAME}` });
    expect(metadata).toContainEqual({ property: "og:title", content: `Hue bulb · ${SITE_NAME}` });
  });

  it("keeps filtered searches canonical to the library root", () => {
    const metadata = metadataFor("?q=Hue&manufacturer=Signify");

    expect(metadata).toContainEqual({ tagName: "link", rel: "canonical", href: `${SITE_URL}/` });
  });
});
