import { Box, Link, Stack } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Link as RouterLink, useLocation } from "react-router";

import type { ColorMode } from "../../types/ColorMode";
import type { Author, Connectivity, PowerProfile } from "../../types/PowerProfile";
import { isRecentlyAdded } from "../../utils/recency";
import { authorPath, profilePath } from "../../utils/urlSlugs.mjs";
import { AliasChips } from "../AliasChips";

import { ColorModeIcons } from "./ColorModeIcons";
import { ConnectivityIcons } from "./ConnectivityIcons";
import { DeviceTypeIcon } from "./facetIcons";
import { NewBadge } from "./NewBadge";
import { QualityBadge } from "./QualityBadge";

const ProfileModelLink = ({ profile }: { profile: PowerProfile }) => {
  const location = useLocation();

  return (
    <Link
      component={RouterLink}
      to={profilePath(profile.manufacturer.dirName, profile.modelId)}
      state={{ libraryPath: `${location.pathname}${location.search}` }}
      prefetch="intent"
      underline="hover"
      color="inherit"
      onClick={(event) => event.stopPropagation()}
    >
      {profile.modelId}
    </Link>
  );
};

export const LIBRARY_DATA_GRID_COLUMNS: GridColDef<PowerProfile>[] = [
  {
    field: "deviceType",
    headerName: "Device type",
    width: 110,
    align: "center",
    headerAlign: "center",
    // The value stays the raw string so sorting and the column picker still behave.
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, string>) => (
      <DeviceTypeIcon deviceType={value ?? ""} />
    ),
  },
  {
    field: "manufacturer",
    headerName: "Manufacturer",
    width: 180,
    valueGetter: (_value, row) => row.manufacturer.fullName,
  },
  {
    field: "modelId",
    headerName: "Model",
    flex: 1,
    minWidth: 140,
    renderCell: ({ row }: GridRenderCellParams<PowerProfile, string>) => (
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, height: "100%" }}>
        <ProfileModelLink profile={row} />
        {isRecentlyAdded(row) && <NewBadge />}
      </Stack>
    ),
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1.5,
    minWidth: 180,
  },
  {
    field: "aliases",
    headerName: "Aliases",
    flex: 1,
    minWidth: 160,
    sortable: false,
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, string[]>) => (
      // AliasChips renders a fragment, so the cell needs its own flex box to centre the chips.
      <Box sx={{ display: "flex", alignItems: "center", height: "100%", overflow: "hidden" }}>
        <AliasChips aliases={value ?? []} />
      </Box>
    ),
  },
  {
    field: "colorModes",
    headerName: "Color modes",
    width: 160,
    sortable: false,
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, ColorMode[]>) => (
      <ColorModeIcons colorModes={value ?? []} />
    ),
  },
  {
    field: "connectivity",
    headerName: "Connectivity",
    width: 140,
    sortable: false,
    valueGetter: (_value, row): Connectivity[] => row.deviceSpecs?.connectivity ?? [],
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, Connectivity[]>) => (
      <ConnectivityIcons connectivity={value ?? []} />
    ),
  },
  {
    field: "authors",
    headerName: "Authors",
    width: 160,
    valueGetter: (value: Author[]) => value?.map((author) => author.name).join(", ") ?? "",
    renderCell: ({ row }: GridRenderCellParams<PowerProfile>) => (
      <Stack
        direction="row"
        sx={{ alignItems: "center", gap: 0.5, height: "100%", overflow: "hidden" }}
      >
        {row.authors.map((author, index) => (
          <Link
            key={author.githubUsername || `${author.name}-${index}`}
            component={RouterLink}
            to={authorPath(author.githubUsername)}
            prefetch="intent"
            onClick={(event) => {
              // Keep the row click from navigating to the profile instead.
              event.stopPropagation();
            }}
          >
            {author.name}
          </Link>
        ))}
      </Stack>
    ),
  },
  {
    field: "measureMethod",
    headerName: "Measure method",
    width: 150,
  },
  {
    field: "measureDevice",
    headerName: "Measure device",
    width: 180,
  },
  {
    field: "standbyPower",
    headerName: "Standby power",
    type: "number",
    width: 140,
  },
  {
    field: "standbyPowerOn",
    headerName: "Standby power on",
    type: "number",
    width: 150,
  },
  {
    field: "maxPower",
    headerName: "Max power",
    type: "number",
    width: 120,
  },
  {
    field: "updatedAt",
    headerName: "Updated",
    type: "dateTime",
    width: 180,
  },
  {
    field: "createdAt",
    headerName: "Created",
    type: "dateTime",
    width: 180,
  },
  {
    field: "calculationStrategy",
    headerName: "Calculation strategy",
    width: 160,
  },
  {
    field: "subProfileCount",
    headerName: "Sub profiles",
    type: "number",
    width: 120,
  },
  {
    field: "installationCount",
    headerName: "Installations",
    type: "number",
    width: 130,
    valueGetter: (_value, row) => row.usageStats?.installationCount,
  },
  {
    field: "lutQualityScore",
    headerName: "LUT quality",
    type: "number",
    width: 130,
    align: "center",
    headerAlign: "center",
    // Numeric so sorting ranks the rough profiles together; the chip only colours the readout.
    valueGetter: (_value, row) => row.lutQuality?.score,
    renderCell: ({ value }: GridRenderCellParams<PowerProfile, number>) => (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <QualityBadge score={value} />
      </Box>
    ),
  },
];
