import type { MetaFunction } from "react-router";

import { MeasurementQuality } from "../components/content/MeasurementQuality";
import { createPageMeta } from "../seo/meta";

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/measurement-quality",
    title: "Measurement quality",
    description:
      "Understand Powercalc measurement methodology, LUT quality bands, supported meters, voltage caveats and values marked as estimated.",
  });

export default MeasurementQuality;
