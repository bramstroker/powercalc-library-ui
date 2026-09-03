import type { LinksFunction, MetaFunction } from "react-router";

import { TopContributors } from "../components/statistics/rankings/TopContributors";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/statistics/top-contributors",
    title: "Top Most Active Contributors",
    description: "The community members who contributed the most Powercalc device profiles.",
  });

export default TopContributors;
