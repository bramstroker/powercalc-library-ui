import { describe, expect, it } from "vitest";

import { clientLoader } from "./legacy-manufacturer";

describe("legacy manufacturer route", () => {
  it("permanently redirects to the canonical plural URL", async () => {
    let response: Response | undefined;

    try {
      await clientLoader({ params: { manufacturerName: "Brand & Co" } });
    } catch (error) {
      if (error instanceof Response) response = error;
    }

    expect(response?.status).toBe(301);
    expect(response?.headers.get("Location")).toBe("/manufacturers/brand-co");
  });

  it("returns not found when the manufacturer is missing", async () => {
    let response: Response | undefined;

    try {
      await clientLoader({ params: {} });
    } catch (error) {
      if (error instanceof Response) response = error;
    }

    expect(response?.status).toBe(404);
  });
});
