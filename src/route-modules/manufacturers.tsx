import type { LinksFunction, MetaFunction } from "react-router";

import { Manufacturers } from "../components/Manufacturers";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/manufacturers",
    title: "Manufacturers",
    description: "Browse Powercalc device profiles grouped by manufacturer.",
  });

export default Manufacturers;
