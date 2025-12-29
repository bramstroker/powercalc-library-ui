import React from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {DataGrid, GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import { useQuery } from "@tanstack/react-query";

import { Header } from "../../Header";
import AnalyticsHeader from "./AnalyticsHeader";
import {fetchProfiles} from "../../../api/analytics.api";
import { Link } from "react-router-dom";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

const Profiles: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["profilesData"],
    queryFn: fetchProfiles,
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error">
            Error loading versions data: {getErrorMessage(error)}
          </Typography>
        </Container>
      </>
    );
  }

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
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
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
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
                borderBottom: '2px solid #ccc',
                fontSize: '0.875rem',
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
      </Container>
    </>
  );
};

export default Profiles;
