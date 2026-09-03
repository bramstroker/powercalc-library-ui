import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { Badge, Box, Button, Drawer, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLibrary } from "../context/LibraryContext";
import { DESKTOP_MEDIA_QUERY, useIsDesktop } from "../hooks/useIsDesktop";
import { useLibraryFilters } from "../hooks/useLibraryFilters";
import { countActiveFilters } from "../types/LibraryFilters";
import { visuallyHiddenSx } from "../utils/accessibility";
import { applyFilters } from "../utils/libraryFiltering";

import { Header } from "./Header";
import { ActiveFilterChips } from "./library/ActiveFilterChips";
import {
  DesktopDataGridSkeleton,
  DesktopFilterPanelSkeleton,
} from "./library/DesktopLibraryLoadingState";
import { FILTER_PANEL_WIDTH, FilterPanel } from "./library/FilterPanel";
import { LibraryCardList } from "./library/LibraryCardList";
import { LibraryEmptyState } from "./library/LibraryEmptyState";
import { LibrarySearchField } from "./library/LibrarySearchField";

const importDesktopGrid = () => import("./library/DesktopLibraryDataGrid");

const DesktopLibraryDataGrid = lazy(() =>
  importDesktopGrid().then((module) => ({ default: module.DesktopLibraryDataGrid })),
);

// A desktop visitor would otherwise only start fetching the grid chunk once hydration has run.
// Requesting it while this module evaluates overlaps that download with hydration, shortening the
// time for which the CSS-selected desktop loading shell is visible.
if (typeof window !== "undefined" && window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
  void importDesktopGrid();
}

const PANEL_COLLAPSED_STORAGE_KEY = "libraryFilterPanelCollapsed";

export const LibraryGrid = () => {
  const { powerProfiles } = useLibrary();
  const { filters, ...actions } = useLibraryFilters();
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const showColumnsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(PANEL_COLLAPSED_STORAGE_KEY) === "true");
  }, []);

  const setCollapsedPersisted = useCallback((next: boolean) => {
    setCollapsed(next);
    window.localStorage.setItem(PANEL_COLLAPSED_STORAGE_KEY, String(next));
  }, []);

  const rows = useMemo(() => applyFilters(powerProfiles, filters), [powerProfiles, filters]);
  const activeCount = countActiveFilters(filters);

  const filterPanel = (
    <FilterPanel
      profiles={powerProfiles}
      filters={filters}
      onCollapse={isDesktop ? () => setCollapsedPersisted(true) : undefined}
      {...actions}
    />
  );

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Header
        searchSlot={<LibrarySearchField value={filters.search} onChange={actions.setSearch} />}
        resultCount={rows.length}
        totalCount={powerProfiles.length}
      />

      <Box id="main-content" component="main" sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Typography component="h1" sx={visuallyHiddenSx}>
          Powercalc profile library
        </Typography>
        {isDesktop ? (
          !collapsed && (
            <Box
              component="aside"
              sx={{
                width: FILTER_PANEL_WIDTH,
                flexShrink: 0,
                overflowY: "auto",
                borderRight: 1,
                borderColor: "divider",
              }}
            >
              {filterPanel}
            </Box>
          )
        ) : (
          <>
            {/* CSS shows this only at desktop widths. The prerender therefore has the right
                geometry before JavaScript can determine the viewport. */}
            <DesktopFilterPanelSkeleton />
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
              }}
              slotProps={{ paper: { sx: { width: FILTER_PANEL_WIDTH } } }}
            >
              {filterPanel}
            </Drawer>
          </>
        )}

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* One bar directly above the table it describes, replacing the grid's own toolbar. */}
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              minHeight: 52,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Badge
              badgeContent={activeCount}
              color="primary"
              sx={{ display: { xs: "inline-flex", md: collapsed ? "inline-flex" : "none" } }}
            >
              <Button
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => {
                  if (isDesktop) {
                    setCollapsedPersisted(false);
                  } else {
                    setDrawerOpen(true);
                  }
                }}
              >
                Filters
              </Button>
            </Badge>

            {rows.length > 0 && <ActiveFilterChips filters={filters} {...actions} />}

            <Box sx={{ flexGrow: 1 }} />

            {/* Only shown where the header count is hidden, and worded differently from it so the
                two can never collide when locating either. */}
            <Typography
              variant="body2"
              color="text.secondary"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              noWrap
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {rows.length === powerProfiles.length
                ? `${rows.length} results`
                : `${rows.length} of ${powerProfiles.length} results`}
            </Typography>

            <Tooltip title="Show/hide columns">
              <IconButton
                size="small"
                aria-label="Show/hide columns"
                onClick={() => showColumnsRef.current?.()}
                sx={{ display: { xs: "none", md: "inline-flex" } }}
              >
                <ViewColumnIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {rows.length === 0 ? (
            <LibraryEmptyState filters={filters} {...actions} />
          ) : (
            <>
              {/* Both viewport slots exist in the prerender and CSS selects the right one
                  immediately. JavaScript still mounts only the expensive result component for
                  the active width. */}
              <Box sx={{ display: { xs: "none", md: "flex" }, flex: 1, minHeight: 0 }}>
                {isDesktop ? (
                  <Suspense fallback={<DesktopDataGridSkeleton />}>
                    <DesktopLibraryDataGrid rows={rows} showColumnsRef={showColumnsRef} />
                  </Suspense>
                ) : (
                  <DesktopDataGridSkeleton />
                )}
              </Box>
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                {!isDesktop && <LibraryCardList rows={rows} />}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
