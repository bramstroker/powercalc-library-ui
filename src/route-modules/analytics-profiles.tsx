import type { LinksFunction, MetaFunction } from "react-router";

import { Profiles } from "../components/statistics/analytics/Profiles";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/analytics/profiles",
    title: "Profile statistics",
    description: "Which Powercalc device profiles are most used across opted-in installations.",
  });

export default Profiles;
