import { useLoaderData, type MetaFunction } from "react-router";

import { Profile } from "../components/Profile";
import { SITE_URL } from "../config/site";
import { prerenderedOrLiveClientLoader } from "../loaders/clientLoader";
import { powerProfileLoader } from "../loaders/powerProfileLoader";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import { createPageMeta, type StructuredData } from "../seo/meta";
import { StructuredData as StructuredDataScript } from "../seo/StructuredData";
import type { PowerProfile } from "../types/PowerProfile";
import { authorPath, manufacturerPath, profilePath } from "../utils/urlSlugs.mjs";

export const loader = powerProfileLoader;

export const clientLoader = prerenderedOrLiveClientLoader(powerProfileLoader);

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
    profile.maxPower != null ? `Max power ${profile.maxPower} W.` : null,
    profile.standbyPower != null ? `Standby power ${profile.standbyPower} W.` : null,
  ]
    .filter(Boolean)
    .join(" ");

export const profileStructuredData = (profile: PowerProfile): StructuredData[] => {
  const { fullName: manufacturerName, dirName } = profile.manufacturer;
  const canonicalPath = profilePath(dirName, profile.modelId);
  const profileUrl = `${SITE_URL}${canonicalPath}`;
  const title = `${manufacturerName} ${profile.modelId}`;
  const description = pageDescription(profile);

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
      dateCreated: isoDate(profile.createdAt),
      dateModified: isoDate(profile.updatedAt),
      measurementTechnique: [profile.calculationStrategy, profile.measureMethod].filter(Boolean),
      keywords: ["Powercalc", profile.deviceType, profile.calculationStrategy, manufacturerName],
      creator: profile.authors.map((author) => ({
        "@type": "Person",
        name: author.name,
        url: `${SITE_URL}${authorPath(author.githubUsername)}`,
        sameAs: `https://github.com/${encodeURIComponent(author.githubUsername)}`,
      })),
      about: {
        "@type": "Product",
        name: profile.name || title,
        model: profile.modelId,
        manufacturer: {
          "@type": "Organization",
          name: manufacturerName,
          url: `${SITE_URL}${manufacturerPath(dirName)}`,
        },
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
      isPartOf: {
        "@type": "Dataset",
        name: "Powercalc profile library",
        url: SITE_URL,
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
    path: profilePath(loaderData.manufacturer.dirName, loaderData.modelId),
    title: `${loaderData.manufacturer.fullName} ${loaderData.modelId}`,
    description: pageDescription(loaderData),
  });
};

const ProfileRoute = () => {
  const profile = useLoaderData<typeof loader>();

  return (
    <>
      <StructuredDataScript graph={profileStructuredData(profile)} />
      <Profile />
    </>
  );
};

export default ProfileRoute;
