import { useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import type { Summary } from "../api/analytics.api";
import { profileJsonUrl } from "../api/profileDetails.api";
import { Profile } from "../components/Profile";
import { SITE_URL } from "../config/site";
import { prerenderedOrLiveClientLoader } from "../loaders/clientLoader";
import { powerProfileLoader } from "../loaders/powerProfileLoader";
import { dailySummaryQuery } from "../queries/analytics.query";
import { queryClient } from "../queryClient";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import {
  DATA_CATALOG_ID,
  DATASET_LICENSE_URL,
  LIBRARY_DATASET_ID,
  POWERCALC_PUBLISHER,
} from "../seo/dataset";
import { createPageMeta, type StructuredData } from "../seo/meta";
import { StructuredData as StructuredDataScript } from "../seo/StructuredData";
import type { PowerProfile } from "../types/PowerProfile";
import { humanizeIdentifier } from "../utils/profilePresentation";
import {
  authorPath,
  manufacturerPath,
  profilePath,
  profileSocialImagePath,
} from "../utils/urlSlugs.mjs";

export type ProfileLoaderData = {
  profile: PowerProfile;
  summary: Summary;
};

const loadProfile = async (args: LoaderFunctionArgs): Promise<ProfileLoaderData> => {
  const profile = await powerProfileLoader(args);
  const summary = await queryClient.ensureQueryData(dailySummaryQuery());

  return { profile, summary };
};

// React Router strips the server-only `loader` export from the browser bundle. Keep the shared
// implementation separately addressable so `clientLoader` never points at that removed binding.
export const loader = loadProfile;
export const clientLoader = prerenderedOrLiveClientLoader(loadProfile);

// Loader data reaches this module as live `Date` objects during prerendering and as revived values
// after a client navigation, so normalise both before serialising.
const isoDate = (value: unknown) => {
  if (value == null) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
};

const pageDescription = (profile: PowerProfile) =>
  [
    profile.name,
    `${profile.deviceType} power profile measured with ${profile.measureDevice || "an unknown device"}.`,
    "This dataset documents device power consumption and calculation metadata for Powercalc.",
    profile.maxPower != null ? `Max power ${profile.maxPower} W.` : null,
    profile.standbyPower != null ? `Standby power ${profile.standbyPower} W.` : null,
  ]
    .filter(Boolean)
    .join(" ");

const pageTitle = (profile: PowerProfile) =>
  `${profile.manufacturer.fullName} ${profile.name} (${profile.modelId})`;

const socialImageAlt = (profile: PowerProfile) => {
  const figures = [
    profile.standbyPower != null ? `${profile.standbyPower} W standby` : null,
    profile.maxPower != null ? `${profile.maxPower} W maximum` : null,
  ].filter(Boolean);

  return [
    `${profile.manufacturer.fullName} ${profile.name} (${profile.modelId}) power profile`,
    humanizeIdentifier(profile.deviceType),
    figures.length > 0 ? figures.join(" and ") : null,
  ]
    .filter(Boolean)
    .join(" · ");
};

export const profileStructuredData = (profile: PowerProfile): StructuredData[] => {
  const { fullName: manufacturerName, dirName } = profile.manufacturer;
  const canonicalPath = profilePath(dirName, profile.modelId);
  const profileUrl = `${SITE_URL}${canonicalPath}`;
  const title = `${manufacturerName} ${profile.modelId}`;
  const description = pageDescription(profile);
  const creators = profile.authors.map((author) => ({
    "@type": "Person",
    name: author.name,
    url: `${SITE_URL}${authorPath(author.githubUsername)}`,
    sameAs: `https://github.com/${encodeURIComponent(author.githubUsername)}`,
  }));

  return [
    breadcrumbStructuredData([
      { label: "Home", to: "/" },
      { label: "Manufacturers", to: "/manufacturers" },
      { label: manufacturerName, to: manufacturerPath(dirName) },
      { label: profile.modelId },
    ]),
    {
      "@type": "Dataset",
      "@id": `${profileUrl}#profile`,
      name: `${title} power profile`,
      description,
      url: profileUrl,
      identifier: [profileUrl, `${dirName}/${profile.modelId}`],
      dateCreated: isoDate(profile.createdAt),
      dateModified: isoDate(profile.updatedAt),
      license: DATASET_LICENSE_URL,
      isAccessibleForFree: true,
      publisher: POWERCALC_PUBLISHER,
      measurementTechnique: [profile.calculationStrategy, profile.measureMethod].filter(Boolean),
      keywords: ["Powercalc", profile.deviceType, profile.calculationStrategy, manufacturerName],
      creator: creators.length > 0 ? creators : POWERCALC_PUBLISHER,
      about: {
        // This describes what was measured, not a purchasable product. Using `Product` here makes
        // Google treat the nested entity as a product snippet and require offers or reviews that
        // the measurement library neither has nor should invent.
        "@type": "Thing",
        name: `${manufacturerName} ${profile.name || profile.modelId}`,
        identifier: profile.modelId,
        additionalType: humanizeIdentifier(profile.deviceType),
      },
      variableMeasured: [
        profile.standbyPower == null
          ? null
          : {
              "@type": "PropertyValue",
              name: "Standby power",
              value: profile.standbyPower,
              unitText: "W",
            },
        profile.maxPower == null
          ? null
          : {
              "@type": "PropertyValue",
              name: "Maximum power",
              value: profile.maxPower,
              unitText: "W",
            },
      ].filter(Boolean),
      includedInDataCatalog: DATA_CATALOG_ID,
      isPartOf: LIBRARY_DATASET_ID,
      distribution: {
        "@type": "DataDownload",
        name: `${title} raw profile JSON`,
        encodingFormat: "application/json",
        contentUrl: profileJsonUrl(profile),
      },
    },
  ];
};

export const meta: MetaFunction<typeof loader> = ({ loaderData, location, error }) => {
  if (error || !loaderData) {
    return createPageMeta({
      path: location.pathname,
      title: "Profile not found",
      description: "This device profile does not exist in the current Powercalc library.",
      noIndex: true,
    });
  }

  return createPageMeta({
    path: profilePath(loaderData.profile.manufacturer.dirName, loaderData.profile.modelId),
    title: pageTitle(loaderData.profile),
    description: pageDescription(loaderData.profile),
    socialImage: {
      url: `${SITE_URL}${profileSocialImagePath(
        loaderData.profile.manufacturer.dirName,
        loaderData.profile.modelId,
      )}`,
      alt: socialImageAlt(loaderData.profile),
    },
  });
};

const ProfileRoute = () => {
  const { profile, summary } = useLoaderData<typeof loader>();

  return (
    <>
      <StructuredDataScript graph={profileStructuredData(profile)} />
      <Profile profile={profile} summary={summary} />
    </>
  );
};

export default ProfileRoute;
