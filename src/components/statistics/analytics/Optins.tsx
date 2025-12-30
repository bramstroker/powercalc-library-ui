import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Box } from "@mui/material";

import { fetchTimeseries, TimeseriesResponse } from "../../../api/analytics.api";
import AnalyticsHeader from "./AnalyticsHeader";
import { OptinsChart } from "./OptinsChart";

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


const Optins: React.FC = () => {
  const { data } = useSuspenseQuery<TimeseriesResponse>({
    queryKey: ["optinsTimeseries"],
    queryFn: async () => {
      // Default parameters: metric="optins", bucket="day", timezone="UTC", 
      // from="2023-01-01", to=current date
      return fetchTimeseries();
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
          <OptinsChart series={chartData} />
        ) : (
          <Box sx={{ textAlign: "center", p: 4 }}>Loading data...</Box>
        )}
      </Box>
    </>
  );
};

export default Optins;