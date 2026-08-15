/**
 * Filter model for the library grid.
 *
 * The keys of `facets` double as the query parameter names, so the deep links produced by the
 * statistics pages (`/?manufacturer=Signify`) keep working unchanged.
 */
export const FACET_KEYS = [
  "deviceType",
  "colorMode",
  "qualityBand",
  "calculationStrategy",
  "measureMethod",
  "manufacturer",
  "measureDevice",
  "author",
] as const;

export type FacetKey = (typeof FACET_KEYS)[number];

export const RANGE_KEYS = ["standbyPower", "maxPower", "installationCount"] as const;

export type RangeKey = (typeof RANGE_KEYS)[number];

export type Range = [number, number];

export type LibraryFilters = {
  search: string;
  facets: Record<FacetKey, string[]>;
  ranges: Partial<Record<RangeKey, Range>>;
  /** ISO date string (yyyy-mm-dd), inclusive lower bound. */
  createdAfter?: string;
};

export const SEARCH_PARAM = "q";
export const CREATED_AFTER_PARAM = "createdAfter";

export const FACET_LABELS: Record<FacetKey, string> = {
  deviceType: "Device type",
  colorMode: "Color modes",
  qualityBand: "LUT quality",
  calculationStrategy: "Calculation strategy",
  measureMethod: "Measure method",
  manufacturer: "Manufacturer",
  measureDevice: "Measure device",
  author: "Author",
};

export const RANGE_LABELS: Record<RangeKey, string> = {
  standbyPower: "Standby power",
  maxPower: "Max power",
  installationCount: "Installations",
};

export const RANGE_UNITS: Partial<Record<RangeKey, string>> = {
  standbyPower: "W",
  maxPower: "W",
};

export const createEmptyFilters = (): LibraryFilters => ({
  search: "",
  facets: {
    deviceType: [],
    colorMode: [],
    qualityBand: [],
    calculationStrategy: [],
    measureMethod: [],
    manufacturer: [],
    measureDevice: [],
    author: [],
  },
  ranges: {},
});

export const countActiveFilters = (filters: LibraryFilters): number => {
  let count = filters.search ? 1 : 0;
  for (const key of FACET_KEYS) {
    count += filters.facets[key].length;
  }
  count += Object.keys(filters.ranges).length;
  if (filters.createdAfter) count += 1;
  return count;
};
