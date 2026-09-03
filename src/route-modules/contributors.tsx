import type { LinksFunction, MetaFunction } from "react-router";

import { Contributors } from "../components/contributor/directory/Contributors";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/contributors",
    title: "Contributors",
    description:
      "Meet the people expanding the Powercalc profile library and explore their latest contributions.",
  });

export default Contributors;
