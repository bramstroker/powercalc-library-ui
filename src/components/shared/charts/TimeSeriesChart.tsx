import { Box, Card, CardContent } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import * as React from "react";

import { visuallyHiddenSx } from "../../../utils/accessibility";

export enum Grouping {
  Day = "day",
  Week = "week",
  Month = "month",
}

export type ChartType = "line" | "bar";

type Props = {
  series: Point[];
  label: string;
  chartType?: ChartType;
  grouping?: Grouping;
  height?: number;
};

type Point = { date: string; count: number };

// Helper function to fill in missing days in the time series data
const fillMissingDays = (series: Point[]): Point[] => {
  if (series.length <= 1) return series;

  // Sort the series by date
  const sortedSeries = [...series].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const result: Point[] = [];
  const firstDate = new Date(sortedSeries[0].date);
  const lastDate = new Date(sortedSeries[sortedSeries.length - 1].date);

  // Create a map of existing dates for quick lookup
  const dateMap = new Map<string, number>();
  sortedSeries.forEach((point) => {
    dateMap.set(point.date, point.count);
  });

  // Generate all dates between first and last
  const currentDate = new Date(firstDate);
  while (currentDate <= lastDate) {
    const dateString = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // If the date exists in the original data, use that count, otherwise use 0
    const count = dateMap.has(dateString) ? dateMap.get(dateString)! : 0;
    result.push({ date: dateString, count });

    // Move to the next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return result;
};

const getISOWeekYear = (date: Date): { week: number; year: number } => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Set to nearest Thursday: current date + 4 - current day number
  // (Sunday = 0 → 7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return {
    week,
    year: d.getUTCFullYear(),
  };
};

export const TimeSeriesChart = ({
  series,
  label,
  chartType = "line",
  grouping = Grouping.Day,
  height = 300,
}: Props) => {
  // Fill in missing days in the series data only when grouping is by day
  const completeSeriesData = React.useMemo(
    () => (grouping === Grouping.Day ? fillMissingDays(series) : series),
    [series, grouping],
  );

  // Keep every bucket. Sampling a bar series silently changes its meaning by dropping days and
  // their counts; dense ranges are still accurate and users can switch to the line view.
  const chartData = completeSeriesData;

  const x = React.useMemo(
    () => chartData.map((p) => new Date(p.date)), // "YYYY-MM-DD" -> Date
    [chartData],
  );

  const y = React.useMemo(() => chartData.map((p) => p.count), [chartData]);

  // Create dataset for bar chart
  const dataset = React.useMemo(
    () =>
      chartData.map((p) => ({
        date: new Date(p.date),
        count: p.count,
      })),
    [chartData],
  );

  const xLabelFormatter = (d: Date) => {
    if (grouping === Grouping.Week) {
      const { week, year } = getISOWeekYear(d);
      return `W${week} ${year}`;
    }
    if (grouping === Grouping.Month) {
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  return (
    <Card
      variant="elevation"
      sx={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}
    >
      <CardContent>
        {chartType === "line" ? (
          <LineChart
            height={height}
            xAxis={[
              {
                data: x,
                scaleType: "time",
                valueFormatter: xLabelFormatter,
              },
            ]}
            series={[
              {
                data: y,
                label: label,
                showMark: false,
              },
            ]}
            grid={{ vertical: true, horizontal: true }}
          />
        ) : (
          <BarChart
            height={height}
            dataset={dataset}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "date",
                valueFormatter: xLabelFormatter,
              },
            ]}
            series={[
              {
                dataKey: "count",
                label: label,
              },
            ]}
            grid={{ vertical: true, horizontal: true }}
          />
        )}
        <Box component="table" sx={visuallyHiddenSx}>
          <caption>{label} over time</caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>{label}</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((point) => (
              <tr key={point.date}>
                <th scope="row">{point.date}</th>
                <td>{point.count}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </CardContent>
    </Card>
  );
};
