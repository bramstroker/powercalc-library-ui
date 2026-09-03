import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Box, ButtonBase, Link, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { ReactNode } from "react";
import { useId } from "react";
import { Link as RouterLink } from "react-router";

import { visuallyHiddenSx } from "../../../utils/accessibility";
import { numberFormat } from "../../../utils/formatters";

import { RecentContributorCard } from "./ContributorCards";
import type { RecentContributor } from "./useContributorsViewModel";
import { RECENT_ACTIVITY_DAYS } from "./useContributorsViewModel";

const RECENT_CONTRIBUTOR_COUNT = 6;

const ActivityMetric = ({
  icon,
  value,
  label,
  onClick,
  actionLabel,
}: {
  icon: ReactNode;
  value: number;
  label: string;
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
        <Box id={actionDescriptionId} sx={visuallyHiddenSx}>
          {actionLabel}
        </Box>
      )}
    </>
  );
};

export const ContributorActivity = ({
  recentProfileCount,
  recentContributorCount,
  recentContributors,
  onShowActiveContributors,
}: {
  recentProfileCount: number;
  recentContributorCount: number;
  recentContributors: RecentContributor[];
  onShowActiveContributors: () => void;
}) => (
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
          New profiles and active contributors during the last {RECENT_ACTIVITY_DAYS} days.
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
          value={recentProfileCount}
          label="profiles added"
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <ActivityMetric
          icon={<CalendarMonthOutlinedIcon />}
          value={recentContributorCount}
          label="active contributors"
          actionLabel="show them all in the directory"
          onClick={recentContributorCount > 0 ? onShowActiveContributors : undefined}
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
);
