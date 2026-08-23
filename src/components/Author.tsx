import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import FactoryIcon from "@mui/icons-material/Factory";
import GitHubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SortIcon from "@mui/icons-material/Sort";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";

import type { BreadcrumbItem } from "../seo/breadcrumbs";
import type {
  Author as AuthorDetails,
  Manufacturer,
  PowerProfile,
} from "../types/PowerProfile";
import { humanizeIdentifier } from "../utils/profilePresentation";
import { manufacturerPath } from "../utils/urlSlugs.mjs";

import { ContributorTierChip } from "./ContributorTierBadge";
import { GithubAvatar } from "./GithubAvatar";
import { LazyAuthorContributionsChart } from "./LazyAuthorContributionsChart";
import { getDeviceTypeIcon } from "./library/facetIcons";
import { ProfileCardGrid } from "./library/ProfileCardGrid";
import { ManufacturerLogo } from "./ManufacturerLogo";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

type Counted<T> = T & { count: number };
type ProfileSort = "popular" | "newest" | "name";

const numberFormat = new Intl.NumberFormat("en-US");

const countBy = <T,>(
  items: T[],
  keyOf: (item: T) => string,
): Counted<{ key: string }>[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
};

const Stat = ({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) => (
  <Box
    sx={{
      minWidth: 0,
      p: { xs: 1.25, sm: 1.5 },
      border: 1,
      borderColor: "divider",
      borderRadius: 2,
      bgcolor: "action.hover",
    }}
  >
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 0.75, color: "text.secondary" }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, textTransform: "uppercase" }}
      >
        {label}
      </Typography>
    </Stack>
    <Typography
      component="p"
      variant="h5"
      sx={{ mt: 0.5, fontWeight: 800, lineHeight: 1.1 }}
    >
      {value}
    </Typography>
  </Box>
);

