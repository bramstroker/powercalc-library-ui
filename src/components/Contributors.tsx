import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useCallback, useId, useMemo, useRef } from "react";
import { Link as RouterLink, useSearchParams } from "react-router";

import { SITE_URL } from "../config/site";
import { useLibrary } from "../context/LibraryContext";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import { MAX_ITEM_LIST_ENTRIES, type StructuredData as StructuredDataNode } from "../seo/meta";
import { StructuredData } from "../seo/StructuredData";
import type { ContributorSummary, PowerProfile } from "../types/PowerProfile";
import { CONTRIBUTOR_TIERS } from "../utils/contributorTier";
import { formatDateUtc } from "../utils/dateFormat";
import { numberFormat, plural } from "../utils/plural";
import { daysSince } from "../utils/recency";
import { authorPath, slugifyPathSegment } from "../utils/urlSlugs.mjs";

import { ContributorTierAvatar } from "./ContributorTierBadge";
import { GithubAvatar } from "./GithubAvatar";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

const RECENT_ACTIVITY_DAYS = 90;
const PAGE_SIZE = 24;
const RECENT_CONTRIBUTOR_COUNT = 6;
type SortKey = "recent" | "profiles" | "name";

const SORT_KEYS: SortKey[] = ["recent", "profiles", "name"];
const DEFAULT_SORT: SortKey = "profiles";

/** Query-string keys, so the directory survives a share, a reload and a trip to an author page. */
const PARAM = { search: "q", sort: "sort", tier: "tier", active: "active", show: "show" } as const;

type RecentContributor = ContributorSummary & {
  recentProfileCount: number;
};

const displayName = ({ author }: ContributorSummary) => author.name.trim() || author.githubUsername;

const validDateTime = (date: Date | null) => date?.getTime() ?? Number.NEGATIVE_INFINITY;

const withinRecentWindow = (profile: PowerProfile, now: Date) => {
  const age = daysSince(profile.createdAt, now);
  return age !== null && age >= 0 && age <= RECENT_ACTIVITY_DAYS;
};

const ContributorCard = ({ summary }: { summary: ContributorSummary }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardActionArea
      component={RouterLink}
      to={authorPath(summary.author.githubUsername)}
      prefetch="intent"
      sx={{ height: "100%", p: 2.25, alignItems: "stretch" }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <ContributorTierAvatar profileCount={summary.profileCount} size={20}>
          <GithubAvatar
            username={summary.author.githubUsername}
            name={displayName(summary)}
            sx={{ width: 48, height: 48 }}
          />
        </ContributorTierAvatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {displayName(summary)}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            @{summary.author.githubUsername}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: "wrap" }}>
        <Chip size="small" label={plural(summary.profileCount, "profile")} />
        <Chip size="small" label={plural(summary.manufacturerCount, "manufacturer")} />
        <Chip size="small" label={plural(summary.deviceTypes.length, "device type")} />
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.75 }}>
        {summary.latestContributionAt
          ? `Last contribution ${formatDateUtc(summary.latestContributionAt, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}`
          : "Contribution date unavailable"}
      </Typography>
    </CardActionArea>
  </Card>
);

