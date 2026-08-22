import type { MetaFunction } from "react-router";

import { StatisticsOverview } from "../components/statistics/StatisticsOverview";
import { createPageMeta } from "../seo/meta";

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/statistics",
    title: "Library statistics",
    description: "Explore Powercalc profile rankings, library coverage, and contribution trends.",
  });

export default StatisticsOverview;
