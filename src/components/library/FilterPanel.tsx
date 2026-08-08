import type { SvgIconComponent } from "@mui/icons-material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useMemo } from "react";

import type { LibraryFilterActions } from "../../hooks/useLibraryFilters";
import type { FacetKey, LibraryFilters } from "../../types/LibraryFilters";
import {
  FACET_LABELS,
  RANGE_KEYS,
  RANGE_LABELS,
  RANGE_UNITS,
  countActiveFilters,
} from "../../types/LibraryFilters";
import type { PowerProfile } from "../../types/PowerProfile";
import { applyFiltersExcept, computeFacetCounts, computeRanges } from "../../utils/libraryFiltering";

import type { AuthorOption } from "./AuthorFacet";
import { AuthorFacet } from "./AuthorFacet";
import { CheckboxFacet } from "./CheckboxFacet";
import { FACET_ICONS, RANGE_ICONS, SECTION_ICONS, renderFacetOptionIcon } from "./facetIcons";
import { RangeFacet } from "./RangeFacet";

export const FILTER_PANEL_WIDTH = 288;

/**
 * The panel's own surface, a tint away from the grid's. Applied to both the root and the sticky
 * header — the header needs it explicitly, otherwise the facet list scrolls through it.
 */
const panelSurface = (theme: Theme) => ({
  backgroundColor: theme.palette.grey[100],
  ...theme.applyStyles("dark", { backgroundColor: theme.palette.grey[900] }),
});

/** Checkbox facets, in the order they appear in the panel. `searchable` gates the type-to-filter box. */
const CHECKBOX_FACETS: { key: FacetKey; searchable: boolean }[] = [
  { key: "deviceType", searchable: false },
  { key: "colorMode", searchable: false },
  { key: "calculationStrategy", searchable: false },
  { key: "measureMethod", searchable: false },
  { key: "manufacturer", searchable: true },
  { key: "measureDevice", searchable: true },
];

const SectionHeading = ({ icon: Icon, children }: { icon: SvgIconComponent; children: ReactNode }) => (
  <Stack direction="row" sx={{ alignItems: "center", gap: 1, py: 0.75 }}>
    <Icon fontSize="small" sx={{ color: "text.secondary" }} />
    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
      {children}
    </Typography>
  </Stack>
);

export type FilterPanelProps = LibraryFilterActions & {
  profiles: PowerProfile[];
  filters: LibraryFilters;
  /** Renders the collapse control. Omitted in the mobile drawer, which closes by tapping away. */
  onCollapse?: () => void;
};

export const FilterPanel = ({
  profiles,
  filters,
  setFacet,
  toggleFacetValue,
  setRange,
  setDate,
  clearAll,
  onCollapse,
}: FilterPanelProps) => {
  // Each facet is counted against everything *except* its own selection, so ticking a second box
  // in the same list widens the results instead of collapsing them to zero.
  const facetCounts = useMemo(() => {
    const entries = [...CHECKBOX_FACETS.map((facet) => facet.key), "author" as const].map((key) => [
      key,
      computeFacetCounts(applyFiltersExcept(profiles, filters, key), key),
    ]);
    return Object.fromEntries(entries) as Record<FacetKey, ReturnType<typeof computeFacetCounts>>;
  }, [profiles, filters]);

  const authorOptions = useMemo<AuthorOption[]>(() => {
    const usernames = new Map(profiles.map((profile) => [profile.author.name, profile.author.githubUsername]));
    return facetCounts.author.map((option) => ({
      ...option,
      githubUsername: usernames.get(option.value) ?? "",
    }));
  }, [facetCounts, profiles]);

  const bounds = useMemo(() => computeRanges(profiles), [profiles]);
  const activeCount = countActiveFilters(filters);

  return (
    <Box
      data-testid="filter-panel"
      sx={(theme) => ({ px: 2, pb: 1, minHeight: "100%", ...panelSurface(theme) })}
    >
      <Stack
        direction="row"
        sx={(theme) => ({
          alignItems: "center",
          gap: 1,
          mb: 1,
          position: "sticky",
          top: 0,
          zIndex: 1,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          ...panelSurface(theme),
        })}
      >
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700, flexGrow: 1 }}>
          Filters
        </Typography>
        {activeCount > 0 && (
          <Button size="small" onClick={clearAll}>
            Clear all
          </Button>
        )}
        {onCollapse && (
          <Tooltip title="Hide filters">
            <IconButton size="small" aria-label="Hide filters" onClick={onCollapse}>
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {CHECKBOX_FACETS.map(({ key, searchable }) => (
        <CheckboxFacet
          key={key}
          testId={`facet-${key}`}
          title={FACET_LABELS[key]}
          icon={FACET_ICONS[key]}
          options={facetCounts[key]}
          selected={filters.facets[key]}
          searchable={searchable}
          renderOptionIcon={(value) => renderFacetOptionIcon(key, value)}
          onToggle={(value) => {
            toggleFacetValue(key, value);
          }}
          onClear={() => {
            setFacet(key, []);
          }}
        />
      ))}

      <AuthorFacet
        options={authorOptions}
        selected={filters.facets.author}
        onChange={(values) => {
          setFacet("author", values);
        }}
      />

      {RANGE_KEYS.map((key) => {
        const range = bounds[key];
        if (!range || range[0] === range[1]) {
          return null;
        }
        return (
          <RangeFacet
            key={key}
            testId={`facet-${key}`}
            title={RANGE_LABELS[key]}
            icon={RANGE_ICONS[key]}
            unit={RANGE_UNITS[key]}
            bounds={range}
            value={filters.ranges[key]}
            onChange={(next) => {
              setRange(key, next);
            }}
          />
        );
      })}

      <SectionHeading icon={SECTION_ICONS.dates}>Dates</SectionHeading>
      <Stack sx={{ gap: 1.5, mt: 1, pb: 1 }}>
        <TextField
          size="small"
          type="date"
          label="Created after"
          value={filters.createdAfter ?? ""}
          onChange={(event) => {
            setDate("createdAfter", event.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label="Updated after"
          value={filters.updatedAfter ?? ""}
          onChange={(event) => {
            setDate("updatedAfter", event.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
    </Box>
  );
};
