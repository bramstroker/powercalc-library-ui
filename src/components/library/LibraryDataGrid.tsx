import { Box, Link, Stack } from "@mui/material";
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import { useCallback, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import type { ColorMode } from "../../types/ColorMode";
import type { Author, Connectivity, PowerProfile } from "../../types/PowerProfile";
import { isRecentlyAdded } from "../../utils/recency";
import { authorPath, profilePath } from "../../utils/urlSlugs.mjs";
import { AliasChips } from "../AliasChips";

import { ColorModeIcons } from "./ColorModeIcons";
import { ConnectivityIcons } from "./ConnectivityIcons";
import { DeviceTypeIcon } from "./facetIcons";
import { NewBadge } from "./NewBadge";
import { profileRowId } from "./profileRowId";
import { QualityBadge } from "./QualityBadge";

const COLUMN_VISIBILITY_STORAGE_KEY = "libraryGridColumnVisibility";

const DEFAULT_COLUMN_VISIBILITY: GridColumnVisibilityModel = {
  authors: false,
  colorModes: false,
  measureDevice: false,
  measureMethod: false,
  maxPower: false,
  standbyPower: false,
  standbyPowerOn: false,
  calculationStrategy: false,
  subProfileCount: false,
  updatedAt: false,
  createdAt: false,
  installationCount: false,
  lutQualityScore: false,
};

const ProfileModelLink = ({ profile }: { profile: PowerProfile }) => {
  const location = useLocation();

  return (
    <Link
      component={RouterLink}
      to={profilePath(profile.manufacturer.dirName, profile.modelId)}
      state={{ libraryPath: `${location.pathname}${location.search}` }}
      prefetch="intent"
      underline="hover"
      color="inherit"
      onClick={(event) => event.stopPropagation()}
    >
      {profile.modelId}
    </Link>
  );
};

const columns: GridColDef<PowerProfile>[] = [
  {
    field: "deviceType",
    headerName: "Device type",
    width: 110,
    align: "center",
    headerAlign: "center",
    // The value stays the raw string so sorting and the column picker still behave.
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, string>) => (
      <DeviceTypeIcon deviceType={value ?? ""} />
    ),
  },
  {
    field: "manufacturer",
    headerName: "Manufacturer",
    width: 180,
    valueGetter: (_value, row) => row.manufacturer.fullName,
  },
  {
    field: "modelId",
    headerName: "Model",
    flex: 1,
    minWidth: 140,
    renderCell: ({ row }: GridRenderCellParams<PowerProfile, string>) => (
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, height: "100%" }}>
        <ProfileModelLink profile={row} />
        {isRecentlyAdded(row) && <NewBadge />}
      </Stack>
    ),
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1.5,
    minWidth: 180,
  },
  {
    field: "aliases",
    headerName: "Aliases",
    flex: 1,
    minWidth: 160,
    sortable: false,
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, string[]>) => (
      // AliasChips renders a fragment, so the cell needs its own flex box to centre the chips.
      <Box sx={{ display: "flex", alignItems: "center", height: "100%", overflow: "hidden" }}>
        <AliasChips aliases={value ?? []} />
      </Box>
    ),
  },
  {
    field: "colorModes",
    headerName: "Color modes",
    width: 160,
    sortable: false,
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, ColorMode[]>) => (
      <ColorModeIcons colorModes={value ?? []} />
    ),
  },
  {
    field: "connectivity",
    headerName: "Connectivity",
    width: 140,
    sortable: false,
    valueGetter: (_value, row): Connectivity[] => row.deviceSpecs?.connectivity ?? [],
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, Connectivity[]>) => (
      <ConnectivityIcons connectivity={value ?? []} />
    ),
  },
  {
    field: "authors",
    headerName: "Authors",
    width: 160,
    valueGetter: (value: Author[]) => value?.map((author) => author.name).join(", ") ?? "",
    renderCell: ({ row }: GridRenderCellParams<PowerProfile>) => (
      <Stack
        direction="row"
        sx={{ alignItems: "center", gap: 0.5, height: "100%", overflow: "hidden" }}
      >
        {row.authors.map((author, index) => (
          <Link
            key={author.githubUsername || `${author.name}-${index}`}
            component={RouterLink}
            to={authorPath(author.githubUsername)}
            prefetch="intent"
            onClick={(event) => {
              // Keep the row click from navigating to the profile instead.
              event.stopPropagation();
            }}
          >
            {author.name}
          </Link>
        ))}
      </Stack>
    ),
  },
  {
    field: "measureMethod",
    headerName: "Measure method",
    width: 150,
  },
  {
    field: "measureDevice",
    headerName: "Measure device",
    width: 180,
  },
  {
    field: "standbyPower",
    headerName: "Standby power",
    type: "number",
    width: 140,
  },
  {
    field: "standbyPowerOn",
    headerName: "Standby power on",
    type: "number",
    width: 150,
  },
  {
    field: "maxPower",
    headerName: "Max power",
    type: "number",
    width: 120,
  },
  {
    field: "updatedAt",
    headerName: "Updated",
    type: "dateTime",
    width: 180,
  },
  {
    field: "createdAt",
    headerName: "Created",
    type: "dateTime",
    width: 180,
  },
  {
    field: "calculationStrategy",
    headerName: "Calculation strategy",
    width: 160,
  },
  {
    field: "subProfileCount",
    headerName: "Sub profiles",
    type: "number",
    width: 120,
  },
  {
    field: "installationCount",
    headerName: "Installations",
    type: "number",
    width: 130,
    valueGetter: (_value, row) => row.usageStats?.installationCount,
  },
  {
    field: "lutQualityScore",
    headerName: "LUT quality",
    type: "number",
    width: 130,
    align: "center",
    headerAlign: "center",
    // Numeric so sorting ranks the rough profiles together; the chip only colours the readout.
    valueGetter: (_value, row) => row.lutQuality?.score,
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, number>) => (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <QualityBadge score={value} />
      </Box>
    ),
  },
];

