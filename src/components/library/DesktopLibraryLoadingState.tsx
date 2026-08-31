import { Box, Skeleton, Stack, Typography } from "@mui/material";

import { FILTER_PANEL_WIDTH } from "./FilterPanel";

const TABLE_COLUMNS = [
  { label: "Device type", width: "110px" },
  { label: "Manufacturer", width: "180px" },
  { label: "Model", width: "minmax(180px, 1fr)" },
  { label: "Name", width: "minmax(220px, 1.5fr)" },
  { label: "Aliases", width: "minmax(160px, 1fr)" },
  { label: "Connectivity", width: "140px" },
] as const;

const TABLE_GRID_TEMPLATE = TABLE_COLUMNS.map(({ width }) => width).join(" ");

const filterSections = [
  { title: "Device type", rows: 5 },
  { title: "Color modes", rows: 3 },
] as const;

/**
 * Viewport-independent HTML cannot know whether it is being prerendered for a phone or a desktop.
 * CSS can. This lightweight panel reserves the desktop filter column from the very first paint;
 * hydration swaps it for the interactive panel without moving the results sideways.
 */
export const DesktopFilterPanelSkeleton = () => (
  <Box
    aria-hidden="true"
    data-testid="desktop-filter-loading"
    sx={(theme) => ({
      display: { xs: "none", md: "block" },
      width: FILTER_PANEL_WIDTH,
      flexShrink: 0,
      overflow: "hidden",
      borderRight: 1,
      borderColor: "divider",
      px: 2,
      pb: 1,
      backgroundColor: theme.palette.grey[100],
      ...theme.applyStyles("dark", { backgroundColor: theme.palette.grey[900] }),
    })}
  >
    <Stack
      direction="row"
      sx={{
        height: 53,
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700, flexGrow: 1 }}>
        Filters
      </Typography>
      <Skeleton variant="circular" width={28} height={28} />
      <Skeleton variant="circular" width={28} height={28} sx={{ ml: 1 }} />
    </Stack>

    {filterSections.map(({ title, rows }) => (
      <Box key={title} sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" sx={{ height: 32, alignItems: "center", gap: 1 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {title}
          </Typography>
          <Skeleton variant="rounded" width={20} height={20} />
        </Stack>
        {Array.from({ length: rows }, (_, index) => (
          <Stack
            // The position is stable, so it is the meaningful identity for placeholder rows.
            key={index}
            direction="row"
            sx={{ height: 38, alignItems: "center", gap: 1 }}
          >
            <Skeleton variant="rounded" width={20} height={20} />
            <Skeleton width={`${62 + ((index * 11) % 25)}%`} />
          </Stack>
        ))}
      </Box>
    ))}
  </Box>
);

/** A table-shaped Suspense fallback that keeps the desktop result area geometrically stable. */
export const DesktopDataGridSkeleton = () => (
  <Box
    role="status"
    aria-label="Loading table"
    data-testid="desktop-grid-loading"
    sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}
  >
    <Box sx={{ minWidth: 990 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: TABLE_GRID_TEMPLATE,
          height: 40,
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {TABLE_COLUMNS.map(({ label }) => (
          <Typography key={label} variant="body2" noWrap sx={{ px: 1.5, fontWeight: 700 }}>
            {label}
          </Typography>
        ))}
      </Box>

      {Array.from({ length: 12 }, (_, rowIndex) => (
        <Box
          // The position is stable, so it is the meaningful identity for placeholder rows.
          key={rowIndex}
          sx={{
            display: "grid",
            gridTemplateColumns: TABLE_GRID_TEMPLATE,
            height: 36,
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {TABLE_COLUMNS.map(({ label }, columnIndex) => (
            <Box key={label} sx={{ px: 1.5 }}>
              <Skeleton
                width={`${48 + ((rowIndex * 13 + columnIndex * 17) % 40)}%`}
                animation="wave"
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  </Box>
);
