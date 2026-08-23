import type { LinksFunction, MetaFunction } from "react-router";

import { SensorDimensions } from "../components/statistics/analytics/SensorDimensions";
import { getSensorDimension, sensorDimensionTitle } from "../config/sensorDimensions.mjs";
import { apiPreconnectLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => apiPreconnectLinks;

export const meta: MetaFunction = ({ params }) => {
  const dimension = params.dimension;
  if (!dimension) {
    return createPageMeta({
      path: "/analytics/sensor-dimensions",
      title: "Sensor Statistics",
      description: "Overview of Powercalc usage across different dimensions.",
    });
  }

  const knownDimension = getSensorDimension(dimension);
  const title = sensorDimensionTitle(dimension);
  return createPageMeta({
    path: `/analytics/sensor-dimensions/${encodeURIComponent(dimension)}`,
    title: `${title} Sensor Statistics`,
    description: knownDimension
      ? `${knownDimension.description}. Explore Powercalc usage by ${title.toLowerCase()}.`
      : "The requested Powercalc sensor statistics dimension could not be found.",
    noIndex: !knownDimension,
  });
};

export default SensorDimensions;
