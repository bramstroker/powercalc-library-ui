import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { PowerProfile } from "../types/PowerProfile";
import { DeviceType } from "../types/DeviceType";
import NextIcon from "@mui/icons-material/NavigateNext";
import { API_ENDPOINTS } from "../config/api";
import { useNavigate} from 'react-router-dom';

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
  const [data, setData] = useState<PowerProfile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(API_ENDPOINTS.LIBRARY);
      if (response.status !== 200) {
        throw new Error("Unexpected status code from library API");
      }
      const json = await response.json();

      const powerProfiles: PowerProfile[] = [];

      json.manufacturers.forEach(
        (manufacturer: { models: any[]; name: string }) => {
          manufacturer.models.forEach((model) => {
            powerProfiles.push({
              manufacturer: manufacturer.name,
              modelId: model.id,
              name: model.name,
              aliases: model.aliases?.join("|"),
              author: model.author,
              deviceType: model.device_type,
              colorModes: model.color_modes || [],
              updatedAt: model.updated_at,
              createdAt: model.created_at,
              description: model.description,
              measureDevice: model.measure_device,
              measureMethod: model.measure_method,
              measureDescription: model.measure_description,
              calculationStrategy: model.calculation_strategy,
              standbyPower: model.standby_power,
              standbyPowerOn: model.standby_power_on,
            });
          });
        },
      );
      setData(powerProfiles);
    };

    fetchData().catch(console.error);
  }, []);

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
      accessorKey: "manufacturer",
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
    const manufacturer = row.original.manufacturer;
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

  return (
    <QueryClientProvider client={queryClient}>
      <Header total={data.length} table={table} />
      <MaterialReactTable table={table} />
    </QueryClientProvider>
  );
};

export default LibraryGrid;
