import { redirect, type LoaderFunctionArgs } from "react-router";

import { manufacturerPath } from "../utils/urlSlugs.mjs";

const redirectLegacyManufacturer = ({ params }: Pick<LoaderFunctionArgs, "params">) => {
  const manufacturerName = params.manufacturerName;
  if (!manufacturerName) throw new Response("Missing manufacturer", { status: 404 });

  throw redirect(manufacturerPath(manufacturerName), 301);
};

export const clientLoader = redirectLegacyManufacturer;

const LegacyManufacturerRoute = () => null;

export default LegacyManufacturerRoute;
