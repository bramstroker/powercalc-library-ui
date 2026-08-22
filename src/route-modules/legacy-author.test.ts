import { describe, expect, it } from "vitest";

import { clientLoader } from "./legacy-author";

describe("legacy author route", () => {
  it("permanently redirects to the canonical contributor URL", async () => {
    let response: Response | undefined;

    try {
      await clientLoader({ params: { authorName: "Alice Example" } });
    } catch (error) {
      if (error instanceof Response) response = error;
    }

    expect(response?.status).toBe(301);
    expect(response?.headers.get("Location")).toBe("/contributors/alice-example");
  });

  it("returns not found when the username is missing", async () => {
    let response: Response | undefined;

    try {
      await clientLoader({ params: {} });
    } catch (error) {
      if (error instanceof Response) response = error;
    }

    expect(response?.status).toBe(404);
  });
});
