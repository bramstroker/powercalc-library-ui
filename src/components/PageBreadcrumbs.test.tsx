import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { SITE_URL } from "../config/site";

import {
  breadcrumbStructuredData,
  PageBreadcrumbs,
  type BreadcrumbItem,
} from "./PageBreadcrumbs";

const items: BreadcrumbItem[] = [
  { label: "Library", to: "/" },
  { label: "Manufacturers", to: "/manufacturers" },
  { label: "Example" },
];

describe("PageBreadcrumbs", () => {
  it("renders crawlable links and marks the current page", () => {
    render(
      <MemoryRouter>
        <PageBreadcrumbs items={items} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Example")).toHaveAttribute("aria-current", "page");
  });

  it("creates matching absolute BreadcrumbList data", () => {
    expect(breadcrumbStructuredData(items)).toEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Library",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Manufacturers",
          item: `${SITE_URL}/manufacturers`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Example",
          item: undefined,
        },
      ],
    });
  });
});
