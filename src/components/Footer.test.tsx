import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { Footer } from "./Footer";

describe("Footer", () => {
  it("exposes the main site sections as crawlable internal links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole("navigation", { name: "Footer navigation" });
    const links = within(navigation).getAllByRole("link");

    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Browse profiles", "/"],
      ["Manufacturers", "/manufacturers"],
      ["Device types", "/device-types"],
      ["Contributors", "/contributors"],
      ["What's new", "/whats-new"],
      ["Statistics", "/statistics"],
      ["Analytics", "/analytics"],
    ]);

    expect(screen.getByRole("link", { name: "Support Powercalc" })).toHaveAttribute(
      "href",
      "https://buymeacoffee.com/bramski",
    );
  });
});
