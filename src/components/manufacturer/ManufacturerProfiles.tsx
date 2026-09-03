import SearchIcon from "@mui/icons-material/Search";
import { Box, Chip, InputAdornment, Stack, TextField, Typography } from "@mui/material";

import type { PowerProfile } from "../../types/PowerProfile";
import { numberFormat } from "../../utils/formatters";
import { plural } from "../../utils/plural";
import { humanizeIdentifier } from "../../utils/profilePresentation";
import type { ProfileSort } from "../../utils/profileSort";
import { getDeviceTypeIcon } from "../library/facetIcons";
import { ProfileCardGrid } from "../library/ProfileCardGrid";
import { ProfileSortControl } from "../library/ProfileSortControl";

import type { DeviceTypeCount } from "./useManufacturerViewModel";

export type ManufacturerProfilesProps = {
  deviceType: string | null;
  deviceTypeCounts: DeviceTypeCount[];
  isFiltered: boolean;
  onDeviceTypeChange: (deviceType: string | null) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: ProfileSort) => void;
  profileCount: number;
  profiles: PowerProfile[];
  search: string;
  showDeviceTypeFilter: boolean;
  showProfileSearch: boolean;
  sort: ProfileSort;
};

export const ManufacturerProfiles = ({
  deviceType,
  deviceTypeCounts,
  isFiltered,
  onDeviceTypeChange,
  onSearchChange,
  onSortChange,
  profileCount,
  profiles,
  search,
  showDeviceTypeFilter,
  showProfileSearch,
  sort,
}: ManufacturerProfilesProps) => (
  <Box component="section">
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{ alignItems: { sm: "center" }, gap: 1.5, mb: 2 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 800, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          Profiles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isFiltered
            ? `Showing ${numberFormat.format(profiles.length)} of ${plural(profileCount, "profile")}`
            : `${plural(profileCount, "profile")} across ${plural(deviceTypeCounts.length, "device type")}`}
        </Typography>
      </Box>

      {profileCount > 1 && (
        <ProfileSortControl value={sort} label="Sort profiles" onChange={onSortChange} />
      )}
    </Stack>

    {showProfileSearch && (
      <TextField
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search model or name"
        size="small"
        fullWidth
        slotProps={{
          htmlInput: { "aria-label": "Search profiles" },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: { sm: 320 }, mb: 2 }}
      />
    )}

    {showDeviceTypeFilter && (
      <Stack
        direction="row"
        useFlexGap
        sx={{ flexWrap: "wrap", gap: 1, mb: 2.5 }}
        data-testid="manufacturer-device-type-filter"
      >
        <Chip
          label={`All (${numberFormat.format(profileCount)})`}
          size="small"
          aria-pressed={deviceType === null}
          color={deviceType === null ? "primary" : "default"}
          variant={deviceType === null ? "filled" : "outlined"}
          onClick={() => onDeviceTypeChange(null)}
        />
        {deviceTypeCounts.map(({ deviceType: type, count }) => {
          const DeviceIcon = getDeviceTypeIcon(type);
          const selected = deviceType === type;
          return (
            <Chip
              key={type}
              icon={DeviceIcon ? <DeviceIcon /> : undefined}
              label={`${humanizeIdentifier(type)} (${numberFormat.format(count)})`}
              size="small"
              aria-pressed={selected}
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
              onClick={() => onDeviceTypeChange(selected ? null : type)}
            />
          );
        })}
      </Stack>
    )}

    {profiles.length === 0 ? (
      <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
        No profiles match the current filters.
      </Typography>
    ) : (
      <ProfileCardGrid data-testid="manufacturer-profile-list" profiles={profiles} />
    )}
  </Box>
);
