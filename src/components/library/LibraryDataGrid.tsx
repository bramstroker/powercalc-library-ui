import { Box, Link } from "@mui/material";
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import { useCallback, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import type { ColorMode } from "../../types/ColorMode";
import type { Author, PowerProfile } from "../../types/PowerProfile";
import { AliasChips } from "../AliasChips";

import { ColorModeIcons } from "./ColorModeIcons";
import { DeviceTypeIcon } from "./facetIcons";

const COLUMN_VISIBILITY_STORAGE_KEY = "libraryGridColumnVisibility";

const DEFAULT_COLUMN_VISIBILITY: GridColumnVisibilityModel = {
  author: false,
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
};

export const profileRowId = (profile: PowerProfile) =>
  `${profile.manufacturer.dirName}/${profile.modelId}`;

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
    field: "author",
    headerName: "Author",
    width: 160,
    valueGetter: (value: Author) => value?.name ?? "",
    renderCell: ({ row }: GridRenderCellParams<PowerProfile>) => (
      <Link
        component={RouterLink}
        to={`/author/${encodeURIComponent(row.author.githubUsername)}`}
        onClick={(event) => {
          // Keep the row click from navigating to the profile instead.
          event.stopPropagation();
        }}
      >
        {row.author.name}
      </Link>
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
    return Object.fromEntries(
      Object.entries(parsed).filter(([field]) => knownFields.has(field)),
    ) as GridColumnVisibilityModel;
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
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(readStoredVisibility);

  const handleColumnVisibilityChange = useCallback((model: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(model);
    sessionStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(model));
  }, []);

  const handleRowClick = useCallback(
    (params: GridRowParams<PowerProfile>) => {
      void navigate(`/profiles/${params.row.manufacturer.dirName}/${params.row.modelId}`);
    },
    [navigate],
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
