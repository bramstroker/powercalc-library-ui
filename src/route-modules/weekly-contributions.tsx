import type { LinksFunction, MetaFunction } from "react-router";

import { WeeklyContributions } from "../components/statistics/trends/WeeklyContributions";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/statistics/weekly-contributions",
    title: "Weekly contributions",
    description: "New Powercalc device profiles added to the library each week.",
  });

export default WeeklyContributions;
