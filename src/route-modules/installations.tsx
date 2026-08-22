import type { LinksFunction, MetaFunction } from "react-router";

import { Installations } from "../components/statistics/analytics/Installations";
import { apiPreconnectLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => apiPreconnectLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/analytics/installations",
    title: "Installation statistics",
    description: "Overview of Home Assistant and Powercalc versions used in installations.",
  });

export default Installations;