const RecentContributorCard = ({ summary }: { summary: RecentContributor }) => (
  <Card variant="outlined" sx={{ height: "100%", bgcolor: "background.paper" }}>
    <CardActionArea
      component={RouterLink}
      to={authorPath(summary.author.githubUsername)}
      prefetch="intent"
      sx={{ height: "100%", p: 2 }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <ContributorTierAvatar profileCount={summary.profileCount} size={18}>
          <GithubAvatar
            username={summary.author.githubUsername}
            name={displayName(summary)}
            sx={{ width: 42, height: 42 }}
          />
        </ContributorTierAvatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
            {displayName(summary)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            @{summary.author.githubUsername}
          </Typography>
        </Box>
      </Stack>

      {summary.latestProfile && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {summary.latestProfile.manufacturer.fullName} {summary.latestProfile.modelId}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {summary.latestContributionAt &&
              formatDateUtc(summary.latestContributionAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            {` · ${plural(summary.recentProfileCount, "profile")} in the last 90 days`}
          </Typography>
        </Box>
      )}
    </CardActionArea>
  </Card>
);

const ActivityMetric = ({
  icon,
  value,
  label,
  onClick,
  actionLabel,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  /** Turns the tile into a button — used to open the matching directory filter. */
  onClick?: () => void;
  actionLabel?: string;
}) => {
  const actionDescriptionId = useId();

  return (
    <>
      <Paper
        variant="outlined"
        component={onClick ? ButtonBase : "div"}
        onClick={onClick}
        aria-describedby={onClick && actionLabel ? actionDescriptionId : undefined}
        sx={[
          { p: 2, height: "100%", width: "100%" },
          Boolean(onClick) && {
            textAlign: "left",
            justifyContent: "flex-start",
            transition: "border-color 150ms, background-color 150ms",
            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          },
        ]}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", width: "100%" }}>
          <Box sx={{ display: "flex", color: "primary.main" }}>{icon}</Box>
          <Box sx={{ textAlign: "left" }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {numberFormat.format(value)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </Paper>
      {onClick && actionLabel && (
        <Box
          id={actionDescriptionId}
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clipPath: "inset(50%)",
            whiteSpace: "nowrap",
          }}
        >
          {actionLabel}
        </Box>
      )}
    </>
  );
};

export const Contributors = ({ now = new Date() }: { now?: Date }) => {
  const { contributorSummaries, powerProfiles, profilesByAuthorSlug } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();
  const directoryRef = useRef<HTMLDivElement>(null);

  const search = searchParams.get(PARAM.search) ?? "";
  const sortParam = searchParams.get(PARAM.sort) as SortKey | null;
  const sort: SortKey = sortParam && SORT_KEYS.includes(sortParam) ? sortParam : DEFAULT_SORT;
  const tierParam = searchParams.get(PARAM.tier);
  const tierFilter = CONTRIBUTOR_TIERS.find((definition) => definition.tier === tierParam) ?? null;
  const activeOnly = searchParams.get(PARAM.active) === "1";
  const visibleCount = Math.max(PAGE_SIZE, Number(searchParams.get(PARAM.show)) || PAGE_SIZE);

  /**
   * Every change replaces the current history entry rather than pushing a new one: paging through
   * the directory should not bury the previous page under a stack of back steps, and replacing
   * still means a click into an author page returns to the directory exactly as it was left.
   */
  const updateParams = useCallback(
    (changes: Record<string, string | null>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null) {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          }
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  /** Any change to what is being listed starts the directory over at the first page. */
  const updateFilters = useCallback(
    (changes: Record<string, string | null>) => updateParams({ ...changes, [PARAM.show]: null }),
    [updateParams],
  );

  const recentProfiles = useMemo(
    () => powerProfiles.filter((profile) => withinRecentWindow(profile, now)),
    [now, powerProfiles],
  );

  const recentContributors = useMemo<RecentContributor[]>(() => {
    return contributorSummaries
      .map((summary) => {
        const profiles =
          profilesByAuthorSlug.get(slugifyPathSegment(summary.author.githubUsername)) ?? [];
        return {
          ...summary,
          recentProfileCount: profiles.filter((profile) => withinRecentWindow(profile, now)).length,
        };
      })
      .filter((summary) => summary.recentProfileCount > 0)
      .sort(
        (a, b) =>
          validDateTime(b.latestContributionAt) - validDateTime(a.latestContributionAt) ||
          displayName(a).localeCompare(displayName(b)),
      );
  }, [contributorSummaries, now, profilesByAuthorSlug]);

  const activeUsernames = useMemo(
    () => new Set(recentContributors.map((summary) => summary.author.githubUsername)),
    [recentContributors],
  );

  const sortedMatches = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("en-US");
    const matches = contributorSummaries.filter((summary) => {
      if (
        term &&
        !displayName(summary).toLocaleLowerCase("en-US").includes(term) &&
        !summary.author.githubUsername.toLocaleLowerCase("en-US").includes(term)
      ) {
        return false;
      }
      if (tierFilter && summary.profileCount < tierFilter.min) {
        return false;
      }
      return !activeOnly || activeUsernames.has(summary.author.githubUsername);
    });

    return [...matches].sort((a, b) => {
      if (sort === "name") return displayName(a).localeCompare(displayName(b));
      if (sort === "profiles") {
        return b.profileCount - a.profileCount || displayName(a).localeCompare(displayName(b));
      }
      return (
        validDateTime(b.latestContributionAt) - validDateTime(a.latestContributionAt) ||
        displayName(a).localeCompare(displayName(b))
      );
    });
  }, [activeOnly, activeUsernames, contributorSummaries, search, sort, tierFilter]);

  const activeContributorCount = recentContributors.length;
  const visibleContributors = sortedMatches.slice(0, visibleCount);
  const contributedProfileCount = powerProfiles.filter((profile) =>
    profile.authors.some((author) => Boolean(author.githubUsername)),
  ).length;

  const structuredData: StructuredDataNode[] = [
    breadcrumbStructuredData([{ label: "Home", to: "/" }, { label: "Contributors" }]),
    {
      "@type": "CollectionPage",
      name: "Powercalc contributors",
      description:
        "The community members who contribute measured device profiles to the Powercalc library.",
      url: `${SITE_URL}/contributors`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: contributorSummaries.length,
        itemListElement: contributorSummaries
          .slice()
          .sort((a, b) => displayName(a).localeCompare(displayName(b)))
          .slice(0, MAX_ITEM_LIST_ENTRIES)
          .map((summary, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: displayName(summary),
            url: `${SITE_URL}${authorPath(summary.author.githubUsername)}`,
          })),
      },
    },
  ];

  return (
    <>
      <StructuredData graph={structuredData} />
      <PageBreadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Contributors" }]}
        includeStructuredData={false}
      />

      <Paper
        component="section"
        elevation={0}
        sx={{
          p: { xs: 2, sm: 4 },
          mb: { xs: 3, sm: 4 },
          border: 1,
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.action.hover}, transparent 70%)`,
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, fontSize: { xs: "2.25rem", sm: "3rem" } }}
            >
              Contributors
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
              Powercalc grows through community measurements. Meet the people expanding the device
              library and see who has contributed recently.
            </Typography>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<LibraryAddOutlinedIcon />}
                href="https://docs.powercalc.nl/contributing/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute a profile
              </Button>
              <Button component={RouterLink} to="/statistics/top-contributors" variant="outlined">
                View top contributors
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Chip
                icon={<GroupOutlinedIcon />}
                label={plural(contributorSummaries.length, "contributor")}
              />
              <Chip
                icon={<LibraryAddOutlinedIcon />}
                label={plural(contributedProfileCount, "profile")}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Box component="section" aria-labelledby="recent-activity-heading" sx={{ mb: 5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ alignItems: { sm: "end" }, justifyContent: "space-between", mb: 2 }}
        >
          <Box>
            <Typography
              id="recent-activity-heading"
              component="h2"
              variant="h4"
              sx={{ fontWeight: 750 }}
            >
              Recent activity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              New profiles and active contributors during the last 90 days.
            </Typography>
          </Box>
          <Link component={RouterLink} to="/statistics/weekly-contributions" prefetch="intent">
            View weekly contribution trends
          </Link>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6 }}>
            <ActivityMetric
              icon={<TrendingUpOutlinedIcon />}
              value={recentProfiles.length}
              label="profiles added"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <ActivityMetric
              icon={<CalendarMonthOutlinedIcon />}
              value={activeContributorCount}
              label="active contributors"
              actionLabel="show them all in the directory"
              onClick={
                activeContributorCount > 0
                  ? () => {
                      updateFilters({ [PARAM.active]: "1", [PARAM.sort]: "recent" });
                      // Optional call: jsdom and older engines do not implement it.
                      directoryRef.current?.scrollIntoView?.({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  : undefined
              }
            />
          </Grid>
        </Grid>

        {recentContributors.length > 0 ? (
          <Grid container spacing={2} data-testid="recent-contributor-list">
            {recentContributors.slice(0, RECENT_CONTRIBUTOR_COUNT).map((summary) => (
              <Grid key={summary.author.githubUsername} size={{ xs: 12, sm: 6, md: 4 }}>
                <RecentContributorCard summary={summary} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No new profiles were recorded during this period.
            </Typography>
          </Paper>
        )}
      </Box>

      <Box component="section" aria-labelledby="all-contributors-heading">
        <Typography
          id="all-contributors-heading"
          component="h2"
          variant="h4"
          sx={{ fontWeight: 750 }}
        >
          All contributors
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
          Search the community, or browse by tier, profile count, recent activity, or name.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, mb: 1.5 }}
        >
          <TextField
            value={search}
            onChange={(event) => updateFilters({ [PARAM.search]: event.target.value || null })}
            aria-label="Search contributors"
            placeholder="Search contributors"
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
            sx={{ maxWidth: { sm: 360 } }}
          />
          <FormControl size="small" sx={{ minWidth: { sm: 190 } }}>
            <InputLabel id="contributor-sort-label">Sort by</InputLabel>
            <Select
              labelId="contributor-sort-label"
              value={sort}
              label="Sort by"
              onChange={(event) =>
                updateFilters({
                  [PARAM.sort]: event.target.value === DEFAULT_SORT ? null : event.target.value,
                })
              }
            >
              <MenuItem value="profiles">Most profiles</MenuItem>
              <MenuItem value="recent">Recently active</MenuItem>
              <MenuItem value="name">Name A–Z</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
            <InputLabel id="contributor-tier-label">Tier</InputLabel>
            <Select
              labelId="contributor-tier-label"
              value={tierFilter?.tier ?? "all"}
              label="Tier"
              onChange={(event) =>
                updateFilters({
                  [PARAM.tier]: event.target.value === "all" ? null : event.target.value,
                })
              }
            >
              <MenuItem value="all">All tiers</MenuItem>
              {CONTRIBUTOR_TIERS.map((definition) => (
                <MenuItem key={definition.tier} value={definition.tier}>
                  {definition.tier}
                  {definition === CONTRIBUTOR_TIERS[0] ? "" : " and up"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap", mb: 2 }}
        >
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {plural(sortedMatches.length, "contributor")}
          </Typography>
          {activeOnly && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Active in the last ${RECENT_ACTIVITY_DAYS} days`}
              onDelete={() => updateFilters({ [PARAM.active]: null })}
            />
          )}
        </Stack>

        {sortedMatches.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
            <Typography component="h3" variant="h6">
              No contributors found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              No names or GitHub handles match &quot;{search}&quot;.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2} ref={directoryRef} data-testid="contributor-directory">
              {visibleContributors.map((summary) => (
                <Grid key={summary.author.githubUsername} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ContributorCard summary={summary} />
                </Grid>
              ))}
            </Grid>

            {visibleCount < sortedMatches.length && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => updateParams({ [PARAM.show]: String(visibleCount + PAGE_SIZE) })}
                >
                  Load more ({numberFormat.format(sortedMatches.length - visibleCount)} to go)
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
};
