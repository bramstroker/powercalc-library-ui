import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
  useLoaderData,
} from "react-router";

import { Author } from "../components/Author";
import { SITE_URL } from "../config/site";
import { prerenderedOrLiveClientLoader } from "../loaders/clientLoader";
import { authorRank, libraryQuery } from "../queries/library.query";
import { queryClient } from "../queryClient";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import { createPageMeta, MAX_ITEM_LIST_ENTRIES, type StructuredData } from "../seo/meta";
import { StructuredData as StructuredDataScript } from "../seo/StructuredData";
import { contributorAvatarUrl } from "../utils/avatarPaths";
import { plural } from "../utils/plural";
import { humanizeIdentifier } from "../utils/profilePresentation";
import { authorPath, profilePath, slugifyPathSegment } from "../utils/urlSlugs.mjs";

// Declared separately from the `loader` export: the React Router Vite plugin strips server-only
// exports from the client bundle, so a `clientLoader` referencing `loader` by name would throw
// `ReferenceError: loader is not defined` in the browser.
const loadAuthor = async ({
  params,
  request,
}: Pick<LoaderFunctionArgs, "params" | "request">) => {
  const authorName = params.authorName;
  if (!authorName) throw new Response("Missing author", { status: 404 });

  const library = await queryClient.ensureQueryData(libraryQuery());
  const slug = slugifyPathSegment(authorName);
  const author = library.authorsBySlug[slug];
  if (!author) throw new Response(`Unknown author ${authorName}`, { status: 404 });

  const canonicalPath = authorPath(author.githubUsername);
  if (`/contributors/${authorName}` !== decodeURI(canonicalPath)) {
    // The query string carries page state (sort, filters), so it survives the canonicalisation.
    throw redirect(`${canonicalPath}${new URL(request.url).search}`, 301);
  }

  return {
    authorDetails: author,
    authorProfiles: library.profilesByAuthorSlug.get(slug) ?? [],
    authorRank: authorRank(library, author.githubUsername),
  };
};

export const loader = loadAuthor;
export const clientLoader = prerenderedOrLiveClientLoader(loadAuthor);

type AuthorData = Awaited<ReturnType<typeof loadAuthor>>;

const authorDescription = ({ authorDetails, authorProfiles }: AuthorData) =>
  `${plural(authorProfiles.length, "Powercalc device profile")} contributed by ${
    authorDetails.name || authorDetails.githubUsername
  }.`;

export const authorStructuredData = (data: AuthorData): StructuredData[] => {
  const { authorDetails, authorProfiles } = data;
  const githubUsername = authorDetails.githubUsername;
  const displayName = authorDetails.name || githubUsername;
  const canonicalPath = authorPath(githubUsername);
  const description = authorDescription(data);
  const avatarUrl = contributorAvatarUrl(githubUsername);

  const knowsAbout = [
    ...new Set(authorProfiles.map((profile) => profile.manufacturer.fullName)),
    ...new Set(authorProfiles.map((profile) => humanizeIdentifier(profile.deviceType))),
  ];

  return [
    breadcrumbStructuredData([
      { label: "Home", to: "/" },
      { label: "Contributors", to: "/contributors" },
      { label: displayName },
    ]),
    {
      "@type": "ProfilePage",
      name: `${displayName} — Powercalc contributor`,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      mainEntity: {
        "@type": "Person",
        name: displayName,
        alternateName: `@${githubUsername}`,
        url: `${SITE_URL}${canonicalPath}`,
        image: avatarUrl.startsWith("/") ? `${SITE_URL}${avatarUrl}` : avatarUrl,
        sameAs: `https://github.com/${encodeURIComponent(githubUsername)}`,
        knowsAbout,
      },
      hasPart: {
        "@type": "ItemList",
        numberOfItems: authorProfiles.length,
        itemListElement: authorProfiles.slice(0, MAX_ITEM_LIST_ENTRIES).map((profile, index) => ({
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
      title: "Author not found",
      description: "This contributor does not exist in the current Powercalc library.",
      noIndex: true,
    });
  }

  const { authorDetails } = loaderData;

  return createPageMeta({
    path: authorPath(authorDetails.githubUsername),
    title: authorDetails.name || authorDetails.githubUsername,
    description: authorDescription(loaderData),
  });
};

const AuthorRoute = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <StructuredDataScript graph={authorStructuredData(data)} />
      <Author
        authorDetails={data.authorDetails}
        authorProfiles={data.authorProfiles}
        authorRank={data.authorRank}
      />
    </>
  );
};

export default AuthorRoute;
