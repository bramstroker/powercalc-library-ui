import type { FacetKey, LibraryFilters, Range, RangeKey } from "../types/LibraryFilters";
import { FACET_KEYS, RANGE_KEYS } from "../types/LibraryFilters";
import type { PowerProfile } from "../types/PowerProfile";

import { getProfileQualityBand } from "./lutQuality";

export type FacetCount = {
  value: string;
  count: number;
};

/**
 * Supply voltages cluster around two standards, and a profile measured at 232 V and one measured
 * at 228 V belong in the same bucket. Two options are useful to filter on; seven exact numbers are
 * not, which is why the library keeps the number and the grouping lives here.
 */
export const mainsVoltageBand = (voltage: number): string => (voltage < 160 ? "120 V" : "230 V");

/**
 * The values of a profile that a facet can match on. Multi-valued for `colorMode`, which is an
 * array on the profile, and for `author`, where we accept each author's display name or GitHub
 * username so older `?author=` links keep resolving.
 */
export const getFacetValues = (profile: PowerProfile, key: FacetKey): string[] => {
  switch (key) {
    case "deviceType":
      return profile.deviceType ? [profile.deviceType] : [];
    case "colorMode":
      return profile.colorModes ?? [];
    case "qualityBand":
      return [getProfileQualityBand(profile)];
    case "calculationStrategy":
      return profile.calculationStrategy ? [profile.calculationStrategy] : [];
    case "measureMethod":
      return profile.measureMethod ? [profile.measureMethod] : [];
    case "manufacturer":
      return profile.manufacturer.fullName ? [profile.manufacturer.fullName] : [];
    case "measureDevice":
      return profile.measureDevice ? [profile.measureDevice] : [];
    case "author":
      return profile.authors
        .flatMap((author) => [author.name, author.githubUsername])
        .filter(Boolean);
    case "socket":
      return profile.deviceSpecs?.socket ?? [];
    case "formFactor":
      return profile.deviceSpecs?.formFactor ? [profile.deviceSpecs.formFactor] : [];
    case "connectivity":
      return profile.deviceSpecs?.connectivity ?? [];
    case "mainsVoltage":
      return profile.mainsVoltage ? [mainsVoltageBand(profile.mainsVoltage)] : [];
  }
};

/**
 * The single value shown in the facet list. `getFacetValues` may return aliases on top of this
 * (an author's GitHub username), which we do not want to list as separate options.
 */
const getFacetLabelValue = (profile: PowerProfile, key: FacetKey): string[] => {
  if (key === "author") {
    return profile.authors.map((author) => author.name).filter(Boolean);
  }
  return getFacetValues(profile, key);
};

const getRangeValue = (profile: PowerProfile, key: RangeKey): number | null | undefined => {
  switch (key) {
    case "standbyPower":
      return profile.standbyPower;
    case "maxPower":
      return profile.maxPower;
    case "lumens":
      return profile.deviceSpecs?.lumens;
    case "installationCount":
      return profile.usageStats?.installationCount;
  }
};

const matchesFacet = (profile: PowerProfile, key: FacetKey, selected: string[]): boolean => {
  if (selected.length === 0) {
    return true;
  }
  const values = getFacetValues(profile, key).map((value) => value.toLowerCase());
  return selected.some((value) => values.includes(value.toLowerCase()));
};

const matchesRange = (profile: PowerProfile, key: RangeKey, range: Range): boolean => {
  const value = getRangeValue(profile, key);
  if (value == null) {
    return false;
  }
  return value >= range[0] && value <= range[1];
};

type SearchDocument = {
  fields: string[];
  words: string[];
};

const searchDocumentCache = new WeakMap<PowerProfile, SearchDocument>();

/**
 * Makes terms entered the way people write them comparable with library identifiers. Diacritics
 * are folded and punctuation becomes whitespace, so `TRÅDFRI`, `color-temp` and `color_temp`
 * behave like their plain-text equivalents.
 */
const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const getSearchDocument = (profile: PowerProfile): SearchDocument => {
  const cached = searchDocumentCache.get(profile);
  if (cached) {
    return cached;
  }

  const values = [
    profile.manufacturer.fullName,
    profile.manufacturer.dirName,
    ...profile.manufacturer.aliases,
    profile.modelId,
    profile.name,
    ...profile.aliases,
    ...(profile.legacyIds ?? []),
    profile.deviceType,
    ...(profile.colorModes ?? []),
    profile.measureDevice,
    profile.measureMethod,
    profile.calculationStrategy,
    ...profile.compatibleIntegrations,
    ...(profile.deviceSpecs?.socket ?? []),
    profile.deviceSpecs?.formFactor,
    ...(profile.deviceSpecs?.connectivity ?? []),
    ...profile.authors.flatMap((author) => [author.name, author.githubUsername]),
    ...(profile.ean ?? []),
  ];
  const normalizedFields = values
    .filter((value): value is string => Boolean(value))
    .map(normalizeSearchText)
    .filter(Boolean);
  const document = {
    // Keep compact variants too: `tp-link`, `TP Link` and `tplink` should be interchangeable.
    fields: [...normalizedFields, ...normalizedFields.map((field) => field.replaceAll(" ", ""))],
    words: [...new Set(normalizedFields.flatMap((field) => field.split(" ")))],
  };
  searchDocumentCache.set(profile, document);
  return document;
};

