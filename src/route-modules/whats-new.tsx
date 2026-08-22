import type { LinksFunction, MetaFunction } from "react-router";

import { NEW_PROFILE_WINDOW_DAYS, WhatsNew } from "../components/statistics/WhatsNew";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/whats-new",
    title: "What's new",
    description: `Power profiles added to the Powercalc library in the last ${NEW_PROFILE_WINDOW_DAYS} days.`,
  });

export default WhatsNew;
