import { redirect, type LoaderFunctionArgs, type MetaFunction, useLoaderData } from "react-router";

import { ProfileCategory } from "../components/profile/ProfileCategory";
import { DEVICE_TYPE_CATEGORY } from "../config/profileCategories";
import { SITE_URL } from "../config/site";
import { prerenderedOrLiveClientLoader } from "../loaders/clientLoader";
import { libraryQuery } from "../queries/library.query";
import { queryClient } from "../queryClient";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import { createPageMeta, MAX_ITEM_LIST_ENTRIES, type StructuredData } from "../seo/meta";
import { StructuredData as StructuredDataScript } from "../seo/StructuredData";
import { profilePath, slugifyPathSegment } from "../utils/urlSlugs.mjs";

const loadProfileCategory = async ({
  params,
  request,
}: Pick<LoaderFunctionArgs, "params" | "request">) => {
  const categoryName = params.categoryName;
  if (!categoryName) throw new Response("Missing profile category", { status: 404 });

  const url = new URL(request.url);
  const config = DEVICE_TYPE_CATEGORY;
  const requestedSlug = slugifyPathSegment(categoryName);
  const library = await queryClient.ensureQueryData(libraryQuery());
  let value: string | undefined;

  for (const profile of library.powerProfiles) {
    value = config
      .values(profile)
      .find((candidate) => slugifyPathSegment(candidate) === requestedSlug);
    if (value) break;
  }

  if (!value) throw new Response(`Unknown profile category ${categoryName}`, { status: 404 });

  const profiles = library.powerProfiles.filter((profile) =>
    config.values(profile).includes(value),
  );
  const canonicalPath = config.path(value);
  // Compare the matched parameter rather than request.url. React Router generates loader payloads
  // through `<route>.data`, so the request pathname intentionally differs from the page URL while
  // still representing the canonical category.
  if (`${config.indexPath}/${categoryName}` !== decodeURI(canonicalPath)) {
    throw redirect(`${canonicalPath}${url.search}`, 301);
  }

  return { value, profiles };
};

export const loader = loadProfileCategory;
export const clientLoader = prerenderedOrLiveClientLoader(loadProfileCategory);

type ProfileCategoryData = Awaited<ReturnType<typeof loadProfileCategory>>;

export const profileCategoryStructuredData = (data: ProfileCategoryData): StructuredData[] => {
  const config = DEVICE_TYPE_CATEGORY;
  const label = config.label(data.value);
  const canonicalPath = config.path(data.value);

  return [
    breadcrumbStructuredData([
      { label: "Home", to: "/" },
      { label: config.breadcrumbLabel, to: config.indexPath },
      { label },
    ]),
    {
      "@type": "CollectionPage",
      name: `${label} power profiles`,
      description: config.description(data.value, label, data.profiles.length),
      url: `${SITE_URL}${canonicalPath}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: data.profiles.length,
        itemListElement: data.profiles.slice(0, MAX_ITEM_LIST_ENTRIES).map((profile, index) => ({
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
      title: "Profile category not found",
      description: "This category does not exist in the current Powercalc library.",
      noIndex: true,
    });
  }

  const config = DEVICE_TYPE_CATEGORY;
  const label = config.label(loaderData.value);
  return createPageMeta({
    path: config.path(loaderData.value),
    title: `${label} power profiles`,
    description: config.description(loaderData.value, label, loaderData.profiles.length),
  });
};

const ProfileCategoryRoute = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <StructuredDataScript graph={profileCategoryStructuredData(data)} />
      <ProfileCategory config={DEVICE_TYPE_CATEGORY} value={data.value} profiles={data.profiles} />
    </>
  );
};

export default ProfileCategoryRoute;
