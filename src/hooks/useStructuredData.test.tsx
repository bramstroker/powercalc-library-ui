import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useStructuredData } from "./useStructuredData";

const Fixture = ({ name }: { name?: string }) => {
  useStructuredData(name ? [{ "@type": "Thing", name }] : undefined);
  return null;
};

describe("useStructuredData", () => {
  afterEach(() => document.getElementById("page-structured-data")?.remove());

  it("writes and updates one JSON-LD graph", () => {
    const { rerender } = render(<Fixture name={'A <useful> "profile"'} />);
    const script = document.getElementById("page-structured-data");

    expect(script).toHaveAttribute("type", "application/ld+json");
    expect(JSON.parse(script?.textContent ?? "")).toEqual({
      "@context": "https://schema.org",
      "@graph": [{ "@type": "Thing", name: 'A <useful> "profile"' }],
    });

    rerender(<Fixture name="Updated" />);
    expect(document.querySelectorAll("#page-structured-data")).toHaveLength(1);
    expect(document.getElementById("page-structured-data")?.textContent).toContain(
      "Updated",
    );
  });

  it("removes route data when a page has none", () => {
    const { rerender } = render(<Fixture name="Existing" />);
    rerender(<Fixture />);

    expect(document.getElementById("page-structured-data")).toBeNull();
  });
});
