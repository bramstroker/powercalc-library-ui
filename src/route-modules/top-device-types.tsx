import type { LinksFunction, MetaFunction } from "react-router";

import { TopDeviceTypes } from "../components/statistics/rankings/TopDeviceTypes";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/statistics/top-device-types",
    title: "Top Most Common Device Types",
    description: "Which device types are best covered by the Powercalc profile library.",
  });

export default TopDeviceTypes;
