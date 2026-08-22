import type { LinksFunction, MetaFunction } from "react-router";

import { LibraryGrid } from "../components/LibraryGrid";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

// The search term goes in the title so several filtered tabs stay tellable apart, but the canonical
// URL stays `/`: a filtered view is the same page, and every combination must not become its own.
export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = ({ location }) => {
  const search = new URLSearchParams(location.search).get("search");
  return createPageMeta({ path: "/", title: search || undefined });
};

export default LibraryGrid;
