import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useMemo } from "react";

import type { PowerProfile } from "../types/PowerProfile";

type Props = {
  profiles: PowerProfile[];
};

type Bucket = { start: Date; count: number };

/** Safety net for a very old first contribution: older months are dropped rather than squeezed. */
const MAX_MONTHS = 120;
/** How many x labels fit without overlapping, per screen size. */
const MAX_TICK_LABELS = { xs: 3, sm: 6 };

const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();

const monthLabel = (date: Date) =>
  `${date.toLocaleDateString("en-US", { month: "short" })} '${String(date.getFullYear()).slice(-2)}`;

/** Buckets the profiles per month, including the months without any contribution. */
const buildBuckets = (profiles: PowerProfile[]): Bucket[] => {
  if (profiles.length === 0) return [];

  const counts = new Map<number, number>();
  let first = profiles[0].createdAt;
  let last = profiles[0].createdAt;

  for (const profile of profiles) {
    const createdAt = profile.createdAt;
    counts.set(monthKey(createdAt), (counts.get(monthKey(createdAt)) ?? 0) + 1);
    if (createdAt < first) first = createdAt;
    if (createdAt > last) last = createdAt;
  }

  const buckets: Bucket[] = [];
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  const end = new Date(last.getFullYear(), last.getMonth(), 1);
  while (cursor <= end) {
    buckets.push({
      start: new Date(cursor),
      count: counts.get(monthKey(cursor)) ?? 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets.slice(-MAX_MONTHS);
};

export const AuthorContributionsChart = ({ profiles }: Props) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const buckets = useMemo(() => buildBuckets(profiles), [profiles]);

  if (buckets.length === 0) return null;

  if (buckets.length === 1) {
    const bucket = buckets[0];
    return (
      <Paper
        component="section"
        variant="outlined"
        sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
      >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 2 }}>
          <AutoGraphIcon color="primary" />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
            Contribution activity
          </Typography>
        </Stack>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <CalendarMonthIcon color="primary" />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              First contribution in{" "}
              {bucket.start.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bucket.count} profile{bucket.count === 1 ? "" : "s"} contributed
              that month
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  const maxLabels = isSmallScreen ? MAX_TICK_LABELS.xs : MAX_TICK_LABELS.sm;
  const labelStep = Math.ceil(buckets.length / maxLabels);

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
    >
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <AutoGraphIcon color="primary" />
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
            Contribution activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Profiles added to the library per month
          </Typography>
        </Box>
      </Stack>
      <BarChart
        height={190}
        dataset={buckets.map((bucket) => ({
          ...bucket,
          label: monthLabel(bucket.start),
        }))}
        margin={{ left: 0, right: 16, top: 20, bottom: 0 }}
        hideLegend
        borderRadius={4}
        xAxis={[
          {
            scaleType: "band",
            dataKey: "label",
            disableTicks: true,
            categoryGapRatio: 0.25,
            tickLabelInterval: (_value, index) =>
              (buckets.length - 1 - index) % labelStep === 0,
          },
        ]}
        yAxis={[
          { width: 32, tickNumber: 3, disableLine: true, disableTicks: true },
        ]}
        series={[
          {
            dataKey: "count",
            label: "Contributions",
            color: theme.palette.primary.main,
          },
        ]}
        grid={{ horizontal: true }}
      />
    </Paper>
  );
};
