import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useState } from "react";

import type { TimeseriesResponse } from "../../../api/analytics.api";
import { fetchTimeseries } from "../../../api/analytics.api";

import { AnalyticsHeader } from "./AnalyticsHeader";
import type { ChartType } from "./TimeSeriesChart";
import { Grouping, TimeSeriesChart } from "./TimeSeriesChart";

const transformTimeseriesForLineChart = (
  response: TimeseriesResponse,
): { date: string; count: number }[] => {
  // Find the series with the name matching the metric in the query
  const series = response.series.find((s) => s.name === response.query.metric);

  if (!series) {
    return [];
  }

  return series.points.map((point) => ({
    date: point.ts,
    count: point.value,
  }));
};

interface MetricOption {
  value: string;
  label: string;
  description?: string;
}

const METRIC_OPTIONS: MetricOption[] = [
  {
    value: "optin_date",
    label: "Opt-in Date",
    description: "Number of installations that have opted in to analytics.",
  },
  { value: "install_date", label: "Install Date", description: "Number of new installations." },
  { value: "sensors", label: "Sensors", description: "Number of sensors created." },
];

export const TimeSeries = () => {
  const [selectedGrouping, setSelectedGrouping] = useState<Grouping>(Grouping.Day);
  const [selectedMetric, setSelectedMetric] = useState<string>("install_date");
  const [chartType, setChartType] = useState<ChartType>("line");

  // Default start date is 3 months ago
  const defaultStartDate = new Date();
  defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleGroupingChange = (event: SelectChangeEvent) => {
    setSelectedGrouping(event.target.value as Grouping);
  };

  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value);
  };

  const handleChartTypeChange = (newChartType: ChartType) => {
    setChartType(newChartType);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    const next = new Date(`${event.target.value}T00:00:00Z`);
    if (!Number.isNaN(next.valueOf()) && next <= endDate) setStartDate(next);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    const next = new Date(`${event.target.value}T00:00:00Z`);
    if (!Number.isNaN(next.valueOf()) && next >= startDate) setEndDate(next);
  };

  const { data } = useSuspenseQuery<TimeseriesResponse>({
    queryKey: [
      "timeseries",
      selectedMetric,
      selectedGrouping,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ],
    queryFn: ({ signal }) =>
      fetchTimeseries(selectedMetric, selectedGrouping, "UTC", startDate, endDate, signal),
  });

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return transformTimeseriesForLineChart(data);
  }, [data]);

  const groupingOptions = [
    { value: Grouping.Day, label: "Day" },
    { value: Grouping.Week, label: "Week" },
    { value: Grouping.Month, label: "Month" },
  ];

  const filterControls = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "150px 110px 150px 150px auto",
        },
        gap: 2,
        width: { xs: "100%", lg: "auto" },
        alignItems: "start",
      }}
    >
      <FormControl sx={{ minWidth: 0 }}>
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

      <FormControl sx={{ minWidth: 0 }}>
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

      <TextField
        label="From"
        type="date"
        value={startDate.toISOString().split("T")[0]}
        onChange={handleStartDateChange}
        slotProps={{
          htmlInput: { max: endDate.toISOString().split("T")[0] },
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        label="To"
        type="date"
        value={endDate.toISOString().split("T")[0]}
        onChange={handleEndDateChange}
        slotProps={{
          htmlInput: { min: startDate.toISOString().split("T")[0] },
          inputLabel: { shrink: true },
        }}
      />

      <ButtonGroup
        variant="outlined"
        aria-label="Chart type selection"
        sx={{ width: { xs: "100%", lg: "auto" }, "& .MuiButton-root": { flex: 1 } }}
      >
        <Button
          onClick={() => handleChartTypeChange("line")}
          variant={chartType === "line" ? "contained" : "outlined"}
          aria-label="Line chart"
        >
          <ShowChartIcon />
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          onClick={() => handleChartTypeChange("bar")}
          variant={chartType === "bar" ? "contained" : "outlined"}
          aria-label="Bar chart"
        >
          <BarChartIcon />
        </Button>
      </ButtonGroup>
    </Box>
  );

  const metricOption = METRIC_OPTIONS.find((option) => option.value === selectedMetric);
  if (!metricOption) {
    return <Box>Invalid metric selected.</Box>;
  }

  return (
    <>
      <AnalyticsHeader
        title={metricOption.label}
        description={metricOption.description ?? ""}
        breadcrumbItems={[
          { label: "Home", to: "/" },
          { label: "Analytics", to: "/analytics" },
          { label: "Usage over time" },
        ]}
        filterSection={filterControls}
      />

      <Box sx={{ mt: 4, mb: 4 }}>
        {chartData.length > 0 ? (
          <TimeSeriesChart
            series={chartData}
            label={metricOption.label}
            chartType={chartType}
            grouping={selectedGrouping}
          />
        ) : (
          <Box role="status" sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            No data available for the selected period.
          </Box>
        )}
      </Box>
    </>
  );
};
