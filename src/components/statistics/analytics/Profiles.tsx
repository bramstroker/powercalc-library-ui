import { Link as MuiLink } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router";

import type { ProfileStats } from "../../../api/analytics.api";
import { fetchProfiles } from "../../../api/analytics.api";
import { useLibrary } from "../../../context/LibraryContext";
import { profilePath } from "../../../utils/urlSlugs.mjs";

import { AnalyticsHeader } from "./AnalyticsHeader";
export const Profiles = () => {
  const { data } = useSuspenseQuery<ProfileStats[]>({
    queryKey: ["profilesData"],
    queryFn: ({ signal }) => fetchProfiles(signal),
  });
  const library = useLibrary();

  const columns = useMemo<GridColDef<ProfileStats>[]>(
    () => [
      {
        field: "manufacturer",
        type: "string",
        headerName: "Manufacturer",
        flex: 1.5,
        minWidth: 200,
        valueFormatter: (value: string) => {
          return library.manufacturers[value]?.fullName || value;
        },
      },
      {
        field: "model",
        type: "string",
        headerName: "Model",
        flex: 1.5,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams<ProfileStats, string>) => {
          return (
            <MuiLink
              component={RouterLink}
              to={profilePath(params.row.manufacturer, params.row.model)}
            >
              {params.value}
            </MuiLink>
          );
        },
      },
      {
        field: "count",
        type: "number",
        headerName: "Number of sensors",
        description: "The total number of sensors which were setup using this profile.",
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: "installation_count",
        type: "number",
        headerName: "Number of installations",
        description:
          "The total number of unique installations having at least one sensor with this profile.",
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: "percentage",
        type: "number",
        headerName: "Percentage",
        description:
          "Percentage of installations using this profile, calculated against total installations",
        flex: 1.5,
        minWidth: 200,
        valueFormatter: (value?: number) => {
          if (value == null) {
            return "";
          }
          return `${value.toLocaleString()} %`;
        },
      },
    ],
    [library.manufacturers],
  );
  return (
    <>
      <AnalyticsHeader
        title={"Profile statistics"}
        description={"Profile usage across opted-in Powercalc installations."}
        breadcrumbItems={[
          { label: "Home", to: "/" },
          { label: "Analytics", to: "/analytics" },
          { label: "Profiles" },
        ]}
      />

      <DataGrid
        rows={data}
        columns={columns}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
        initialState={{
          pagination: { paginationModel: { pageSize: 50 } },
          sorting: {
            sortModel: [{ field: "percentage", sort: "desc" }],
          },
        }}
        disableColumnResize
        density="compact"
        getRowId={(row) => `${row.manufacturer}/${row.model}`}
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
          },
        }}
        slotProps={{
          filterPanel: {
            filterFormProps: {
              logicOperatorInputProps: {
                variant: "outlined",
                size: "small",
              },
              columnInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              operatorInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              valueInputProps: {
                InputComponentProps: {
                  variant: "outlined",
                  size: "small",
                },
              },
            },
          },
        }}
      />
    </>
  );
};
