import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import DetailPanel from "./components/DetailPanel";
import { PowerProfile } from "./types/PowerProfile";
import { DeviceType } from "./types/DeviceType";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const API_ENDPOINT = "https://api.powercalc.nl/library";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [data, setData] = useState<PowerProfile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(API_ENDPOINT);
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
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    muiSearchTextFieldProps: {
      placeholder: "Search all profiles",
      variant: "outlined",
    },
    layoutMode: "grid",
    renderDetailPanel: ({ row }) => <DetailPanel profile={row.original} />,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Header total={data.length} table={table} />
      <MaterialReactTable table={table} />
    </QueryClientProvider>
  );
};

export default App;
