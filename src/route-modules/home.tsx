import type { LinksFunction, MetaFunction } from "react-router";

import { LibraryGrid } from "../components/LibraryGrid";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";
import { SEARCH_PARAM } from "../types/LibraryFilters";

// The search term goes in the title so several filtered tabs stay tellable apart, but the canonical
// URL stays `/`: a filtered view is the same page, and every combination must not become its own.
export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = ({ location }) => {
  // Read through `SEARCH_PARAM` rather than a literal: the grid writes the term under `q`, so a
  // hardcoded "search" here silently never matched and the title never picked the term up.
  const search = new URLSearchParams(location.search).get(SEARCH_PARAM);
  return createPageMeta({ path: "/", title: search || undefined });
};

export default LibraryGrid;
