import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Box, ButtonGroup, Button, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
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
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Default start date is 3 months ago
  const defaultStartDate = new Date();
  defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleGroupingChange = (event: SelectChangeEvent) => {
    setSelectedGrouping(event.target.value);
  };

  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value);
  };

  const handleChartTypeChange = (newChartType: 'line' | 'bar') => {
    setChartType(newChartType);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(event.target.value));
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(new Date(event.target.value));
  };

  const { data } = useSuspenseQuery<TimeseriesResponse>({
    queryKey: ["timeseries", selectedMetric, selectedGrouping, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
    queryFn: async () => {
      return fetchTimeseries(selectedMetric, selectedGrouping, "UTC", startDate, endDate);
    },
  });

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return transformTimeseriesForLineChart(data);
  }, [data]);

  const groupingOptions = [
    { value: "day", label: "Day" },
    { value: "month", label: "Month" },
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

      <FormControl sx={{ minWidth: 100 }}>
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
        value={startDate.toISOString().split('T')[0]}
        onChange={handleStartDateChange}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ width: 150 }}
      />

      <TextField
        label="To"
        type="date"
        value={endDate.toISOString().split('T')[0]}
        onChange={handleEndDateChange}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ width: 150 }}
      />

      <ButtonGroup variant="outlined" aria-label="Chart type selection">
        <Button 
          onClick={() => handleChartTypeChange('line')}
          variant={chartType === 'line' ? 'contained' : 'outlined'}
          aria-label="Line chart"
        >
          <ShowChartIcon />
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button 
          onClick={() => handleChartTypeChange('bar')}
          variant={chartType === 'bar' ? 'contained' : 'outlined'}
          aria-label="Bar chart"
        >
          <BarChartIcon />
        </Button>
      </ButtonGroup>
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
              chartType={chartType}
              grouping={selectedGrouping}
          />
        ) : (
          <Box sx={{ textAlign: "center", p: 4 }}>Loading data...</Box>
        )}
      </Box>
    </>
  );
};
