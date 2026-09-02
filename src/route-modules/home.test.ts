import { describe, expect, it, vi } from "vitest";

import { API_ENDPOINTS } from "../config/api";
import { SITE_NAME, SITE_URL } from "../config/site";
import {
  DATA_CATALOG_ID,
  DATASET_LICENSE_URL,
  LIBRARY_DATASET_ID,
  POWERCALC_PUBLISHER,
} from "../seo/dataset";

import { libraryDatasetStructuredData, meta } from "./home";

vi.mock("../components/LibraryGrid", () => ({ LibraryGrid: () => null }));

const metadataFor = (search: string) =>
  meta({ location: { search } } as Parameters<typeof meta>[0]);

describe("home metadata", () => {
  it("uses the q search parameter in the page title", () => {
    const metadata = metadataFor("?q=Hue%20bulb");

    expect(metadata).toContainEqual({ title: `Hue bulb · ${SITE_NAME}` });
    expect(metadata).toContainEqual({ property: "og:title", content: `Hue bulb · ${SITE_NAME}` });
  });

  it("keeps filtered searches canonical to the library root", () => {
    const metadata = metadataFor("?q=Hue&manufacturer=Signify");

    expect(metadata).toContainEqual({ tagName: "link", rel: "canonical", href: `${SITE_URL}/` });
  });

  it("describes the library as a downloadable dataset in a data catalog", () => {
    const [catalog, dataset] = libraryDatasetStructuredData();

    expect(catalog).toMatchObject({
      "@type": "DataCatalog",
      "@id": DATA_CATALOG_ID,
      license: DATASET_LICENSE_URL,
      isAccessibleForFree: true,
      dataset: { "@id": LIBRARY_DATASET_ID },
    });
    expect(dataset).toMatchObject({
      "@type": "Dataset",
      "@id": LIBRARY_DATASET_ID,
      creator: POWERCALC_PUBLISHER,
      publisher: POWERCALC_PUBLISHER,
      license: DATASET_LICENSE_URL,
      isAccessibleForFree: true,
      includedInDataCatalog: { "@id": DATA_CATALOG_ID },
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: API_ENDPOINTS.LIBRARY,
      },
    });
    expect(String(dataset.description).length).toBeGreaterThanOrEqual(50);
  });
});
