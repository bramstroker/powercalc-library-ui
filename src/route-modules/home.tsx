import type { LinksFunction, MetaFunction } from "react-router";

import { LibraryGrid } from "../components/library/LibraryGrid";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { libraryDatasetStructuredData } from "../seo/dataset";
import { createPageMeta } from "../seo/meta";
import { StructuredData } from "../seo/StructuredData";
import { SEARCH_PARAM } from "../types/LibraryFilters";

export { libraryDatasetStructuredData };

// The search term goes in the title so several filtered tabs stay tellable apart, but the canonical
// URL stays `/`: a filtered view is the same page, and every combination must not become its own.
export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = ({ location }) => {
  const search = new URLSearchParams(location.search).get(SEARCH_PARAM)?.trim();
  return createPageMeta({ path: "/", title: search || undefined });
};

const HomeRoute = () => (
  <>
    <StructuredData graph={libraryDatasetStructuredData()} />
    <LibraryGrid />
  </>
);

export default HomeRoute;
