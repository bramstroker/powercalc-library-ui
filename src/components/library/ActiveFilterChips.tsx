import { Box, Button, Chip } from "@mui/material";

import type { LibraryFilterActions } from "../../hooks/useLibraryFilters";
import type { LibraryFilters } from "../../types/LibraryFilters";
import {
  FACET_KEYS,
  FACET_LABELS,
  RANGE_KEYS,
  RANGE_LABELS,
  countActiveFilters,
} from "../../types/LibraryFilters";

export type ActiveFilterChipsProps = Pick<
  LibraryFilterActions,
  "removeFacetValue" | "setRange" | "setDate" | "setSearch" | "clearAll"
> & {
  filters: LibraryFilters;
};

export const ActiveFilterChips = ({
  filters,
  removeFacetValue,
  setRange,
  setDate,
  setSearch,
  clearAll,
}: ActiveFilterChipsProps) => {
  const activeCount = countActiveFilters(filters);
  if (activeCount === 0) {
    return null;
  }

  return (
    <Box
      data-testid="active-filter-chips"
      sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}
    >
      {filters.search && (
        <Chip
          size="small"
          label={`Search: ${filters.search}`}
          onDelete={() => {
            setSearch("");
          }}
        />
      )}

      {FACET_KEYS.flatMap((key) =>
        filters.facets[key].map((value) => (
          <Chip
            key={`${key}:${value}`}
            size="small"
            label={`${FACET_LABELS[key]}: ${value}`}
            onDelete={() => {
              removeFacetValue(key, value);
            }}
          />
        )),
      )}

      {RANGE_KEYS.map((key) => {
        const range = filters.ranges[key];
        if (!range) {
          return null;
        }
        return (
          <Chip
            key={key}
            size="small"
            label={`${RANGE_LABELS[key]}: ${range[0]} – ${range[1]}`}
            onDelete={() => {
              setRange(key, undefined);
            }}
          />
        );
      })}

      {filters.createdAfter && (
        <Chip
          size="small"
          label={`Created after: ${filters.createdAfter}`}
          onDelete={() => {
            setDate("createdAfter", undefined);
          }}
        />
      )}

      {activeCount > 1 && (
        <Button size="small" color="inherit" onClick={clearAll}>
          Clear all
        </Button>
      )}
    </Box>
  );
};
