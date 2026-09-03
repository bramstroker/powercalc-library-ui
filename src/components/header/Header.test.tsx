import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { Header } from "./Header";

describe("Header", () => {
  afterEach(cleanup);

  it("renders the Explore navigation and marks the current route", async () => {
    render(
      <MemoryRouter initialEntries={["/manufacturers"]}>
        <Header />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    const navigation = await screen.findByRole("navigation", { name: "Explore Powercalc" });
    const items = within(navigation).getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Browse profiles",
      "Manufacturers",
      "Contributors",
      "Contribute",
      "What's new",
      "View statistics",
      "View analytics",
    ]);
    expect(within(navigation).getByRole("menuitem", { name: "Manufacturers" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(navigation).getByRole("menuitem", { name: "Browse profiles" }),
    ).not.toHaveAttribute("aria-current");
  });

  it.each([
    { resultCount: 20, totalCount: 20, label: "20 profiles" },
    { resultCount: 7, totalCount: 20, label: "7 of 20 profiles" },
  ])("shows $label in its live result status", ({ resultCount, totalCount, label }) => {
    render(
      <MemoryRouter>
        <Header resultCount={resultCount} totalCount={totalCount} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(label);
  });
});
