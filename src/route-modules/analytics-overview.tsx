import type { LinksFunction, MetaFunction } from "react-router";

import { AnalyticsOverview } from "../components/statistics/analytics/AnalyticsOverview";
import { apiPreconnectLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => apiPreconnectLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/analytics",
    title: "Analytics Dashboards",
    description:
      "Overview of Powercalc analytics dashboards providing insights into usage patterns and statistics.",
  });

export default AnalyticsOverview;