const FUZZY_WORD = /^\p{L}+$/u;

const fuzzyDistanceFor = (word: string): number => {
  if (!FUZZY_WORD.test(word) || word.length < 4) {
    return 0;
  }
  return word.length >= 8 ? 2 : 1;
};

/** Damerau-Levenshtein distance, including the adjacent letter swaps common in typing errors. */
const isWithinEditDistance = (left: string, right: string, maximum: number): boolean => {
  if (Math.abs(left.length - right.length) > maximum) {
    return false;
  }

  let previousPrevious: number[] | undefined;
  let previous = Array.from({ length: right.length + 1 }, (_value, index) => index);

  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      current[column] = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + substitutionCost,
      );
      if (
        previousPrevious &&
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        current[column] = Math.min(current[column], previousPrevious[column - 2] + 1);
      }
    }
    previousPrevious = previous;
    previous = current;
  }

  return previous[right.length] <= maximum;
};

const matchesSearchWord = (document: SearchDocument, word: string): boolean => {
  if (document.fields.some((field) => field.includes(word))) {
    return true;
  }

  const maximumDistance = fuzzyDistanceFor(word);
  return (
    maximumDistance > 0 &&
    document.words.some(
      (candidate) =>
        FUZZY_WORD.test(candidate) && isWithinEditDistance(word, candidate, maximumDistance),
    )
  );
};

/**
 * Matches identity, device, measurement and integration metadata. Every word must match, though
 * not necessarily in the same field, so "amazon echo" finds an Echo whose manufacturer and name
 * each hold one word. Text words tolerate small spelling mistakes; short terms, model identifiers
 * and barcodes remain exact to avoid silently suggesting a different device.
 */
export const matchesSearch = (profile: PowerProfile, term: string): boolean => {
  const words = normalizeSearchText(term).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return true;
  }
  const document = getSearchDocument(profile);
  return words.every((word) => matchesSearchWord(document, word));
};

const matchesDate = (value: Date | null | undefined, isoDate: string): boolean => {
  if (!value) {
    return false;
  }
  const threshold = new Date(isoDate);
  if (Number.isNaN(threshold.getTime())) {
    return true;
  }
  return value.getTime() >= threshold.getTime();
};

/**
 * Applies every active filter except the one named in `ignore`. Facet counts are computed with
 * their own facet ignored, so ticking a second box in the same list widens the result set instead
 * of collapsing it to zero.
 */
export const applyFiltersExcept = (
  profiles: PowerProfile[],
  filters: LibraryFilters,
  ignore?: FacetKey,
): PowerProfile[] =>
  profiles.filter((profile) => {
    if (!matchesSearch(profile, filters.search)) {
      return false;
    }
    for (const key of FACET_KEYS) {
      if (key === ignore) {
        continue;
      }
      if (!matchesFacet(profile, key, filters.facets[key])) {
        return false;
      }
    }
    for (const key of RANGE_KEYS) {
      const range = filters.ranges[key];
      if (range && !matchesRange(profile, key, range)) {
        return false;
      }
    }
    if (filters.createdAfter && !matchesDate(profile.createdAt, filters.createdAfter)) {
      return false;
    }
    return true;
  });

export const applyFilters = (profiles: PowerProfile[], filters: LibraryFilters): PowerProfile[] =>
  applyFiltersExcept(profiles, filters);

/** Option list for a facet, sorted by descending count then alphabetically. */
export const computeFacetCounts = (profiles: PowerProfile[], key: FacetKey): FacetCount[] => {
  const counts = new Map<string, number>();
  for (const profile of profiles) {
    for (const value of getFacetLabelValue(profile, key)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

/**
 * Slider bounds per numeric facet. Returns nothing for a key when no profile carries a value, so
 * the panel can skip rendering that slider.
 */
export const computeRanges = (profiles: PowerProfile[]): Partial<Record<RangeKey, Range>> => {
  const result: Partial<Record<RangeKey, Range>> = {};
  for (const key of RANGE_KEYS) {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const profile of profiles) {
      const value = getRangeValue(profile, key);
      if (value == null) {
        continue;
      }
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    if (min <= max) {
      result[key] = [Math.floor(min), Math.ceil(max)];
    }
  }
  return result;
};
