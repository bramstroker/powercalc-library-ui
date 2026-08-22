import type { MetaFunction } from "react-router";

import { NotFound } from "../routes/NotFound";
import { createPageMeta } from "../seo/meta";

export const meta: MetaFunction = ({ location }) =>
  createPageMeta({
    path: location.pathname,
    title: "Page not found",
    description: "The requested Powercalc library page could not be found.",
    noIndex: true,
  });

export default NotFound;
