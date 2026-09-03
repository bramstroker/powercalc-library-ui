import type { MetaFunction } from "react-router";

import { Contribute } from "../components/content/Contribute";
import { createPageMeta } from "../seo/meta";

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/contribute",
    title: "Contribute or request a device",
    description:
      "Measure a device you own and contribute its power profile to Powercalc, or ask the community for help with an exact model.",
  });

export default Contribute;
