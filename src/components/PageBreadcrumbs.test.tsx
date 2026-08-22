import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { SITE_URL } from "../config/site";
import { breadcrumbStructuredData, type BreadcrumbItem } from "../seo/breadcrumbs";

import { PageBreadcrumbs } from "./PageBreadcrumbs";

const items: BreadcrumbItem[] = [
  { label: "Home", to: "/" },
  { label: "Manufacturers", to: "/manufacturers" },
  { label: "Example" },
];

describe("PageBreadcrumbs", () => {
  it("renders crawlable links and marks the current page", () => {
    const { container } = render(
      <MemoryRouter>
        <PageBreadcrumbs items={items} />
      </MemoryRouter>,
    );

    expect(within(container).getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Example")).toHaveAttribute("aria-current", "page");

    const structuredData = container.querySelector('script[type="application/ld+json"]');
    expect(structuredData).toHaveTextContent('"@type":"BreadcrumbList"');
  });

  it("creates matching absolute BreadcrumbList data", () => {
    expect(breadcrumbStructuredData(items)).toEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
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

  it("can leave structured data to a page-level graph", () => {
    const { container } = render(
      <MemoryRouter>
        <PageBreadcrumbs items={items} includeStructuredData={false} />
      </MemoryRouter>,
    );

    expect(within(container).getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
