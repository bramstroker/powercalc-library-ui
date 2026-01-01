import { Box } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

import type { TimeseriesResponse } from "../../../api/analytics.api";
import { fetchTimeseries } from "../../../api/analytics.api";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { TimeSeriesChart } from "./TimeSeriesChart";

/**
 * Transform TimeseriesResponse to the format expected by OptinsChart
 */
const transformTimeseriesForLineChart = (
    response: TimeseriesResponse
): { date: string; count: number }[] => {
  // Find the series with the name matching the metric in the query
  const series = response.series.find(s => s.name === response.query.metric);

  if (!series) {
    return [];
  }

  // Transform the points to the format expected by OptinsChart
  return series.points.map(point => ({
    date: point.ts,
    count: point.value
  }));
};


export const Optins = () => {
  const { data } = useSuspenseQuery<TimeseriesResponse>({
    queryKey: ["optinsTimeseries"],
    queryFn: async () => {
      // Default parameters: metric="optins", bucket="day", timezone="UTC", 
      // from="2023-01-01", to=current date
      return fetchTimeseries("install_date", "day", "UTC", new Date("2025-01-01"));
    },
  });

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return transformTimeseriesForLineChart(data);
  }, [data]);

  return (
    <>
      <AnalyticsHeader
        title="Opt-ins Over Time"
        description="Chart showing the number of installations that have opted in to analytics over time."
      />

      <Box sx={{ mt: 4, mb: 4 }}>
        {chartData.length > 0 ? (
          <TimeSeriesChart series={chartData} />
        ) : (
          <Box sx={{ textAlign: "center", p: 4 }}>Loading data...</Box>
        )}
      </Box>
    </>
  );
};

