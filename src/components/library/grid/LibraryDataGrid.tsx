import type { GridRowParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

import type { PowerProfile } from "../../../types/PowerProfile";
import { profilePath } from "../../../utils/urlSlugs.mjs";

import { LIBRARY_DATA_GRID_COLUMNS } from "./libraryDataGridColumns";
import { profileRowId } from "./profileRowId";
import { useLibraryGridColumnVisibility } from "./useLibraryGridColumnVisibility";

export type LibraryDataGridProps = {
  rows: PowerProfile[];
  /** Lets the surrounding action bar open the column picker without a grid toolbar of its own. */
  apiRef: React.RefObject<GridApiCommunity | null>;
};

export const LibraryDataGrid = ({ rows, apiRef }: LibraryDataGridProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { columnVisibilityModel, handleColumnVisibilityChange } = useLibraryGridColumnVisibility();

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
      columns={LIBRARY_DATA_GRID_COLUMNS}
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
