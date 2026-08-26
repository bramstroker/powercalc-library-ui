import { useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";

import type { FacetKey, LibraryFilters, Range, RangeKey } from "../types/LibraryFilters";
import {
  CREATED_AFTER_PARAM,
  FACET_KEYS,
  RANGE_KEYS,
  SEARCH_PARAM,
  createEmptyFilters,
} from "../types/LibraryFilters";

const splitValues = (raw: string | null): string[] =>
  raw
    ? raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

/**
 * Split on the separator rather than on every `-`, so a negative bound survives. No facet produces
 * one today, but `"-5--1".split("-")` yields four empty-ish pieces and would silently drop the
 * filter rather than apply it.
 */
const RANGE_PATTERN = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/;

const parseRange = (raw: string | null): Range | undefined => {
  if (!raw) {
    return undefined;
  }
  const match = RANGE_PATTERN.exec(raw);
  if (!match) {
    return undefined;
  }
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    return undefined;
  }
  return [min, max];
};

export const parseFilters = (searchParams: URLSearchParams): LibraryFilters => {
  const filters = createEmptyFilters();
  filters.search = searchParams.get(SEARCH_PARAM) ?? "";
  for (const key of FACET_KEYS) {
    filters.facets[key] = splitValues(searchParams.get(key));
  }
  for (const key of RANGE_KEYS) {
    const range = parseRange(searchParams.get(key));
    if (range) {
      filters.ranges[key] = range;
    }
  }
  filters.createdAfter = searchParams.get(CREATED_AFTER_PARAM) ?? undefined;
  return filters;
};

/** Serializes back to a stable, alphabetically ordered query string. */
export const serializeFilters = (filters: LibraryFilters): URLSearchParams => {
  const entries: [string, string][] = [];
  if (filters.search) {
    entries.push([SEARCH_PARAM, filters.search]);
  }
  for (const key of FACET_KEYS) {
    if (filters.facets[key].length > 0) {
      entries.push([key, filters.facets[key].join(",")]);
    }
  }
  for (const key of RANGE_KEYS) {
    const range = filters.ranges[key];
    if (range) {
      entries.push([key, `${range[0]}-${range[1]}`]);
    }
  }
  if (filters.createdAfter) {
    entries.push([CREATED_AFTER_PARAM, filters.createdAfter]);
  }

  const searchParams = new URLSearchParams();
  entries
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  return searchParams;
};

export type LibraryFilterActions = {
  setSearch: (search: string) => void;
  setFacet: (key: FacetKey, values: string[]) => void;
  toggleFacetValue: (key: FacetKey, value: string) => void;
  removeFacetValue: (key: FacetKey, value: string) => void;
  setRange: (key: RangeKey, range: Range | undefined) => void;
  setDate: (key: "createdAfter", value: string | undefined) => void;
  clearAll: () => void;
};

export type UseLibraryFilters = LibraryFilterActions & {
  filters: LibraryFilters;
};

const cloneFilters = (filters: LibraryFilters): LibraryFilters => ({
  ...filters,
  facets: Object.fromEntries(
    FACET_KEYS.map((key) => [key, [...filters.facets[key]]]),
  ) as LibraryFilters["facets"],
  ranges: { ...filters.ranges },
});

/**
 * The URL is the single source of truth for the grid's filter state — there is no mirrored React
 * state to keep in sync, so deep links, the back button and the UI can never disagree.
 */
export const useLibraryFilters = (): UseLibraryFilters => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  /*
   * Writing to the URL is asynchronous, and until the navigation commits both `searchParams` and
   * the value React Router hands a functional updater still describe the *previous* state. Two
   * quick toggles would therefore both build on the pre-click filters, and the second would drop
   * the first — ticking "light" then "smart_switch" left only `?deviceType=smart_switch`.
   *
   * So each update builds on the last one this hook issued, and the draft is re-adopted whenever
   * the query string changes to something we did not write (a deep link, the back button).
   */
  const draftRef = useRef(filters);
  const writtenRef = useRef(searchParams.toString());

  const currentQuery = searchParams.toString();
  if (writtenRef.current !== currentQuery) {
    writtenRef.current = currentQuery;
    draftRef.current = filters;
  }

  const update = useCallback(
    (mutate: (draft: LibraryFilters) => void) => {
      const draft = cloneFilters(draftRef.current);
      mutate(draft);
      draftRef.current = draft;

      const next = serializeFilters(draft);
      writtenRef.current = next.toString();
      setSearchParams(next, { replace: true });
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (search: string) => {
      update((draft) => {
        draft.search = search;
      });
    },
    [update],
  );

  const setFacet = useCallback(
    (key: FacetKey, values: string[]) => {
      update((draft) => {
        draft.facets[key] = values;
      });
    },
    [update],
  );

  const toggleFacetValue = useCallback(
    (key: FacetKey, value: string) => {
      update((draft) => {
        const values = draft.facets[key];
        draft.facets[key] = values.includes(value)
          ? values.filter((entry) => entry !== value)
          : [...values, value];
      });
    },
    [update],
  );

  const removeFacetValue = useCallback(
    (key: FacetKey, value: string) => {
      update((draft) => {
        draft.facets[key] = draft.facets[key].filter((entry) => entry !== value);
      });
    },
    [update],
  );

  const setRange = useCallback(
    (key: RangeKey, range: Range | undefined) => {
      update((draft) => {
        if (range) {
          draft.ranges[key] = range;
        } else {
          delete draft.ranges[key];
        }
      });
    },
    [update],
  );

  const setDate = useCallback(
    (key: "createdAfter", value: string | undefined) => {
      update((draft) => {
        draft[key] = value || undefined;
      });
    },
    [update],
  );

  const clearAll = useCallback(() => {
    draftRef.current = createEmptyFilters();
    writtenRef.current = "";
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    filters,
    setSearch,
    setFacet,
    toggleFacetValue,
    removeFacetValue,
    setRange,
    setDate,
    clearAll,
  };
};
