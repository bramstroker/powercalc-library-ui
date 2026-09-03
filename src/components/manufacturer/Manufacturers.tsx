import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Card,
  CardActionArea,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router";

import { useLibrary } from "../../context/LibraryContext";
import { useUrlSearchParams } from "../../hooks/useUrlSearchParams";
import type { Manufacturer } from "../../types/PowerProfile";
import { manufacturerPath } from "../../utils/urlSlugs.mjs";
import { getDeviceTypeIcon } from "../profile/DeviceTypeIcon";
import { PageBreadcrumbs } from "../shared/PageBreadcrumbs";

import { ManufacturerLogo } from "./logo/ManufacturerLogo";

type ManufacturerSummary = {
  manufacturer: Manufacturer;
  profileCount: number;
  deviceTypes: string[];
};

type SortKey = "profiles" | "name";

const SORT_KEYS: SortKey[] = ["profiles", "name"];
const DEFAULT_SORT: SortKey = "profiles";

/** Query-string keys, so the index survives a share, a reload and a trip to a manufacturer page. */
const PARAM = { search: "q", sort: "sort" } as const;

export const Manufacturers = () => {
  const { powerProfiles, manufacturers } = useLibrary();
  const { searchParams, updateSearchParams } = useUrlSearchParams();

  const search = searchParams.get(PARAM.search) ?? "";
  const sortParam = searchParams.get(PARAM.sort) as SortKey | null;
  const sort: SortKey = sortParam && SORT_KEYS.includes(sortParam) ? sortParam : DEFAULT_SORT;

  const summaries = useMemo<ManufacturerSummary[]>(() => {
    const counts = new Map<string, { profileCount: number; deviceTypes: Set<string> }>();
    for (const profile of powerProfiles) {
      const entry = counts.get(profile.manufacturer.dirName) ?? {
        profileCount: 0,
        deviceTypes: new Set<string>(),
      };
      entry.profileCount += 1;
      entry.deviceTypes.add(profile.deviceType);
      counts.set(profile.manufacturer.dirName, entry);
    }

    return Object.values(manufacturers).map((manufacturer) => {
      const entry = counts.get(manufacturer.dirName);
      return {
        manufacturer,
        profileCount: entry?.profileCount ?? 0,
        deviceTypes: [...(entry?.deviceTypes ?? [])].sort((a, b) => a.localeCompare(b)),
      };
    });
  }, [powerProfiles, manufacturers]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    // Aliases are searched too, so "Leedarson" finds Linkind and "AwoX" finds EGLO.
    const matched = term
      ? summaries.filter(
          ({ manufacturer }) =>
            manufacturer.fullName.toLowerCase().includes(term) ||
            manufacturer.aliases.some((alias) => alias.toLowerCase().includes(term)),
        )
      : summaries;

    return [...matched].sort((a, b) =>
      sort === "name"
        ? a.manufacturer.fullName.localeCompare(b.manufacturer.fullName)
        : b.profileCount - a.profileCount ||
          a.manufacturer.fullName.localeCompare(b.manufacturer.fullName),
    );
  }, [summaries, search, sort]);

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "Manufacturers" }]} />
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manufacturers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {summaries.length} manufacturers, {powerProfiles.length} profiles
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3, alignItems: { sm: "center" } }}
      >
        <TextField
          value={search}
          onChange={(event) => updateSearchParams({ [PARAM.search]: event.target.value || null })}
          aria-label="Search manufacturers"
          placeholder="Search manufacturers"
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: { sm: 320 } }}
        />

        <ToggleButtonGroup
          value={sort}
          exclusive
          size="small"
          onChange={(_event, next: SortKey | null) => {
            if (next) updateSearchParams({ [PARAM.sort]: next === DEFAULT_SORT ? null : next });
          }}
          aria-label="Sort manufacturers"
        >
          <ToggleButton value="profiles">Most profiles</ToggleButton>
          <ToggleButton value="name">Name</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {visible.length === 0 ? (
        <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
          No manufacturers match &quot;{search}&quot;
        </Typography>
      ) : (
        <Grid container spacing={2} data-testid="manufacturer-list">
          {visible.map(({ manufacturer, profileCount, deviceTypes }) => (
            <Grid key={manufacturer.dirName} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  component={RouterLink}
                  to={manufacturerPath(manufacturer.dirName)}
                  sx={{ height: "100%", p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <ManufacturerLogo manufacturer={manufacturer} size={44} />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                      {manufacturer.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {profileCount} profile{profileCount !== 1 ? "s" : ""}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.5} sx={{ color: "text.secondary" }}>
                    {deviceTypes.map((deviceType) => {
                      const Icon = getDeviceTypeIcon(deviceType);
                      return Icon ? (
                        <Tooltip key={deviceType} title={deviceType}>
                          <Icon fontSize="small" titleAccess={deviceType} />
                        </Tooltip>
                      ) : null;
                    })}
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};
