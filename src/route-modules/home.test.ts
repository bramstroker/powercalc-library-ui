import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";

import { SITE_NAME } from "../config/site";
import { SEARCH_PARAM } from "../types/LibraryFilters";

import { meta } from "./home";

/** `meta` is only ever called by the router, which passes far more than these two fields. */
const titleFor = (search: string) => {
  const descriptors = (meta as (args: { location: { search: string } }) => MetaDescriptor[])({
    location: { search },
  });
  return descriptors.find((entry): entry is { title: string } => "title" in entry)?.title;
};

describe("home route meta", () => {
  it("puts the active search term in the document title", () => {
    // Regression: this read a `?search=` parameter while the grid has always written `?q=`, so the
    // term never reached the title and every filtered tab was called "Powercalc profile library".
    expect(titleFor(`?${SEARCH_PARAM}=ikea`)).toBe(`ikea · ${SITE_NAME}`);
  });

  it("falls back to the plain site name when nothing is searched for", () => {
    expect(titleFor("")).toBe(SITE_NAME);
    expect(titleFor(`?${SEARCH_PARAM}=`)).toBe(SITE_NAME);
  });

  it("ignores the other filter parameters", () => {
    expect(titleFor("?manufacturer=Signify&deviceType=light")).toBe(SITE_NAME);
  });
});
