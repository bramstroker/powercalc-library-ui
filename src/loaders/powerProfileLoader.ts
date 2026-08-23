import { redirect, type LoaderFunctionArgs } from "react-router";

import { libraryQuery } from "../queries/library.query";
import { queryClient } from "../queryClient";
import type { PowerProfile } from "../types/PowerProfile";
import { profilePath, slugifyPathSegment } from "../utils/urlSlugs.mjs";

const requireParams = (params: LoaderFunctionArgs["params"]) => {
  const manufacturer = params.manufacturer;
  const model = params.model;
  if (!manufacturer || !model) {
    throw new Error("Missing manufacturer or model in URL parameters.");
  }
  return { manufacturer, model };
}

export const powerProfileLoader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<PowerProfile> => {
  const { manufacturer, model } = requireParams(params);

  const derived = await queryClient.ensureQueryData(libraryQuery());

  const slugKey = `${slugifyPathSegment(manufacturer)}/${slugifyPathSegment(model)}`;
  const powerProfile = derived.powerProfilesBySlugKey.get(slugKey);
  if (!powerProfile) {
    throw new Response(`Unknown profile ${manufacturer}/${model}`, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const canonicalPath = profilePath(powerProfile.manufacturer.dirName, powerProfile.modelId);
  if (`/profiles/${manufacturer}/${model}` !== decodeURI(canonicalPath)) {
    // Carry the query string across: it holds the open tab, so dropping it would silently send
    // anyone following a non-canonical link back to the first tab.
    throw redirect(`${canonicalPath}${new URL(request.url).search}`, 301);
  }

  return powerProfile;
};
