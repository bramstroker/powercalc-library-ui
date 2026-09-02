import { API_ENDPOINTS } from "../config/api";
import { SITE_NAME, SITE_URL } from "../config/site";

import type { StructuredData } from "./meta";

export const DATA_CATALOG_ID = `${SITE_URL}/#catalog`;
export const LIBRARY_DATASET_ID = `${SITE_URL}/#dataset`;
export const DATASET_LICENSE_URL = "https://opensource.org/license/mit";
export const POWERCALC_PROJECT_URL = "https://github.com/bramstroker/homeassistant-powercalc";

export const POWERCALC_PUBLISHER = {
  "@type": "Organization",
  name: "Powercalc",
  url: POWERCALC_PROJECT_URL,
} as const;

export const LIBRARY_DATASET_DESCRIPTION =
  "Community-maintained device power measurement profiles for Powercalc, including model " +
  "identifiers, calculation strategies, measurement metadata, and measured power values.";

export const libraryDatasetStructuredData = (): StructuredData[] => [
  {
    "@type": "DataCatalog",
    "@id": DATA_CATALOG_ID,
    name: SITE_NAME,
    description:
      "A browsable catalog of community-contributed Powercalc device power measurement profiles.",
    url: `${SITE_URL}/`,
    publisher: POWERCALC_PUBLISHER,
    license: DATASET_LICENSE_URL,
    isAccessibleForFree: true,
    dataset: { "@id": LIBRARY_DATASET_ID },
  },
  {
    "@type": "Dataset",
    "@id": LIBRARY_DATASET_ID,
    name: "Powercalc device power profile dataset",
    description: LIBRARY_DATASET_DESCRIPTION,
    url: `${SITE_URL}/`,
    sameAs: `${POWERCALC_PROJECT_URL}/tree/master/profile_library`,
    identifier: [LIBRARY_DATASET_ID, "powercalc-profile-library"],
    creator: POWERCALC_PUBLISHER,
    publisher: POWERCALC_PUBLISHER,
    license: DATASET_LICENSE_URL,
    isAccessibleForFree: true,
    includedInDataCatalog: { "@id": DATA_CATALOG_ID },
    distribution: {
      "@type": "DataDownload",
      name: "Powercalc profile library JSON",
      encodingFormat: "application/json",
      contentUrl: API_ENDPOINTS.LIBRARY,
    },
  },
];
