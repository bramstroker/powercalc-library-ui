import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  Box,
  Button,
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
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";

import { SITE_URL } from "../config/site";
import { useLibrary } from "../context/LibraryContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { MAX_ITEM_LIST_ENTRIES, type StructuredData as StructuredDataNode } from "../seo/meta";
import { StructuredData } from "../seo/StructuredData";
import type { ContributorSummary, PowerProfile } from "../types/PowerProfile";
import { formatDateUtc } from "../utils/dateFormat";
import { daysSince } from "../utils/recency";
import { authorPath, slugifyPathSegment } from "../utils/urlSlugs.mjs";

import { GithubAvatar } from "./GithubAvatar";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

const RECENT_ACTIVITY_DAYS = 90;
const PAGE_SIZE = 24;
const RECENT_CONTRIBUTOR_COUNT = 6;
const numberFormat = new Intl.NumberFormat("en-US");

type SortKey = "recent" | "profiles" | "name";

type RecentContributor = ContributorSummary & {
  recentProfileCount: number;
};

const displayName = ({ author }: ContributorSummary) =>
  author.name.trim() || author.githubUsername;

const validDateTime = (date: Date | null) => date?.getTime() ?? Number.NEGATIVE_INFINITY;

const plural = (count: number, singular: string, pluralValue = `${singular}s`) =>
  `${numberFormat.format(count)} ${count === 1 ? singular : pluralValue}`;

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
        <GithubAvatar
          username={summary.author.githubUsername}
          name={displayName(summary)}
          sx={{ width: 48, height: 48 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
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
        <GithubAvatar
          username={summary.author.githubUsername}
          name={displayName(summary)}
          sx={{ width: 42, height: 42 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
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
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <Paper
    variant="outlined"
    aria-label={`${numberFormat.format(value)} ${label}`}
    sx={{ p: 2, height: "100%" }}
  >
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Box sx={{ display: "flex", color: "primary.main" }}>{icon}</Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
          {numberFormat.format(value)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

export const Contributors = ({ now = new Date() }: { now?: Date }) => {
  const { contributorSummaries, powerProfiles, profilesByAuthorSlug } = useLibrary();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  usePageMeta({
    title: "Contributors",
    description:
      "Meet the people expanding the Powercalc profile library and explore their latest contributions.",
  });

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

  const sortedMatches = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("en-US");
    const matches = term
      ? contributorSummaries.filter(
          (summary) =>
            displayName(summary).toLocaleLowerCase("en-US").includes(term) ||
            summary.author.githubUsername.toLocaleLowerCase("en-US").includes(term),
        )
      : contributorSummaries;

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
  }, [contributorSummaries, search, sort]);

  const activeContributorCount = recentContributors.length;
  const visibleContributors = sortedMatches.slice(0, visibleCount);
  const contributedProfileCount = powerProfiles.filter((profile) =>
    profile.authors.some((author) => Boolean(author.githubUsername)),
  ).length;

  const structuredData: StructuredDataNode[] = [
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
      <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contributors" }]} />

      <Paper
        component="section"
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          mb: 4,
          border: 1,
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.action.hover}, transparent 70%)`,
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
              Contributors
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
              Powercalc grows through community measurements. Meet the people expanding the device
              library and see who has contributed recently.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
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
            <Typography id="recent-activity-heading" variant="h4" sx={{ fontWeight: 750 }}>
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <ActivityMetric
              icon={<TrendingUpOutlinedIcon />}
              value={recentProfiles.length}
              label="profiles added"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ActivityMetric
              icon={<CalendarMonthOutlinedIcon />}
              value={activeContributorCount}
              label="active contributors"
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
        <Typography id="all-contributors-heading" variant="h4" sx={{ fontWeight: 750 }}>
          All contributors
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
          Search the community or browse by recent activity, profile count, or name.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, mb: 1.5 }}
        >
          <TextField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
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
              onChange={(event) => {
                setSort(event.target.value as SortKey);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <MenuItem value="recent">Recently active</MenuItem>
              <MenuItem value="profiles">Most profiles</MenuItem>
              <MenuItem value="name">Name A–Z</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} aria-live="polite">
          {plural(sortedMatches.length, "contributor")}
        </Typography>

        {sortedMatches.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No contributors found</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              No names or GitHub handles match &quot;{search}&quot;.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2} data-testid="contributor-directory">
              {visibleContributors.map((summary) => (
                <Grid
                  key={summary.author.githubUsername}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                >
                  <ContributorCard summary={summary} />
                </Grid>
              ))}
            </Grid>

            {visibleCount < sortedMatches.length && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Load more contributors
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
};
