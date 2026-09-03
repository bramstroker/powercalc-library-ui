import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import GitHubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import LanguageIcon from "@mui/icons-material/Language";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { ReactCountryFlag } from "react-country-flag";
import { Link as RouterLink } from "react-router";

import { useUrlSearchParams } from "../hooks/useUrlSearchParams";
import type { BreadcrumbItem } from "../seo/breadcrumbs";
import type { Manufacturer as ManufacturerDetails, PowerProfile } from "../types/PowerProfile";
import { formatCountryName, numberFormat } from "../utils/formatters";
import { manufacturerLibraryIntroduction } from "../utils/manufacturerPresentation";
import { plural } from "../utils/plural";
import { humanizeIdentifier } from "../utils/profilePresentation";
import { DEFAULT_PROFILE_SORT, parseProfileSort, sortProfiles } from "../utils/profileSort";

import { InlineHeroStat } from "./InlineHeroStat";
import { getDeviceTypeIcon } from "./library/facetIcons";
import { ProfileCardGrid } from "./library/ProfileCardGrid";
import { ProfileSortControl } from "./library/ProfileSortControl";
import { ManufacturerLogo } from "./ManufacturerLogo";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

/** Query-string keys, so a filtered brand page survives a share, a reload and the back button. */
const PARAM = { search: "q", deviceType: "deviceType", sort: "sort" } as const;

/** Below this a brand's profiles fit on a screen or two, and a search box is only noise. */
const SEARCH_FROM = 12;

