import { redirect, type LoaderFunctionArgs } from "react-router";

import { authorPath } from "../utils/urlSlugs.mjs";

const redirectLegacyAuthor = ({ params }: Pick<LoaderFunctionArgs, "params">) => {
  const authorName = params.authorName;
  if (!authorName) throw new Response("Missing author", { status: 404 });

  throw redirect(authorPath(authorName), 301);
};

export const clientLoader = redirectLegacyAuthor;

const LegacyAuthorRoute = () => null;

export default LegacyAuthorRoute;
