import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { PowerProfile } from "../types/PowerProfile";
import { DeviceType } from "../types/DeviceType";
import { API_ENDPOINTS } from "../config/api";
import {Link, useNavigate} from 'react-router-dom';

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
              deviceType: model.device_type,
              colorModes: model.color_modes || [],
              updatedAt: model.updated_at,
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
      header: 'Profile Link',
      size: 50,
      enableColumnActions: false,
      enableSorting: false,
      enableColumnDragging: false,
      enableColumnFilter: false,
      accessorFn: (row) => {
        const manufacturer = row.manufacturer;
        const model = row.modelId;
        const profileUrl = `/profiles/${manufacturer}/${model}`;
        return (
            <Link to={profileUrl} style={{ color: '#1976d2', textDecoration: 'none' }}>
              View Profile
            </Link>
        );
      },
    },
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
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilterModes: false,
    enableColumnOrdering: true,
    enableDensityToggle: false,
    enableColumnPinning: false,
    enableFacetedValues: true,
    enableRowActions: false,
    enableRowSelection: false,
    enableTopToolbar: false,
    enableTableHead: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 15, pageIndex: 0 }
    },
    muiSearchTextFieldProps: {
      placeholder: "Search all profiles",
      variant: "outlined",
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        const manufacturer = row.original.manufacturer;
        const model = row.original.modelId;
        navigate(`/profiles/${manufacturer}/${model}`)
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
