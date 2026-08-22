import type { MetaDescriptor } from "react-router";

import { SITE_NAME, SITE_URL } from "../config/site";

export const DEFAULT_DESCRIPTION =
  "Browse the Powercalc device library: power measurement profiles for smart lights, plugs, " +
  "speakers and other devices, contributed by the Home Assistant community.";

export type StructuredData = Record<string, unknown>;

/**
 * Search engines only read the first stretch of a very long `ItemList`, while every extra entry is
 * paid for twice: once in the prerendered document and once in the route's `.data` payload.
 */
export const MAX_ITEM_LIST_ENTRIES = 100;

type PageMetaOptions = {
  title?: string;
  description?: string;
  path: string;
  noIndex?: boolean;
  structuredData?: StructuredData[];
};

export const createPageMeta = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noIndex = false,
  structuredData,
}: PageMetaOptions): MetaDescriptor[] => {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const canonicalPath = path.replace(/\/+$/, "") || "/";
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonicalUrl },
    { name: "twitter:card", content: "summary" },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    ...(noIndex ? [{ name: "robots", content: "noindex, follow" } as MetaDescriptor] : []),
    ...(structuredData?.length
      ? [
          {
            "script:ld+json": {
              "@context": "https://schema.org",
              "@graph": structuredData,
            },
          } as MetaDescriptor,
        ]
      : []),
  ];
};