const knownFields = new Set(columns.map((column) => column.field));

const readStoredVisibility = (): GridColumnVisibilityModel => {
  try {
    const stored = sessionStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_COLUMN_VISIBILITY;
    }
    const parsed = JSON.parse(stored) as GridColumnVisibilityModel;
    // Drop anything that is no longer a column, e.g. ids left behind by an older grid version.
    return {
      ...DEFAULT_COLUMN_VISIBILITY,
      ...Object.fromEntries(Object.entries(parsed).filter(([field]) => knownFields.has(field))),
    } as GridColumnVisibilityModel;
  } catch {
    return DEFAULT_COLUMN_VISIBILITY;
  }
};

export type LibraryDataGridProps = {
  rows: PowerProfile[];
  /** Lets the surrounding action bar open the column picker without a grid toolbar of its own. */
  apiRef: React.RefObject<GridApiCommunity | null>;
};

export const LibraryDataGrid = ({ rows, apiRef }: LibraryDataGridProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(readStoredVisibility);

  const handleColumnVisibilityChange = useCallback((model: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(model);
    sessionStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(model));
  }, []);

  const handleRowClick = useCallback(
    (params: GridRowParams<PowerProfile>) => {
      void navigate(profilePath(params.row.manufacturer.dirName, params.row.modelId), {
        state: { libraryPath: `${location.pathname}${location.search}` },
      });
    },
    [location.pathname, location.search, navigate],
  );

  return (
    <DataGrid
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      getRowId={profileRowId}
      onRowClick={handleRowClick}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={handleColumnVisibilityChange}
      initialState={{
        pagination: { paginationModel: { pageSize: 25 } },
      }}
      pageSizeOptions={[25, 50, 100]}
      density="compact"
      disableColumnMenu
      disableRowSelectionOnClick
      sx={{
        border: 0,
        "& .MuiDataGrid-row": { cursor: "pointer" },
        "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
      }}
      localeText={{ noRowsLabel: "No profiles match the current filters" }}
      aria-label="Power profiles"
    />
  );
};
