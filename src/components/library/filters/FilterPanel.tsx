import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useMemo, useState } from "react";

import type { LibraryFilterActions } from "../../../hooks/useLibraryFilters";
import type { FacetKey, LibraryFilters } from "../../../types/LibraryFilters";
import {
  FACET_LABELS,
  RANGE_KEYS,
  RANGE_LABELS,
  RANGE_UNITS,
  countActiveFilters,
} from "../../../types/LibraryFilters";
import type { PowerProfile } from "../../../types/PowerProfile";
import {
  applyFiltersExcept,
  computeFacetCounts,
  computeRanges,
} from "../../../utils/libraryFiltering";
import { sortByQualityBand } from "../../../utils/lutQuality";

import type { AuthorOption } from "./AuthorFacet";
import { AuthorFacet } from "./AuthorFacet";
import { CheckboxFacet } from "./CheckboxFacet";
import { renderFacetOptionIcon } from "./facetIcons";
import { FacetSection } from "./FacetSection";
import { FACET_ICONS, RANGE_ICONS, SECTION_ICONS } from "./facetSectionIcons";
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
/**
 * Every facet except `author`, which has a component of its own. Typed as a complete record so
 * that adding a facet without giving it a checkbox is a compile error rather than a filter that
 * works through the URL but appears nowhere in the panel. Declaration order is panel order:
 * what the device is, then how it was measured, then who by.
 */
const CHECKBOX_FACET_CONFIG: Record<Exclude<FacetKey, "author">, { searchable: boolean }> = {
  deviceType: { searchable: false },
  colorMode: { searchable: false },
  socket: { searchable: false },
  formFactor: { searchable: false },
  connectivity: { searchable: false },
  qualityBand: { searchable: false },
  calculationStrategy: { searchable: false },
  measureMethod: { searchable: false },
  mainsVoltage: { searchable: false },
  manufacturer: { searchable: true },
  measureDevice: { searchable: true },
};

const CHECKBOX_FACETS = Object.entries(CHECKBOX_FACET_CONFIG).map(([key, { searchable }]) => ({
  key: key as Exclude<FacetKey, "author">,
  searchable,
}));

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
    const entries = [...CHECKBOX_FACETS.map((facet) => facet.key), "author" as const].map((key) => {
      const counts = computeFacetCounts(applyFiltersExcept(profiles, filters, key), key);
      return [key, key === "qualityBand" ? sortByQualityBand(counts) : counts];
    });
    return Object.fromEntries(entries) as Record<FacetKey, ReturnType<typeof computeFacetCounts>>;
  }, [profiles, filters]);

  const authorOptions = useMemo<AuthorOption[]>(() => {
    const usernames = new Map(
      profiles.flatMap((profile) =>
        profile.authors.map((author) => [author.name, author.githubUsername] as const),
      ),
    );
    return facetCounts.author.map((option) => ({
      ...option,
      githubUsername: usernames.get(option.value) ?? "",
    }));
  }, [facetCounts, profiles]);

  const bounds = useMemo(() => computeRanges(profiles), [profiles]);
  const activeCount = countActiveFilters(filters);

  /**
   * Which sections the panel actually renders, in the order it renders them. A checkbox facet
   * with nothing to tick is left out, so "collapse all" reflects what is on screen rather than
   * what could be.
   */
  const sectionIds = useMemo(() => {
    const ids = CHECKBOX_FACETS.filter(
      ({ key }) => facetCounts[key].length > 0 || filters.facets[key].length > 0,
    ).map(({ key }) => key as string);
    ids.push("author");
    for (const key of RANGE_KEYS) {
      const range = bounds[key];
      if (range && range[0] !== range[1]) {
        ids.push(key);
      }
    }
    ids.push("dates");
    return ids;
  }, [facetCounts, filters.facets, bounds]);

  const [collapsedSections, setCollapsedSections] = useState<ReadonlySet<string>>(new Set());
  const allCollapsed = sectionIds.length > 0 && sectionIds.every((id) => collapsedSections.has(id));

  const toggleSection = (id: string) => {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllSections = () => {
    setCollapsedSections(allCollapsed ? new Set() : new Set(sectionIds));
  };

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
        <Typography
          component="h2"
          variant="h6"
          sx={{ fontSize: "1rem", fontWeight: 700, flexGrow: 1 }}
        >
          Filters
        </Typography>
        <Button
          size="small"
          onClick={clearAll}
          // Laid out even with nothing to clear. It is a hair taller than the icon button
          // beside it, so letting it mount on the first tick of a filter grew the header and
          // nudged "Filters" down by a pixel, right under the pointer that had just clicked.
          // Hidden this way it also stays out of the tab order and off the accessibility tree.
          sx={{ visibility: activeCount > 0 ? "visible" : "hidden" }}
        >
          Clear all
        </Button>
        <Tooltip title={allCollapsed ? "Expand all sections" : "Collapse all sections"}>
          <IconButton
            size="small"
            aria-label={allCollapsed ? "Expand all sections" : "Collapse all sections"}
            onClick={toggleAllSections}
          >
            {allCollapsed ? (
              <UnfoldMoreIcon fontSize="small" />
            ) : (
              <UnfoldLessIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
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
          expanded={!collapsedSections.has(key)}
          onToggleExpanded={() => {
            toggleSection(key);
          }}
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
        expanded={!collapsedSections.has("author")}
        onToggleExpanded={() => {
          toggleSection("author");
        }}
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
            expanded={!collapsedSections.has(key)}
            onToggleExpanded={() => {
              toggleSection(key);
            }}
            onChange={(next) => {
              setRange(key, next);
            }}
          />
        );
      })}

      <FacetSection
        title="Added"
        icon={SECTION_ICONS.dates}
        testId="facet-dates"
        expanded={!collapsedSections.has("dates")}
        onToggleExpanded={() => {
          toggleSection("dates");
        }}
        summary={
          filters.createdAfter ? (
            <Typography variant="caption" color="text.secondary">
              after {filters.createdAfter}
            </Typography>
          ) : undefined
        }
      >
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
        </Stack>
      </FacetSection>
    </Box>
  );
};
