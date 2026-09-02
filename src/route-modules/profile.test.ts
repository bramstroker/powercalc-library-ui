import { describe, expect, it } from "vitest";

import { API_ENDPOINTS } from "../config/api";
import { SITE_URL } from "../config/site";
import {
  DATA_CATALOG_ID,
  DATASET_LICENSE_URL,
  LIBRARY_DATASET_ID,
  POWERCALC_PUBLISHER,
} from "../seo/dataset";
import type { PowerProfile } from "../types/PowerProfile";

import { profileStructuredData } from "./profile";

const profile = {
  manufacturer: { dirName: "signify", fullName: "Signify", aliases: [] },
  modelId: "LCA001",
  name: "Hue White and Color Ambiance A60",
  deviceType: "light",
  calculationStrategy: "lut",
  measureMethod: "manual",
  measureDevice: "Shelly Plug S",
  authors: [],
  createdAt: new Date("2025-01-02T00:00:00Z"),
  updatedAt: new Date("2025-02-03T00:00:00Z"),
  standbyPower: 0.4,
  maxPower: 9,
} as unknown as PowerProfile;

describe("profileStructuredData", () => {
  it("emits one complete downloadable Dataset and references its parent by URL", () => {
    const graph = profileStructuredData(profile);
    const datasets = graph.filter((item) => item["@type"] === "Dataset");
    const dataset = datasets[0];
    const profileUrl = `${SITE_URL}/profiles/signify/lca001`;

    expect(datasets).toHaveLength(1);
    expect(dataset).toMatchObject({
      name: "Signify LCA001 power profile",
      url: profileUrl,
      identifier: [profileUrl, "signify/LCA001"],
      creator: POWERCALC_PUBLISHER,
      publisher: POWERCALC_PUBLISHER,
      license: DATASET_LICENSE_URL,
      isAccessibleForFree: true,
      includedInDataCatalog: DATA_CATALOG_ID,
      isPartOf: LIBRARY_DATASET_ID,
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${API_ENDPOINTS.PROFILE}/signify/LCA001`,
      },
    });
    expect(String(dataset.description).length).toBeGreaterThanOrEqual(50);
  });
});
