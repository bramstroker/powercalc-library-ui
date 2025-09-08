import React, { useEffect, useMemo, useState } from "react";
import { Header } from "./Header";
import { PowerProfile } from "../types/PowerProfile";
import { DeviceType } from "../types/DeviceType";
import NextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef, MRT_Row, MRT_ColumnFiltersState,
} from "material-react-table";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import {IconButton} from "@mui/material";

const queryClient = new QueryClient();

const LibraryGrid: React.FC = () => {
  const { powerProfiles: data, loading, error, total } = useLibrary();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParamMap: Record<string, string> = useMemo(
      () => ({
        manufacturer: "manufacturer.fullName",
        deviceType: "deviceType",
        author: "author",
        measureDevice: "measureDevice",
      }),
      []
  );

  const initialColumnFilters: MRT_ColumnFiltersState = useMemo(() => {
    const filters: MRT_ColumnFiltersState = [];
    for (const [param, colId] of Object.entries(filterParamMap)) {
      const val = searchParams.get(param);
      if (!val) {
        continue;
      }
      filters.push({ id: colId, value: val });
    }
    return filters;
  }, [searchParams, filterParamMap]);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(initialColumnFilters);

  // Keep state in sync if user navigates with back/forward (URL changes)
  useEffect(() => {
    setColumnFilters(initialColumnFilters);
  }, [initialColumnFilters]);

  // Push current filters back to URL whenever they change
  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    Object.keys(filterParamMap).forEach((p) => next.delete(p));

    for (const f of columnFilters) {
      const param = Object.entries(filterParamMap).find(
          ([, colId]) => colId === f.id
      )?.[0];
      if (!param) continue;

      const value =
          typeof f.value === 'string'
              ? f.value
              : Array.isArray(f.value)
                  ? f.value.join(',')
                  : f.value?.toString();

      if (value) next.set(param, value);
    }

    // Only update if something actually changed, to avoid loops
    const prev = searchParams.toString();
    const curr = next.toString();
    if (prev !== curr) setSearchParams(next, { replace: true });
  }, [columnFilters, setSearchParams, searchParams, filterParamMap]);

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
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
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
