import { describe, expect, it } from "vitest";

import { clientLoader } from "./legacy-manufacturer";

describe("legacy manufacturer route", () => {
  it("permanently redirects to the canonical plural URL", () => {
    let response: Response | undefined;

    try {
      clientLoader({ params: { manufacturerName: "Brand & Co" } });
    } catch (error) {
      if (error instanceof Response) response = error;
    }

    expect(response?.status).toBe(301);
    expect(response?.headers.get("Location")).toBe("/manufacturers/brand-co");
  });

  it("returns not found when the manufacturer is missing", () => {
    let response: Response | undefined;

    try {
      clientLoader({ params: {} });
    } catch (error) {
      if (error instanceof Response) response = error;
    }

    expect(response?.status).toBe(404);
  });
});
