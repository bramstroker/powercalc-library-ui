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
import { useMemo } from "react";
import { Link as RouterLink, useSearchParams } from "react-router";

import type { BreadcrumbItem } from "../seo/breadcrumbs";
import { CalculationStrategy } from "../types/CalculationStrategy";
import type { Author as AuthorDetails, Manufacturer, PowerProfile } from "../types/PowerProfile";
import { getContributorTier } from "../utils/contributorTier";
import { numberFormat, plural } from "../utils/plural";
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

const PROFILE_SORTS: ProfileSort[] = ["popular", "newest", "name"];
const DEFAULT_PROFILE_SORT: ProfileSort = "popular";

const countBy = <T,>(items: T[], keyOf: (item: T) => string): Counted<{ key: string }>[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
};

const HeroStat = ({ icon, value, label }: { icon: ReactNode; value: number; label: string }) => (
  <Stack
    direction="row"
    aria-label={`${numberFormat.format(value)} ${(value === 1
      ? label.replace(/s$/, "")
      : label
    ).toLowerCase()}`}
    sx={{ alignItems: "baseline", gap: 0.75, color: "text.secondary" }}
  >
    <Box sx={{ display: "flex", alignSelf: "center" }}>{icon}</Box>
    <Typography component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
      {numberFormat.format(value)}
    </Typography>
    <Typography component="span" variant="body2">
      {label}
    </Typography>
  </Stack>
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
      {icon && <Box sx={{ display: "flex", color: "text.secondary" }}>{icon}</Box>}
      <Typography variant="body2" sx={{ minWidth: 0, flex: 1, fontWeight: 600 }}>
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

export const Author = ({ authorDetails, authorProfiles = [], authorRank = null }: AuthorProps) => {
  const githubUsername = authorDetails?.githubUsername;
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get("sort") as ProfileSort | null;
  const profileSort: ProfileSort =
    sortParam && PROFILE_SORTS.includes(sortParam) ? sortParam : DEFAULT_PROFILE_SORT;

  const contributionCount = authorProfiles.length;
  const tier = getContributorTier(contributionCount);
  /**
   * Distribution panels need something to distribute. Below the first tier a contributor has one
   * or two profiles, and the breakdowns become two full-width bars at 100% restating the stat
   * tiles above them.
   */
  const showBreakdowns = contributionCount >= 3;
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
    return countBy(authorProfiles, (profile) => profile.manufacturer.dirName).map((entry) => ({
      ...entry,
      manufacturer: byName.get(entry.key)!,
    }));
  }, [authorProfiles]);

  const contributorSince = useMemo(() => {
    if (authorProfiles.length === 0) return null;
    return Math.min(...authorProfiles.map((profile) => profile.createdAt.getFullYear()));
  }, [authorProfiles]);

  const achievements = useMemo(() => {
    const labels: string[] = [];
    const primaryType = deviceTypes[0];
    if (primaryType && contributionCount >= 5 && primaryType.count / contributionCount >= 0.5) {
      labels.push(`${humanizeIdentifier(primaryType.key)} specialist`);
    }
    if (
      authorProfiles.filter((profile) => profile.calculationStrategy === CalculationStrategy.LUT)
        .length >= 5
    ) {
      labels.push("LUT contributor");
    }
    return labels.slice(0, 2);
  }, [authorProfiles, contributionCount, deviceTypes]);

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
          <Box
            sx={{
              display: "grid",
              alignItems: "center",
              columnGap: { xs: 2, sm: 2.5 },
              rowGap: { xs: 1.75, sm: 0.75 },
              gridTemplateColumns: {
                xs: "auto minmax(0, 1fr)",
                sm: "auto minmax(0, 1fr) auto",
              },
              // On a narrow screen the avatar shares its row with the name instead of sitting
              // alone above an empty half-line; everything else drops to full width beneath.
              gridTemplateAreas: {
                xs: `"avatar identity" "meta meta" "actions actions"`,
                sm: `"avatar identity actions" "avatar meta actions"`,
              },
            }}
          >
            <GithubAvatar
              username={githubUsername}
              name={authorDetails.name || githubUsername}
              resolution={192}
              sx={{
                gridArea: "avatar",
                width: { xs: 72, sm: 96 },
                height: { xs: 72, sm: 96 },
                border: 3,
                borderColor: "primary.main",
                boxShadow: 3,
              }}
            />

            <Box sx={{ gridArea: "identity", minWidth: 0 }}>
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
            </Box>

            <Box sx={{ gridArea: "meta", minWidth: 0 }}>
              {contributorSince && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Contributing since {contributorSince}
                </Typography>
              )}

              <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
                <ContributorTierChip profileCount={contributionCount} />
                {achievements.map((achievement) => (
                  <Chip key={achievement} size="small" variant="outlined" label={achievement} />
                ))}
                {authorRank && tier && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`#${authorRank.rank} of ${plural(authorRank.total, "contributor")}`}
                  />
                )}
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "row", sm: "column" }}
              sx={{ gridArea: "actions", width: { xs: "100%", sm: "auto" }, gap: 1 }}
            >
              <Button
                variant="contained"
                component={RouterLink}
                to={`/?author=${encodeURIComponent(githubUsername)}`}
                sx={{ flex: { xs: 1, sm: "initial" }, whiteSpace: "nowrap" }}
              >
                Open in library
              </Button>
              <Button
                variant="outlined"
                startIcon={<GitHubIcon />}
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ flex: { xs: 1, sm: "initial" }, whiteSpace: "nowrap" }}
              >
                GitHub
              </Button>
            </Stack>
          </Box>

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
            <HeroStat
              icon={<LibraryBooksIcon fontSize="small" />}
              value={contributionCount}
              label="Profiles"
            />
            <HeroStat
              icon={<FactoryIcon fontSize="small" />}
              value={manufacturers.length}
              label="Manufacturers"
            />
            <HeroStat
              icon={<DevicesOtherIcon fontSize="small" />}
              value={deviceTypes.length}
              label="Device types"
            />
          </Stack>
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
              <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                Community impact
              </Typography>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
                {numberFormat.format(knownDevices)} known devices
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Powered by profiles contributed by {authorDetails.name || githubUsername}.
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

        {showBreakdowns && (
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
                      icon={DeviceIcon ? <DeviceIcon fontSize="small" /> : undefined}
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
                    icon={<ManufacturerLogo manufacturer={manufacturer} size={24} />}
                  />
                ))}
              </Stack>
              {manufacturers.length > 5 && (
                <Typography
                  component={RouterLink}
                  to={`/?author=${encodeURIComponent(githubUsername)}`}
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 2,
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": { color: "primary.main", textDecoration: "underline" },
                  }}
                >
                  And {plural(manufacturers.length - 5, "more manufacturer")} in the library
                </Typography>
              )}
            </Paper>
          </Box>
        )}

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
                {plural(contributionCount, "profile")} across{" "}
                {plural(manufacturers.length, "manufacturer")}
              </Typography>
            </Box>
            {contributionCount > 1 && (
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <SortIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={profileSort}
                  aria-label="Sort contributed profiles"
                  onChange={(_event, next: ProfileSort | null) => {
                    if (!next) return;
                    setSearchParams(
                      (current) => {
                        const params = new URLSearchParams(current);
                        if (next === DEFAULT_PROFILE_SORT) {
                          params.delete("sort");
                        } else {
                          params.set("sort", next);
                        }
                        return params;
                      },
                      { replace: true, preventScrollReset: true },
                    );
                  }}
                >
                  <ToggleButton value="popular">Popular</ToggleButton>
                  <ToggleButton value="newest">Newest</ToggleButton>
                  <ToggleButton value="name">Name</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}
          </Stack>

          <ProfileCardGrid data-testid="author-profile-list" profiles={sortedProfiles} />
        </Box>
      </Stack>
    </>
  );
};
