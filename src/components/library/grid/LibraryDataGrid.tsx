import type { GridRowParams, GridSortModel } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import { useLibraryPagination } from "../../../hooks/useLibraryPagination";
import { useUrlSearchParams } from "../../../hooks/useUrlSearchParams";
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
  const { page, pageSize, setPagination } = useLibraryPagination(rows.length);
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const usageAvailable = rows.every((row) => row.usageStats.available !== false);
  const columns = useMemo(
    () =>
      LIBRARY_DATA_GRID_COLUMNS.map((column) =>
        column.field === "installationCount" ? { ...column, sortable: usageAvailable } : column,
      ),
    [usageAvailable],
  );
  const field = searchParams.get("sort");
  const direction = searchParams.get("direction");
  // DataGrid treats a new model reference as a sort change and resets pagination.
  const sortModel = useMemo<GridSortModel>(() => {
    return field &&
      columns.some((column) => column.field === field && column.sortable !== false) &&
      (direction === "asc" || direction === "desc")
      ? [{ field, sort: direction }]
      : [];
  }, [field, direction, columns]);
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
      columns={columns}
      getRowId={profileRowId}
      onRowClick={handleRowClick}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={handleColumnVisibilityChange}
      paginationModel={{ page, pageSize }}
      onPaginationModelChange={setPagination}
      sortModel={sortModel}
      onSortModelChange={(model) => {
        updateSearchParams({
          sort: model[0]?.field ?? null,
          direction: model[0]?.sort ?? null,
          page: null,
        });
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