const ManufacturerAliases = ({ aliases }: { aliases: string[] }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  if (aliases.length === 0) return null;

  return (
    <>
      <Tooltip title="Alternate manufacturer names used for device discovery" arrow describeChild>
        <Chip
          label={`Discovery aliases (${aliases.length})`}
          size="small"
          variant="outlined"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? "manufacturer-aliases-popover" : undefined}
          sx={{ mt: 1, color: "text.secondary", borderColor: "divider" }}
        />
      </Tooltip>
      <Popover
        id="manufacturer-aliases-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, width: { xs: 280, sm: 400 }, maxHeight: 320, overflowY: "auto" }}>
          <Typography variant="subtitle2">Discovery aliases</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Alternate manufacturer names used when matching devices to profiles.
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 1.5 }}>
            {aliases.map((alias) => (
              <Chip key={alias} label={alias} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export type ManufacturerProps = {
  manufacturer?: ManufacturerDetails;
  profiles?: PowerProfile[];
};

export const Manufacturer = ({ manufacturer, profiles = [] }: ManufacturerProps) => {
  const { searchParams, updateSearchParams } = useUrlSearchParams();

  const profileCount = profiles.length;
  const displayName = manufacturer?.fullName ?? "";
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", to: "/" },
    { label: "Manufacturers", to: "/manufacturers" },
    { label: displayName },
  ];

  const search = searchParams.get(PARAM.search) ?? "";
  const sort = parseProfileSort(searchParams.get(PARAM.sort));

  const deviceTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const profile of profiles) {
      counts.set(profile.deviceType, (counts.get(profile.deviceType) ?? 0) + 1);
    }
    // Biggest group first — for a brand with 200 lights and one plug, the lights are the page.
    return [...counts.entries()]
      .map(([deviceType, count]) => ({ deviceType, count }))
      .sort((a, b) => b.count - a.count || a.deviceType.localeCompare(b.deviceType));
  }, [profiles]);

  // An unknown device type in the URL (stale link, hand-typed) simply shows everything.
  const deviceTypeParam = searchParams.get(PARAM.deviceType);
  const deviceType = deviceTypeCounts.some((entry) => entry.deviceType === deviceTypeParam)
    ? deviceTypeParam
    : null;

  const visibleProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = profiles.filter((profile) => {
      if (deviceType && profile.deviceType !== deviceType) return false;
      if (!term) return true;
      return (
        profile.modelId.toLowerCase().includes(term) ||
        profile.name.toLowerCase().includes(term) ||
        profile.aliases.some((alias) => alias.toLowerCase().includes(term))
      );
    });

    return sortProfiles(matched, sort);
  }, [profiles, deviceType, search, sort]);

  const knownProfileInstallations = profiles.reduce(
    (total, profile) => total + profile.usageStats.installationCount,
    0,
  );
  const introduction = manufacturer ? manufacturerLibraryIntroduction(manufacturer, profiles) : "";

  if (!manufacturer) {
    return (
      <>
        <Typography variant="h5">Manufacturer not found</Typography>
        <Button component={RouterLink} to="/manufacturers" sx={{ mt: 2 }}>
          Back to all manufacturers
        </Button>
      </>
    );
  }

  const isFiltered = deviceType !== null || search.trim() !== "";

  return (
    <>
      <PageBreadcrumbs items={breadcrumbItems} includeStructuredData={false} />
      <Paper
        component="section"
        elevation={0}
        sx={[
          {
            position: "relative",
            overflow: "hidden",
            p: { xs: 2, sm: 3.5 },
            mb: { xs: 3, sm: 4 },
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
            backgroundImage:
              "radial-gradient(circle at 90% 0%, rgba(121, 134, 203, 0.22), transparent 42%)",
          },
          (theme) =>
            theme.applyStyles("light", {
              backgroundImage:
                "radial-gradient(circle at 90% 0%, rgba(63, 81, 181, 0.13), transparent 42%)",
            }),
        ]}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            alignItems: "flex-start",
            gap: { xs: 2, sm: 2.5 },
          }}
        >
          <ManufacturerLogo manufacturer={manufacturer} size={64} variant="wide" plate />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                wordBreak: "break-word",
              }}
            >
              {manufacturer.fullName}
            </Typography>

            {manufacturer.country && (
              <Stack
                direction="row"
                sx={{ mt: 0.5, alignItems: "center", gap: 0.75, color: "text.secondary" }}
              >
                <ReactCountryFlag
                  countryCode={manufacturer.country}
                  svg
                  aria-hidden="true"
                  style={{ fontSize: "1.1em", borderRadius: 2 }}
                />
                <Typography variant="body2">{formatCountryName(manufacturer.country)}</Typography>
              </Stack>
            )}

            {manufacturer.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: "70ch" }}>
                {manufacturer.description}
              </Typography>
            )}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: manufacturer.description ? 1.5 : 1, maxWidth: "70ch" }}
            >
              {introduction}
            </Typography>

            <ManufacturerAliases aliases={manufacturer.aliases} />
          </Box>

          <Stack
            direction={{ xs: "row", md: "column" }}
            sx={{ width: { xs: "100%", md: "auto" }, gap: 1 }}
          >
            <Button
              variant="contained"
              component={RouterLink}
              to={`/?manufacturer=${encodeURIComponent(manufacturer.fullName)}`}
              sx={{ flex: { xs: 1, md: "initial" } }}
            >
              Browse profiles
            </Button>

            {manufacturer.website && (
              <Button
                variant="outlined"
                startIcon={<LanguageIcon />}
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ flex: { xs: 1, md: "initial" } }}
              >
                Brand website
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              href={`https://github.com/bramstroker/homeassistant-powercalc/tree/master/profile_library/${manufacturer.dirName}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ flex: { xs: 1, md: "initial" } }}
            >
              Library source
            </Button>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          useFlexGap
          sx={{
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: { xs: 2, sm: 3 },
            rowGap: 1,
            mt: { xs: 2, sm: 2.5 },
            pt: { xs: 2, sm: 2.5 },
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <InlineHeroStat
            icon={<LibraryBooksIcon fontSize="small" />}
            value={profileCount}
            label="Profiles"
          />
          <Tooltip
            title="The same Home Assistant installation may report more than one profile."
            arrow
          >
            <Box>
              <InlineHeroStat
                icon={<HomeIcon fontSize="small" />}
                value={knownProfileInstallations}
                label="Known installs"
              />
            </Box>
          </Tooltip>
          <InlineHeroStat
            icon={<DevicesOtherIcon fontSize="small" />}
            value={deviceTypeCounts.length}
            label="Device types"
          />
        </Stack>
      </Paper>

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
                ? `Showing ${numberFormat.format(visibleProfiles.length)} of ${plural(profileCount, "profile")}`
                : `${plural(profileCount, "profile")} across ${plural(deviceTypeCounts.length, "device type")}`}
            </Typography>
          </Box>

          {profileCount > 1 && (
            <ProfileSortControl
              value={sort}
              label="Sort profiles"
              onChange={(next) =>
                updateSearchParams({
                  [PARAM.sort]: next === DEFAULT_PROFILE_SORT ? null : next,
                })
              }
            />
          )}
        </Stack>

        {profileCount >= SEARCH_FROM && (
          <TextField
            value={search}
            onChange={(event) => updateSearchParams({ [PARAM.search]: event.target.value || null })}
            aria-label="Search profiles"
            placeholder="Search model or name"
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
            sx={{ maxWidth: { sm: 320 }, mb: 2 }}
          />
        )}

        {deviceTypeCounts.length > 1 && (
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
              onClick={() => updateSearchParams({ [PARAM.deviceType]: null })}
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
                  // Clicking the active type again clears it, like the facets on the library grid.
                  onClick={() => updateSearchParams({ [PARAM.deviceType]: selected ? null : type })}
                />
              );
            })}
          </Stack>
        )}

        {visibleProfiles.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
            No profiles match the current filters.
          </Typography>
        ) : (
          <ProfileCardGrid data-testid="manufacturer-profile-list" profiles={visibleProfiles} />
        )}
      </Box>
    </>
  );
};
