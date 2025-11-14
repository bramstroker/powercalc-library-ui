import React, { useEffect, useMemo, useState } from "react";
import NextIcon from "@mui/icons-material/NavigateNext";
import BrightnessIcon from "@mui/icons-material/Brightness6";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import PaletteIcon from "@mui/icons-material/Palette";
import { useNavigate, useSearchParams } from "react-router-dom";
import isEqual from "fast-deep-equal";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef, MRT_Row, MRT_ColumnFiltersState,
} from "material-react-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import {IconButton, Backdrop, CircularProgress, Tooltip, Stack} from "@mui/material";

import AliasChips from "./AliasChips";

import { useLibrary } from "../context/LibraryContext";
import { PowerProfile } from "../types/PowerProfile";
import { ColorMode } from "../types/ColorMode";

import { Header } from "./Header";

const queryClient = new QueryClient();

// Component to render color mode icons
const ColorModeIcons: React.FC<{ colorModes: ColorMode[] }> = ({ colorModes }) => {
  if (!colorModes || colorModes.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1}>
      {colorModes.includes(ColorMode.BRIGHTNESS) && (
        <Tooltip title="Brightness">
          <BrightnessIcon fontSize="small" />
        </Tooltip>
      )}
      {colorModes.includes(ColorMode.COLOR_TEMP) && (
        <Tooltip title="Color Temperature">
          <ThermostatIcon fontSize="small" />
        </Tooltip>
      )}
      {colorModes.includes(ColorMode.HS) && (
        <Tooltip title="Hue/Saturation">
          <PaletteIcon fontSize="small" />
        </Tooltip>
      )}
    </Stack>
  );
};

const normalizeFilterVal = (v: unknown) => {
  if (Array.isArray(v)) {
    return v.map(String).sort().join(',');
  }
  if (v == null) {
    return '';
  }
  return String(v);
};

const buildFilterStateFromSearchParams = (
    searchParams: URLSearchParams,
    map: Record<string, string>
): MRT_ColumnFiltersState => {
  const result: MRT_ColumnFiltersState = [];
  for (const [param, colId] of Object.entries(map)) {
    const val = searchParams.get(param);
    if (val) {
      result.push({ id: colId, value: val });
    }
  }
  return result;
};

const buildSearchParamsFromFilterState = (
    filters: MRT_ColumnFiltersState,
    map: Record<string, string>
) => {
  const searchParams = new URLSearchParams();
  const byParam: Array<[string, string]> = [];
  for (const f of filters) {
    const param = Object.entries(map).find(([, colId]) => colId === f.id)?.[0];
    if (!param) {
      continue;
    }
    const value = normalizeFilterVal(f.value);
    if (value) {
      byParam.push([param, value]);
    }
  }
  byParam.sort(([a], [b]) => a.localeCompare(b)).forEach(([k, v]) => searchParams.set(k, v));
  return searchParams.toString();
};

const LibraryGrid: React.FC = () => {
  const { powerProfiles: data, loading, error, total } = useLibrary();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileLoading, setProfileLoading] = useState(false);

  const filterParamMap: Record<string, string> = useMemo(
      () => ({
        manufacturer: "manufacturer.fullName",
        colorModes: "colorModes",
        deviceType: "deviceType",
        author: "author",
        measureDevice: "measureDevice",
        calculationStrategy: "calculationStrategy",
      }),
      []
  );

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
      () => buildFilterStateFromSearchParams(searchParams, filterParamMap)
  );

  useEffect(() => {
    const next = buildFilterStateFromSearchParams(searchParams, filterParamMap);
    const currentNormalized = columnFilters
        .map(f => ({ id: f.id, value: normalizeFilterVal(f.value) }))
        .sort((a,b) => a.id.localeCompare(b.id));
    const nextNormalized = next
        .map(f => ({ id: f.id, value: normalizeFilterVal(f.value) }))
        .sort((a,b) => a.id.localeCompare(b.id));

    if (!isEqual(currentNormalized, nextNormalized)) {
      setColumnFilters(next);
    }
  }, [searchParams, filterParamMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: MRT_ColumnDef<PowerProfile>[] = [
    {
      accessorKey: "deviceType",
      header: "Device type",
      enableGlobalFilter: false,
      filterVariant: "select",
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
      Cell: ({ cell }) => {
        const aliases = cell.getValue<string>();
        return <AliasChips aliases={aliases} />;
      },
    },
    {
      accessorKey: "colorModes",
      header: "Color Modes",
      enableGlobalFilter: false,
      filterVariant: "select",
      filterSelectOptions: Object.values(ColorMode),
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue<string[]>(columnId);

        if (!Array.isArray(cellValue)) return false;
        if (!filterValue) return true;

        return cellValue.some((val) =>
            String(val).toLowerCase().includes(String(filterValue).toLowerCase()),
        );
      },
      grow: false,
      size: 200,
      enableColumnActions: false,
      Cell: ({ cell }) => {
        const colorModes = cell.getValue<ColorMode[]>();
        return <ColorModeIcons colorModes={colorModes} />;
      },
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
      accessorKey: "maxPower",
      header: "Max power",
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      Cell: ({ cell }) => {
        const date = cell.getValue<Date>();
        return date ? date.toLocaleString() : '';
      },
      sortingFn: 'datetime',
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      Cell: ({ cell }) => {
        const date = cell.getValue<Date>();
        return date ? date.toLocaleString() : '';
      },
      sortingFn: 'datetime',
    },
    {
      "accessorKey": "calculationStrategy",
      "header": "Calculation strategy",
    },
    {
      accessorKey: "subProfileCount",
      header: "Sub profile count",
    },
  ];

  const navigateToProfile = (row: MRT_Row<PowerProfile>) => {
    const manufacturer = row.original.manufacturer.dirName;
    const model = row.original.modelId;
    setProfileLoading(true);
    navigate(`/profiles/${manufacturer}/${model}`);
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
    onColumnFiltersChange: (updater) => {
      setColumnFilters((prev) => {
        const next =
            typeof updater === 'function' ? (updater as (prevState: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)(prev) : updater;

        // push to URL only for UI-originated changes
        const target = buildSearchParamsFromFilterState(next, filterParamMap);
        const curr = searchParams.toString();
        if (curr !== target) {
          setSearchParams(new URLSearchParams(target), { replace: true });
        }
        return next;
      });
    },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 15, pageIndex: 0 },
      columnVisibility: {
        author: false,
        colorModes: false,
        measureDevice: false,
        measureMethod: false,
        maxPower: false,
        standbyPower: false,
        standbyPowerOn: false,
        calculationStrategy: false,
        subProfileCount: false,
        updatedAt: false,
        createdAt: false,
      },
    },
    //columnFilterDisplayMode: 'popover',
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
      onClick: (_event) => {
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={profileLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </QueryClientProvider>
  );
};

export default LibraryGrid;
