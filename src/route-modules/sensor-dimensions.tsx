import type { LinksFunction, MetaFunction } from "react-router";

import { SensorDimensions } from "../components/statistics/analytics/SensorDimensions";
import { apiPreconnectLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

// Also serves `/analytics/sensor-dimensions/:dimension`: the component reads the optional route
// param itself and swaps the overview for that dimension's detail chart. The detail view has no
// fixed set of URLs, so it points its canonical at the overview rather than at itself.
export const links: LinksFunction = () => apiPreconnectLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/analytics/sensor-dimensions",
    title: "Sensor Statistics",
    description: "Overview of Powercalc usage across different dimensions.",
  });

export default SensorDimensions;
