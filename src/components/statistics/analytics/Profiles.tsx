import React from "react";
import {
  useTheme,
} from "@mui/material";
import {DataGrid, GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {useSuspenseQuery} from "@tanstack/react-query";

import AnalyticsHeader from "./AnalyticsHeader";
import {fetchProfiles} from "../../../api/analytics.api";
import { Link } from "react-router-dom";


const Profiles: React.FC = () => {
  const theme = useTheme();
  const { data } = useSuspenseQuery({
    queryKey: ["profilesData"],
    queryFn: fetchProfiles,
  });

  const columns: GridColDef[] = [
    {
      field: 'manufacturer',
      type: 'string',
      headerName: 'Manufacturer',
      flex: 1.5,
      minWidth: 200
    },
    {
      field: 'model',
      type: 'string',
      headerName: 'Model',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<any, string>) => {  // eslint-disable-line
        const row = params.row
        return (
            <Link
                to={`/profiles/${row.manufacturer}/${row.model}`}
            >
              {params.value}
            </Link>
        )
      }
    },
    {
      field: 'count',
      type: 'number',
      headerName: 'Number of sensors',
      description: 'The total number of sensors which were setup using this profile.',
      flex: 1.5,
      minWidth: 200
    },
    {
      field: 'installation_count',
      type: 'number',
      headerName: 'Number of installations',
      description: 'The total number of unique installations having at least one sensor with this profile.',
      flex: 1.5,
      minWidth: 200
    },
    {
      field: 'percentage',
      type: 'number',
      headerName: 'Percentage',
      description: 'Percentage of installations using this profile, calculated against total installations',
      flex: 1.5,
      minWidth: 200,
      valueFormatter: (value?: number) => {
        if (value == null) {
          return '';
        }
        return `${value.toLocaleString()} %`;
      },
    },
  ];


  return (
    <>
      <AnalyticsHeader
          title={"Profile statistics"}
          description={" Overview of Home Assistant and PowerCalc versions used in installations."}
      />

      <DataGrid
          rows={data}
          columns={columns}
          getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
          }
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
            sorting: {
              sortModel: [{ field: 'percentage', sort: 'desc' }],
            },
          }}
          disableColumnResize
          density="compact"
          getRowId={(row) => row.manufacturer + row.model}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.grey[800],
              fontWeight: 'bold',
              borderBottom: `2px solid ${theme.palette.grey[700]}`,
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.grey[700]}`,
            },
          }}
          slotProps={{
            filterPanel: {
              filterFormProps: {
                logicOperatorInputProps: {
                  variant: 'outlined',
                  size: 'small',
                },
                columnInputProps: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { mt: 'auto' },
                },
                operatorInputProps: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { mt: 'auto' },
                },
                valueInputProps: {
                  InputComponentProps: {
                    variant: 'outlined',
                    size: 'small',
                  },
                },
              },
            },
          }}
      />
    </>
  );
};

export default Profiles;
