import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useState } from "react";

import type { TimeseriesResponse } from "../../../api/analytics.api";
import { fetchTimeseries } from "../../../api/analytics.api";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { TimeSeriesChart } from "./TimeSeriesChart";

const transformTimeseriesForLineChart = (
    response: TimeseriesResponse
): { date: string; count: number }[] => {
  // Find the series with the name matching the metric in the query
  const series = response.series.find(s => s.name === response.query.metric);

  if (!series) {
    return [];
  }

  return series.points.map(point => ({
    date: point.ts,
    count: point.value
  }));
};

interface MetricOption {
  value: string;
  label: string;
  description?: string;
}

const METRIC_OPTIONS : MetricOption[] = [
  { value: "optin_date", label: "Opt-in Date", description: "Number of installations that have opted in to analytics." },
  { value: "install_date", label: "Install Date", description: "Number of new installations." },
  { value: "sensors", label: "Sensors", description: "Number of sensors created." },
];


export const TimeSeries = () => {
  const [selectedGrouping, setSelectedGrouping] = useState<string>("day");
  const [selectedMetric, setSelectedMetric] = useState<string>("install_date");

  const handleGroupingChange = (event: SelectChangeEvent) => {
    setSelectedGrouping(event.target.value);
  };

  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value);
  };

  const { data } = useSuspenseQuery<TimeseriesResponse>({
    queryKey: ["optinsTimeseries", selectedMetric, selectedGrouping],
    queryFn: async () => {
      return fetchTimeseries(selectedMetric, selectedGrouping, "UTC", new Date("2024-10-01"));
    },
  });

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return transformTimeseriesForLineChart(data);
  }, [data]);

  const groupingOptions = [
    { value: "day", label: "Group by Day" },
    { value: "month", label: "Group by Month" },
  ];

  const filterControls = (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel id="metric-select-label">Metric</InputLabel>
        <Select
          labelId="metric-select-label"
          value={selectedMetric}
          label="Metric"
          onChange={handleMetricChange}
        >
          {METRIC_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel id="grouping-select-label">Grouping</InputLabel>
        <Select
          labelId="grouping-select-label"
          value={selectedGrouping}
          label="Grouping"
          onChange={handleGroupingChange}
        >
          {groupingOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );

  const metricOption = METRIC_OPTIONS.find(option => option.value === selectedMetric);
  if (!metricOption) {
    return <Box>Invalid metric selected.</Box>;
  }

  return (
    <>
      <AnalyticsHeader
        title={metricOption.label}
        description={metricOption.description ?? ""}
        rightContent={filterControls}
      />

      <Box sx={{ mt: 4, mb: 4 }}>
        {chartData.length > 0 ? (
          <TimeSeriesChart
              series={chartData}
              label={metricOption.label}
          />
        ) : (
          <Box sx={{ textAlign: "center", p: 4 }}>Loading data...</Box>
        )}
      </Box>
    </>
  );
};
