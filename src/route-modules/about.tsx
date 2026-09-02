import type { MetaFunction } from "react-router";

import { About } from "../components/About";
import { createPageMeta } from "../seo/meta";

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/about",
    title: "About the data",
    description:
      "Learn how the Powercalc profile library is maintained, sourced, refreshed and licensed, and how optional analytics protect privacy.",
  });

export default About;
