import type { LinksFunction, MetaFunction } from "react-router";

import { TimeSeries } from "../components/statistics/analytics/TimeSeries";
import { apiPreconnectLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => apiPreconnectLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/analytics/time-series",
    title: "Usage over time",
    description: "Powercalc opt-ins, new installations and sensor counts over time.",
  });

export default TimeSeries;
