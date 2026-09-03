import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { CountryStats } from "../../../api/analytics.api";

import { TopCountriesList } from "./TopCountriesList";

afterEach(cleanup);

describe("TopCountriesList", () => {
  it("loads country flags lazily at low priority", () => {
    const data: CountryStats[] = [
      {
        country_code: "nl",
        installation_count: 12,
        percentage: 60,
      },
      {
        country_code: "de",
        installation_count: 8,
        percentage: 40,
      },
    ];

    const { container } = render(<TopCountriesList data={data} limit={2} />);
    const flags = container.querySelectorAll("img");

    expect(flags).toHaveLength(2);
    for (const flag of flags) {
      expect(flag).toHaveAttribute("loading", "lazy");
      expect(flag).toHaveAttribute("decoding", "async");
      expect(flag).toHaveAttribute("fetchpriority", "low");
    }

    fireEvent.click(screen.getByRole("button", { name: "View all" }));

    const dialogFlags = screen.getByRole("dialog").querySelectorAll("img");
    expect(dialogFlags).toHaveLength(2);
    for (const flag of dialogFlags) {
      expect(flag).toHaveAttribute("loading", "lazy");
      expect(flag).toHaveAttribute("decoding", "async");
      expect(flag).toHaveAttribute("fetchpriority", "low");
    }
  });
});
