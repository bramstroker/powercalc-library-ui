import type { LinksFunction, MetaFunction } from "react-router";

import { TopMeasureDevices } from "../components/statistics/rankings/TopMeasureDevices";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/statistics/top-measure-devices",
    title: "Top Most Used Measure Devices",
    description: "The power meters most often used to measure Powercalc device profiles.",
  });

export default TopMeasureDevices;
