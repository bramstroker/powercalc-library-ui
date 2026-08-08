import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GridPreferencePanelsValue, useGridApiRef } from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";

import { useLibrary } from "../context/LibraryContext";
import { useLibraryFilters } from "../hooks/useLibraryFilters";
import { usePageMeta } from "../hooks/usePageMeta";
import { countActiveFilters } from "../types/LibraryFilters";
import { applyFilters } from "../utils/libraryFiltering";

import { Header } from "./Header";
import { ActiveFilterChips } from "./library/ActiveFilterChips";
import { FILTER_PANEL_WIDTH, FilterPanel } from "./library/FilterPanel";
import { LibraryDataGrid } from "./library/LibraryDataGrid";
import { LibrarySearchField } from "./library/LibrarySearchField";

const PANEL_COLLAPSED_STORAGE_KEY = "libraryFilterPanelCollapsed";

export const LibraryGrid = () => {
  const { powerProfiles } = useLibrary();
  const { filters, ...actions } = useLibraryFilters();
  const theme = useTheme();
  const apiRef = useGridApiRef();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(PANEL_COLLAPSED_STORAGE_KEY) === "true",
  );

  const setCollapsedPersisted = useCallback((next: boolean) => {
    setCollapsed(next);
    localStorage.setItem(PANEL_COLLAPSED_STORAGE_KEY, String(next));
  }, []);

  const rows = useMemo(() => applyFilters(powerProfiles, filters), [powerProfiles, filters]);
  const activeCount = countActiveFilters(filters);

  // Puts the search term in the tab, so several filtered views stay tellable apart.
  usePageMeta({ title: filters.search || undefined });
  const panelHidden = isDesktop ? collapsed : true;

  const panel = (
    <FilterPanel
      profiles={powerProfiles}
      filters={filters}
      onCollapse={
        isDesktop
          ? () => {
              setCollapsedPersisted(true);
            }
          : undefined
      }
      {...actions}
    />
  );

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Header
        searchSlot={<LibrarySearchField value={filters.search} onChange={actions.setSearch} />}
        resultCount={rows.length}
      />

      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
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
              {panel}
            </Box>
          )
        ) : (
          <Drawer
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
            }}
            slotProps={{ paper: { sx: { width: FILTER_PANEL_WIDTH } } }}
          >
            {panel}
          </Drawer>
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
            {panelHidden && (
              <Badge badgeContent={activeCount} color="primary">
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
            )}

            <ActiveFilterChips filters={filters} {...actions} />

            <Box sx={{ flexGrow: 1 }} />

            {/* Only shown where the header count is hidden, and worded differently from it so the
                two can never collide when locating either. */}
            <Typography
              variant="body2"
              color="text.secondary"
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
                onClick={() => {
                  apiRef.current?.showPreferences(GridPreferencePanelsValue.columns);
                }}
              >
                <ViewColumnIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <LibraryDataGrid rows={rows} apiRef={apiRef} />
        </Box>
      </Box>
    </Box>
  );
};
