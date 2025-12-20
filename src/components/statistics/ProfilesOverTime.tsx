import React, { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useLibrary } from "../../context/LibraryContext";
import { Header } from "../Header";

enum TimePeriod {
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
}

type ChartPoint = {
  date: string;
  count: number;
};

const addPeriod = (date: Date, period: TimePeriod): Date => {
  const next = new Date(date.getTime());

  switch (period) {
    case TimePeriod.Day:
      next.setDate(next.getDate() + 1);
      break;
    case TimePeriod.Week:
      next.setDate(next.getDate() + 7);
      break;
    case TimePeriod.Month:
      next.setMonth(next.getMonth() + 1);
      break;
    case TimePeriod.Year:
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

const toIsoDate = (date: Date): string => {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (Number.isNaN(normalized.getTime())) {
    return "";
  }

  return normalized.toISOString().split("T")[0]; // YYYY-MM-DD
};

const formatDateKey = (date: Date, period: TimePeriod): string => {
  switch (period) {
    case TimePeriod.Day:
      return toIsoDate(date);

    case TimePeriod.Week: {
      const firstDayOfWeek = new Date(date.getTime());
      const day = firstDayOfWeek.getDay();
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() - day);
      return toIsoDate(firstDayOfWeek);
    }

    case TimePeriod.Month: {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    case TimePeriod.Year: {
      return String(date.getFullYear());
    }

    default:
      return "";
  }
};

const ProfilesOverTime: React.FC = () => {
  const { powerProfiles, loading, error, total: totalProfiles } = useLibrary();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.Month);

  const chartData: ChartPoint[] = useMemo(() => {
    if (loading || error || powerProfiles.length === 0) {
      return [];
    }

    const sortedProfiles = [...powerProfiles].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const earliestDate = sortedProfiles[0].createdAt;
    const latestDate = new Date();

    const profilesByDate: Record<string, number> = {};
    let currentDate = new Date(earliestDate.getTime());

    while (currentDate <= latestDate) {
      const dateKey = formatDateKey(currentDate, timePeriod);
      if (dateKey) {
        profilesByDate[dateKey] = 0;
      }
      currentDate = addPeriod(currentDate, timePeriod);
    }

    for (const profile of powerProfiles) {
      const dateKey = formatDateKey(profile.createdAt, timePeriod);
      if (!dateKey) continue; // skip invalid createdAt
      profilesByDate[dateKey] = (profilesByDate[dateKey] || 0) + 1;
    }

    const data: ChartPoint[] = Object.entries(profilesByDate).map(([date, count]) => ({
      date,
      count,
    }));

    data.sort((a, b) => {
      if (timePeriod === TimePeriod.Month) {
        const [aYearStr, aMonthStr] = a.date.split("-");
        const [bYearStr, bMonthStr] = b.date.split("-");
        const aYear = Number(aYearStr);
        const aMonth = Number(aMonthStr);
        const bYear = Number(bYearStr);
        const bMonth = Number(bMonthStr);
        return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
      }

      if (timePeriod === TimePeriod.Year) {
        return Number(a.date) - Number(b.date);
      }

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return data;
  }, [powerProfiles, loading, error, timePeriod]);

  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    setTimePeriod(event.target.value as TimePeriod);
  };

  const formatXAxisTick = (value: string): string => {
    if (timePeriod === TimePeriod.Month) {
      const [yearStr, monthStr] = value.split("-");
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1;

      const date = new Date(Date.UTC(year, monthIndex, 1));

      // Guard against invalid dates -> avoids "RangeError: Invalid time value"
      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
    }

    if (timePeriod === TimePeriod.Year) {
      return value;
    }

    // Day / Week: show raw YYYY-MM-DD
    return value;
  };

  return (
      <>
        <Header total={totalProfiles} />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Power Profiles Created Over Time
            </Typography>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id="time-period-label">Time Period</InputLabel>
              <Select
                  labelId="time-period-label"
                  value={timePeriod}
                  label="Time Period"
                  onChange={handleTimePeriodChange}
              >
                <MenuItem value={TimePeriod.Day}>Daily</MenuItem>
                <MenuItem value={TimePeriod.Week}>Weekly</MenuItem>
                <MenuItem value={TimePeriod.Month}>Monthly</MenuItem>
                <MenuItem value={TimePeriod.Year}>Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading && <Typography>Loading...</Typography>}
          {error && <Typography color="error">{error}</Typography>}

          {!loading && !error && chartData.length > 0 && (
              <Paper sx={{ p: 2, height: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxisTick}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                    />
                    <YAxis />
                    <Tooltip
                        formatter={(value) => [`${value} profiles`, "Count"]}
                        labelFormatter={(label) => `Created in: ${formatXAxisTick(label)}`}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="count"
                        name="Profiles Created"
                        stroke="#7986cb"
                        activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
          )}

          {!loading && !error && chartData.length === 0 && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                No data available yet.
              </Typography>
          )}

          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Based on data from {totalProfiles} power profiles in the library.
            </Typography>
          </Box>
        </Container>
      </>
  );
};

export default ProfilesOverTime;
