import { redirect, type LoaderFunctionArgs, type MetaFunction, useLoaderData } from "react-router";

import { Manufacturer } from "../components/Manufacturer";
import { SITE_URL } from "../config/site";
import { prerenderedOrLiveClientLoader } from "../loaders/clientLoader";
import { libraryQuery } from "../queries/library.query";
import { queryClient } from "../queryClient";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import { createPageMeta, MAX_ITEM_LIST_ENTRIES, type StructuredData } from "../seo/meta";
import { StructuredData as StructuredDataScript } from "../seo/StructuredData";
import { manufacturerIntroduction } from "../utils/manufacturerPresentation";
import { manufacturerPath, profilePath, slugifyPathSegment } from "../utils/urlSlugs.mjs";

// Declared separately from the `loader` export: the React Router Vite plugin strips server-only
// exports from the client bundle, so a `clientLoader` referencing `loader` by name would throw
// `ReferenceError: loader is not defined` in the browser.
const loadManufacturer = async ({
  params,
  request,
}: Pick<LoaderFunctionArgs, "params" | "request">) => {
  const manufacturerName = params.manufacturerName;
  if (!manufacturerName) throw new Response("Missing manufacturer", { status: 404 });

  const library = await queryClient.ensureQueryData(libraryQuery());
  const slug = slugifyPathSegment(manufacturerName);
  const manufacturer = library.manufacturersBySlug[slug];
  if (!manufacturer) {
    throw new Response(`Unknown manufacturer ${manufacturerName}`, { status: 404 });
  }

  const canonicalPath = manufacturerPath(manufacturer.dirName);
  if (`/manufacturers/${manufacturerName}` !== decodeURI(canonicalPath)) {
    // The query string carries page state (sort, filters), so it survives the canonicalisation.
    throw redirect(`${canonicalPath}${new URL(request.url).search}`, 301);
  }

  return {
    manufacturer,
    profiles: library.profilesByManufacturerSlug.get(slug) ?? [],
  };
};

export const loader = loadManufacturer;
export const clientLoader = prerenderedOrLiveClientLoader(loadManufacturer);

type ManufacturerData = Awaited<ReturnType<typeof loadManufacturer>>;

const manufacturerDescription = ({ manufacturer, profiles }: ManufacturerData) =>
  manufacturerIntroduction(manufacturer, profiles);

export const manufacturerStructuredData = (data: ManufacturerData): StructuredData[] => {
  const { manufacturer, profiles } = data;
  const displayName = manufacturer.fullName;
  const canonicalPath = manufacturerPath(manufacturer.dirName);
  const description = manufacturerDescription(data);

  return [
    breadcrumbStructuredData([
      { label: "Home", to: "/" },
      { label: "Manufacturers", to: "/manufacturers" },
      { label: displayName },
    ]),
    {
      "@type": "CollectionPage",
      name: `${displayName} Powercalc profiles`,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      about: {
        "@type": "Organization",
        name: displayName,
        alternateName: manufacturer.aliases,
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: profiles.length,
        itemListElement: profiles.slice(0, MAX_ITEM_LIST_ENTRIES).map((profile, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${profile.manufacturer.fullName} ${profile.modelId}`,
          url: `${SITE_URL}${profilePath(profile.manufacturer.dirName, profile.modelId)}`,
        })),
      },
    },
  ];
};

export const meta: MetaFunction<typeof loader> = ({ loaderData, location, error }) => {
  if (error || !loaderData) {
    return createPageMeta({
      path: location.pathname,
      title: "Manufacturer not found",
      description: "This manufacturer does not exist in the current Powercalc library.",
      noIndex: true,
    });
  }

  return createPageMeta({
    path: manufacturerPath(loaderData.manufacturer.dirName),
    title: loaderData.manufacturer.fullName,
    description: manufacturerDescription(loaderData),
  });
};

const ManufacturerRoute = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <StructuredDataScript graph={manufacturerStructuredData(data)} />
      <Manufacturer manufacturer={data.manufacturer} profiles={data.profiles} />
    </>
  );
};

export default ManufacturerRoute;
