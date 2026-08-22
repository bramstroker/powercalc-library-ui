import type { LinksFunction, MetaFunction } from "react-router";

import { TopManufacturers } from "../components/statistics/TopManufacturers";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/statistics/top-manufacturers",
    title: "Top Most Common Manufacturers",
    description: "The manufacturers with the most measured devices in the Powercalc library.",
  });

export default TopManufacturers;
