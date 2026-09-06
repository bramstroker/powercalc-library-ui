import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useId, useMemo, useState } from "react";

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
import { facetValueLabel } from "../../../utils/facetValueLabel";
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

export { FILTER_PANEL_WIDTH } from "./filterPanelLayout";

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
  manufacturer: { searchable: true },
  deviceType: { searchable: false },
  colorMode: { searchable: false },
  socket: { searchable: false },
  formFactor: { searchable: false },
  connectivity: { searchable: false },
  qualityBand: { searchable: false },
  calculationStrategy: { searchable: false },
  measureMethod: { searchable: false },
  mainsVoltage: { searchable: false },
  measureDevice: { searchable: true },
};

const CHECKBOX_FACETS = Object.entries(CHECKBOX_FACET_CONFIG).map(([key, { searchable }]) => ({
  key: key as Exclude<FacetKey, "author">,
  searchable,
}));

const ADVANCED_FACETS = new Set<FacetKey>([
  "qualityBand",
  "calculationStrategy",
  "measureMethod",
  "mainsVoltage",
  "measureDevice",
  "author",
]);

export type FilterPanelProps = LibraryFilterActions & {
  profiles: PowerProfile[];
  filters: LibraryFilters;
  /** Renders the desktop collapse control. */
  onCollapse?: () => void;
  /** Renders an explicit close control in the mobile drawer. */
  onClose?: () => void;
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
  onClose,
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
  const hasLightResults = useMemo(() => {
    const ranges = { ...filters.ranges };
    delete ranges.lumens;
    return applyFiltersExcept(profiles, { ...filters, ranges }).some(
      (profile) => profile.deviceType === "light",
    );
  }, [profiles, filters]);
  const visibleRangeKeys = useMemo(
    () => RANGE_KEYS.filter((key) => key !== "lumens" || hasLightResults || filters.ranges.lumens),
    [hasLightResults, filters.ranges.lumens],
  );
  const advancedId = useId();
  const advancedCount =
    [...ADVANCED_FACETS].reduce((count, key) => count + filters.facets[key].length, 0) +
    Number(Boolean(filters.createdAfter));
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
    for (const key of visibleRangeKeys) {
      const range = bounds[key];
      if (range && range[0] !== range[1]) {
        ids.push(key);
      }
    }
    ids.push("dates", "advanced");
    return ids;
  }, [facetCounts, filters.facets, bounds, visibleRangeKeys]);

  const [collapsedSections, setCollapsedSections] = useState<ReadonlySet<string>>(
    () => new Set(advancedCount > 0 ? [] : ["advanced"]),
  );
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

  const renderCheckboxFacets = (advanced: boolean) =>
    CHECKBOX_FACETS.filter(({ key }) => ADVANCED_FACETS.has(key) === advanced).map(
      ({ key, searchable }) => (
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
          getOptionLabel={(value) => facetValueLabel(key, value)}
          renderOptionIcon={(value) => renderFacetOptionIcon(key, value)}
          onToggle={(value) => {
            toggleFacetValue(key, value);
          }}
          onClear={() => {
            setFacet(key, []);
          }}
        />
      ),
    );

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
        {onClose && (
          <IconButton
            aria-label="Close filters"
            onClick={onClose}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <CloseIcon />
          </IconButton>
        )}
        {onCollapse && (
          <Tooltip title="Hide filters">
            <IconButton size="small" aria-label="Hide filters" onClick={onCollapse}>
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {renderCheckboxFacets(false)}

      {visibleRangeKeys.map((key) => {
        const range = bounds[key];
        if (
          key === "installationCount" &&
          profiles.some((profile) => profile.usageStats.available === false)
        ) {
          return (
            <Typography key={key} variant="caption" color="text.secondary" sx={{ p: 2 }}>
              Installation filters will be available when usage statistics load.
            </Typography>
          );
        }
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

      <Button
        fullWidth
        endIcon={collapsedSections.has("advanced") ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
        aria-expanded={!collapsedSections.has("advanced")}
        aria-controls={advancedId}
        onClick={() => toggleSection("advanced")}
        sx={{ justifyContent: "space-between", my: 1 }}
      >
        Advanced filters{advancedCount > 0 ? ` (${advancedCount})` : ""}
      </Button>
      <Collapse id={advancedId} in={!collapsedSections.has("advanced")} unmountOnExit>
        {renderCheckboxFacets(true)}

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
      </Collapse>
    </Box>
  );
};
