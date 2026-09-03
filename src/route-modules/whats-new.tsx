import { useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import { fetchLibraryChanges } from "../api/library.api";
import { WhatsNew } from "../components/library/changes/WhatsNew";
import { prerenderedOrLiveClientLoader } from "../loaders/clientLoader";
import { createPageMeta } from "../seo/meta";

const loadWhatsNew = async ({ request }: Pick<LoaderFunctionArgs, "request">) => {
  return fetchLibraryChanges({ signal: request.signal });
};

export const loader = loadWhatsNew;
export const clientLoader = prerenderedOrLiveClientLoader(loadWhatsNew);

export const meta: MetaFunction = () =>
  createPageMeta({
    path: "/whats-new",
    title: "What's new",
    description:
      "Follow newly added Powercalc profiles and meaningful measurement updates from merged contributions.",
  });

const WhatsNewRoute = () => {
  const page = useLoaderData<typeof loader>();
  return <WhatsNew initialPage={page} />;
};

export default WhatsNewRoute;
