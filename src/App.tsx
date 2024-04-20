import React, { useState, useEffect } from 'react';
import Header from './components/Header'
import DetailPanel from './components/DetailPanel'
import { cyan } from '@mui/material/colors';
import { PowerProfile } from './types/PowerProfile'
import { DeviceType } from './types/DeviceType'

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import Container from '@mui/material/Container';

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';

const API_ENDPOINT = "https://powercalc.lauwbier.nl/api/library"

const theme = createTheme({
  palette: {
    background: {
      default: cyan[50],
    }
  },
});

const App: React.FC = () => {
  const [data, setData] = useState<PowerProfile[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(API_ENDPOINT);
      if (response.status !== 200) {
        throw new Error("Unexpected status code from library API")
      }
      const json = await response.json();
  
      const powerProfiles: PowerProfile[] = [];

      json.manufacturers.forEach((manufacturer: { models: any[]; name: string; }) => {
            manufacturer.models.forEach(model => {
                powerProfiles.push({
                    manufacturer: manufacturer.name,
                    modelId: model.id,
                    name: model.name,
                    aliases: model.aliases?.join('|') || '-',
                    deviceType: model.device_type,
                    colorModes: model.color_modes || [],
                    updateTimestamp: model.update_timestamp
                });
            });
        });
        setData(powerProfiles);
    }

    fetchData()
      .catch(console.error);
  }, []);

  const columns: MRT_ColumnDef<PowerProfile>[] = [
    {
      accessorKey: 'deviceType',
      header: 'Device type',
      enableGlobalFilter: false,
      filterVariant: 'select',
      filterSelectOptions: Object.values(DeviceType),
      grow: false,
      size: 150,
      enableColumnActions: false,
      enableSorting: false,
      enableColumnDragging: false,
      muiFilterTextFieldProps: { placeholder: 'Filter' },
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
      filterVariant: 'select',
      grow: false,
      size: 200,
      muiFilterTextFieldProps: { placeholder: 'Filter' },
    },
    {
      accessorKey: 'modelId',
      header: 'Model',
      muiFilterTextFieldProps: { placeholder: 'Filter' },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      muiFilterTextFieldProps: { placeholder: 'Filter' },
    },
    {
      accessorKey: 'aliases',
      header: 'Aliases',
    },
  ]

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
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnVisibility: { aliases: false },
    },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
      label: 'Search',
      placeholder: 'Search 100 rows',
    },
    layoutMode: 'grid',
    renderDetailPanel: ({ row }) => <DetailPanel profile={row.original} />
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Header total={data.length} />
        <MaterialReactTable table={table} />
      </Container>
    </ThemeProvider>
  )
}

export default App;