import React from "react";
import { Header } from "./Header";
import { PowerProfile } from "../types/PowerProfile";
import { DeviceType } from "../types/DeviceType";
import NextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate} from 'react-router-dom';
import { useLibrary } from "../context/LibraryContext";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef, MRT_Row,
} from "material-react-table";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import {IconButton} from "@mui/material";

const queryClient = new QueryClient();

const LibraryGrid: React.FC = () => {
  const { powerProfiles: data, loading, error, total } = useLibrary();
  const navigate = useNavigate();

  const columns: MRT_ColumnDef<PowerProfile>[] = [
    {
      accessorKey: "deviceType",
      header: "Device type",
      enableGlobalFilter: false,
      filterVariant: "select",
      filterSelectOptions: Object.values(DeviceType),
      grow: false,
      size: 150,
      enableColumnActions: false,
      enableSorting: false,
      enableColumnDragging: false,
      muiFilterTextFieldProps: { placeholder: "Filter" },
    },
    {
      accessorKey: "manufacturer.fullName",
      header: "Manufacturer",
      filterVariant: "select",
      grow: false,
      size: 200,
      muiFilterTextFieldProps: { placeholder: "Filter" },
    },
    {
      accessorKey: "modelId",
      header: "Model",
      muiFilterTextFieldProps: { placeholder: "Filter" },
    },
    {
      accessorKey: "name",
      header: "Name",
      muiFilterTextFieldProps: { placeholder: "Filter" },
    },
    {
      accessorKey: "aliases",
      header: "Aliases",
    },
    {
      accessorKey: "author",
      header: "Author",
    },
    {
      accessorKey: "measureMethod",
      header: "Measure method",
    },
    {
      accessorKey: "measureDevice",
      header: "Measure device",
      filterVariant: "select",
      muiFilterTextFieldProps: { placeholder: "Filter" },
    },
    {
      accessorKey: "standbyPower",
      header: "Standby power",
    },
    {
      accessorKey: "standbyPowerOn",
      header: "Standby power on",
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
    },
  ];

  const navigateToProfile = (row: MRT_Row<PowerProfile>) => {
    const manufacturer = row.original.manufacturer.dirName;
    const model = row.original.modelId;
    navigate(`/profiles/${manufacturer}/${model}`)
  }

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilterModes: false,
    enableColumnOrdering: true,
    enableDensityToggle: false,
    enableColumnPinning: false,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: false,
    enableTopToolbar: false,
    enableTableHead: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 15, pageIndex: 0 },
      columnVisibility: {
        author: false,
        createdAt: false,
        measureDevice: false,
        measureMethod: false,
        updatedAt: false,
        standbyPower: false,
        standbyPowerOn: false,
      },
    },
    muiSearchTextFieldProps: {
      placeholder: "Search all profiles",
      variant: "outlined",
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: '',
        size: 10,
      },
    },
    renderRowActions: ({ row }) => (
        <Box>
          <IconButton onClick={() => {
            navigateToProfile(row);
          }}>
            <NextIcon />
          </IconButton>
        </Box>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        navigateToProfile(row);
      },
      sx: {
        cursor: 'pointer',
      },
    }),
    layoutMode: "grid",
  });

  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          Loading library data...
        </div>
      </QueryClientProvider>
    );
  }

  if (error) {
    return (
      <QueryClientProvider client={queryClient}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'red' }}>
          {error}
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Header total={total} table={table} />
      <MaterialReactTable table={table} />
    </QueryClientProvider>
  );
};

export default LibraryGrid;
