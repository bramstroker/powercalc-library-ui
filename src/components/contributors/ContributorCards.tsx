import { Box, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import type { ContributorSummary } from "../../types/PowerProfile";
import { formatDateUtc } from "../../utils/dateFormat";
import { plural } from "../../utils/plural";
import { authorPath } from "../../utils/urlSlugs.mjs";
import { ContributorTierAvatar } from "../ContributorTierBadge";
import { GithubAvatar } from "../GithubAvatar";

import type { RecentContributor } from "./useContributorsViewModel";
import { contributorDisplayName, RECENT_ACTIVITY_DAYS } from "./useContributorsViewModel";

export const ContributorCard = ({ summary }: { summary: ContributorSummary }) => (
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
            name={contributorDisplayName(summary)}
            sx={{ width: 48, height: 48 }}
          />
        </ContributorTierAvatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {contributorDisplayName(summary)}
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

export const RecentContributorCard = ({ summary }: { summary: RecentContributor }) => (
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
            name={contributorDisplayName(summary)}
            sx={{ width: 42, height: 42 }}
          />
        </ContributorTierAvatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
            {contributorDisplayName(summary)}
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
            {` · ${plural(summary.recentProfileCount, "profile")} in the last ${RECENT_ACTIVITY_DAYS} days`}
          </Typography>
        </Box>
      )}
    </CardActionArea>
  </Card>
);