const BreakdownRow = ({
  label,
  count,
  total,
  icon,
  accessibleLabel,
}: {
  label: ReactNode;
  count: number;
  total: number;
  icon?: ReactNode;
  accessibleLabel: string;
}) => (
  <Box>
    <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 0.75 }}>
      {icon && (
        <Box sx={{ display: "flex", color: "text.secondary" }}>{icon}</Box>
      )}
      <Typography
        variant="body2"
        sx={{ minWidth: 0, flex: 1, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {count}
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={total === 0 ? 0 : (count / total) * 100}
      aria-label={accessibleLabel}
      aria-valuetext={`${count} of ${total} contributed profiles`}
      sx={{ height: 6, borderRadius: 999 }}
    />
  </Box>
);

export type AuthorProps = {
  authorDetails?: AuthorDetails;
  authorProfiles?: PowerProfile[];
  authorRank?: { rank: number; total: number } | null;
};

export const Author = ({
  authorDetails,
  authorProfiles = [],
  authorRank = null,
}: AuthorProps) => {
  const githubUsername = authorDetails?.githubUsername;
  const [profileSort, setProfileSort] = useState<ProfileSort>("popular");

  const contributionCount = authorProfiles.length;
  const displayName = authorDetails?.name || githubUsername || "Contributor";
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", to: "/" },
    { label: "Contributors", to: "/contributors" },
    { label: displayName },
  ];

  const deviceTypes = useMemo(
    () => countBy(authorProfiles, (profile) => profile.deviceType),
    [authorProfiles],
  );

  const manufacturers = useMemo(() => {
    const byName = new Map<string, Manufacturer>();
    for (const profile of authorProfiles) {
      byName.set(profile.manufacturer.dirName, profile.manufacturer);
    }
    return countBy(
      authorProfiles,
      (profile) => profile.manufacturer.dirName,
    ).map((entry) => ({
      ...entry,
      manufacturer: byName.get(entry.key)!,
    }));
  }, [authorProfiles]);

  const contributorSince = useMemo(() => {
    if (authorProfiles.length === 0) return null;
    return Math.min(
      ...authorProfiles.map((profile) => profile.createdAt.getFullYear()),
    );
  }, [authorProfiles]);

  const achievements = useMemo(() => {
    const labels: string[] = [];
    if (manufacturers.length >= 5)
      labels.push(`${manufacturers.length} manufacturers`);
    const primaryType = deviceTypes[0];
    if (
      primaryType &&
      contributionCount >= 5 &&
      primaryType.count / contributionCount >= 0.5
    ) {
      labels.push(`${humanizeIdentifier(primaryType.key)} specialist`);
    }
    if (
      authorProfiles.filter((profile) => profile.calculationStrategy === "lut")
        .length >= 5
    ) {
      labels.push("LUT contributor");
    }
    return labels.slice(0, 2);
  }, [authorProfiles, contributionCount, deviceTypes, manufacturers.length]);

  const sortedProfiles = useMemo(() => {
    return [...authorProfiles].sort((a, b) => {
      if (profileSort === "popular") {
        return (
          b.usageStats.installationCount - a.usageStats.installationCount ||
          a.name.localeCompare(b.name)
        );
      }
      if (profileSort === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [authorProfiles, profileSort]);

  if (!githubUsername || !authorDetails) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" component="h1">
          Author not found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          This contributor does not exist in the current Powercalc library.
        </Typography>
        <Button component={RouterLink} to="/contributors" sx={{ mt: 2 }}>
          View contributors
        </Button>
      </Paper>
    );
  }

  const knownDevices = authorProfiles.reduce(
    (total, profile) => total + profile.usageStats.deviceCount,
    0,
  );
  const knownProfileInstallations = authorProfiles.reduce(
    (total, profile) => total + profile.usageStats.installationCount,
    0,
  );

  return (
    <>
      <PageBreadcrumbs items={breadcrumbItems} includeStructuredData={false} />
      <Stack sx={{ gap: { xs: 2, sm: 3 } }}>
        <Paper
          component="section"
          elevation={0}
          sx={[
            {
              position: "relative",
              overflow: "hidden",
              p: { xs: 2, sm: 3.5 },
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
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, gap: 2.5 }}
          >
            <GithubAvatar
              username={githubUsername}
              name={authorDetails.name || githubUsername}
              sx={{
                width: { xs: 80, sm: 96 },
                height: { xs: 80, sm: 96 },
                border: 3,
                borderColor: "primary.main",
                boxShadow: 3,
              }}
            />

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
                {authorDetails.name || githubUsername}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                @{githubUsername} · Powercalc Library Contributor
              </Typography>
              {contributorSince && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Contributing since {contributorSince}
                </Typography>
              )}

              <Stack
                direction="row"
                useFlexGap
                sx={{ flexWrap: "wrap", gap: 0.75, mt: 1.5 }}
              >
                <ContributorTierChip profileCount={contributionCount} />
                {achievements.map((achievement) => (
                  <Chip
                    key={achievement}
                    size="small"
                    variant="outlined"
                    label={achievement}
                  />
                ))}
                {authorRank && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`#${authorRank.rank} of ${authorRank.total} contributors`}
                  />
                )}
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "row", sm: "column" }}
              sx={{ width: { xs: "100%", sm: "auto" }, gap: 1 }}
            >
              <Button
                variant="contained"
                component={RouterLink}
                to={`/?author=${encodeURIComponent(githubUsername)}`}
                sx={{ flex: { xs: 1, sm: "initial" } }}
              >
                Open in library
              </Button>
              <Button
                variant="outlined"
                startIcon={<GitHubIcon />}
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ flex: { xs: 1, sm: "initial" } }}
              >
                GitHub
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.25,
              mt: 3,
            }}
          >
            <Stat
              icon={<LibraryBooksIcon fontSize="small" />}
              value={numberFormat.format(contributionCount)}
              label="Profiles"
            />
            <Stat
              icon={<FactoryIcon fontSize="small" />}
              value={numberFormat.format(manufacturers.length)}
              label="Manufacturers"
            />
            <Stat
              icon={<DevicesOtherIcon fontSize="small" />}
              value={numberFormat.format(deviceTypes.length)}
              label="Device types"
            />
            <Stat
              icon={<CalendarMonthIcon fontSize="small" />}
              value={String(contributorSince)}
              label="Since"
            />
          </Box>
        </Paper>

        <Paper
          component="section"
          variant="outlined"
          sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { sm: "center" }, gap: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                color="primary"
                sx={{ fontWeight: 800 }}
              >
                Community impact
              </Typography>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
                {numberFormat.format(knownDevices)} known devices
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Powered by profiles contributed by{" "}
                {authorDetails.name || githubUsername}.
              </Typography>
            </Box>
            <Tooltip
              title="The same Home Assistant installation may report more than one contributed profile."
              arrow
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  minWidth: { sm: 210 },
                }}
              >
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                  <HomeIcon color="primary" />
                  <Box>
                    <Typography
                      component="p"
                      variant="h6"
                      sx={{ fontWeight: 800, lineHeight: 1.1 }}
                    >
                      {numberFormat.format(knownProfileInstallations)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      known profile installations
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Tooltip>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Paper
            component="section"
            variant="outlined"
            sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
          >
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 2 }}>
              <DevicesOtherIcon color="primary" />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
                Device mix
              </Typography>
            </Stack>
            <Stack sx={{ gap: 2 }}>
              {deviceTypes.map(({ key, count }) => {
                const DeviceIcon = getDeviceTypeIcon(key);
                return (
                  <BreakdownRow
                    key={key}
                    label={humanizeIdentifier(key)}
                    count={count}
                    total={contributionCount}
                    accessibleLabel={`${humanizeIdentifier(key)} contribution share`}
                    icon={
                      DeviceIcon ? <DeviceIcon fontSize="small" /> : undefined
                    }
                  />
                );
              })}
            </Stack>
          </Paper>

          <Paper
            component="section"
            variant="outlined"
            sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
          >
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 2 }}>
              <FactoryIcon color="primary" />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
                Top manufacturers
              </Typography>
            </Stack>
            <Stack sx={{ gap: 2 }}>
              {manufacturers.slice(0, 5).map(({ manufacturer, count }) => (
                <BreakdownRow
                  key={manufacturer.dirName}
                  label={
                    <Typography
                      component={RouterLink}
                      to={manufacturerPath(manufacturer.dirName)}
                      sx={{
                        color: "inherit",
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {manufacturer.fullName}
                    </Typography>
                  }
                  count={count}
                  total={contributionCount}
                  accessibleLabel={`${manufacturer.fullName} contribution share`}
                  icon={
                    <ManufacturerLogo manufacturer={manufacturer} size={24} />
                  }
                />
              ))}
            </Stack>
            {manufacturers.length > 5 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 2 }}
              >
                And {manufacturers.length - 5} more manufacturers
              </Typography>
            )}
          </Paper>
        </Box>

        <LazyAuthorContributionsChart profiles={authorProfiles} />

        <Box component="section">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { sm: "center" }, gap: 1.5, mb: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                Contributed profiles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contributionCount} profiles across {manufacturers.length}{" "}
                manufacturers
              </Typography>
            </Box>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
              <SortIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <ToggleButtonGroup
                size="small"
                exclusive
                value={profileSort}
                aria-label="Sort contributed profiles"
                onChange={(_event, next: ProfileSort | null) => {
                  if (next) setProfileSort(next);
                }}
              >
                <ToggleButton value="popular">Popular</ToggleButton>
                <ToggleButton value="newest">Newest</ToggleButton>
                <ToggleButton value="name">Name</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>

          <ProfileCardGrid
            data-testid="author-profile-list"
            profiles={sortedProfiles}
          />
        </Box>
      </Stack>
    </>
  );
};
