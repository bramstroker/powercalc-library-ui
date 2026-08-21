import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SITE_URL, usePageMeta } from "./usePageMeta";

const MetaFixture = ({ noIndex = false }: { noIndex?: boolean }) => {
  usePageMeta({ title: "Example", description: "Example page", noIndex });
  return null;
};

describe("usePageMeta", () => {
  afterEach(() => {
    document.head.querySelector('link[rel="canonical"]')?.remove();
    document.head.querySelector('meta[name="robots"]')?.remove();
    window.history.replaceState({}, "", "/");
  });

  it("uses a query-free, fragment-free production canonical URL", () => {
    window.history.replaceState({}, "", "/manufacturer/signify/?q=light#profiles");
    render(<MetaFixture />);

    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${SITE_URL}/manufacturer/signify`,
    );
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `${SITE_URL}/manufacturer/signify`,
    );
  });

  it("marks nonexistent and error pages as noindex", () => {
    render(<MetaFixture noIndex />);

    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
  });
});
