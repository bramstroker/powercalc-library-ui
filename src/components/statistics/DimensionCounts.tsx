import React, { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { useQuery } from "@tanstack/react-query";

import { fetchDimensionCounts, DimensionCount } from "../../api/library.api";
import { Header } from "../Header";

type MetricKey = "count" | "installation_count";

function groupByDimension(data: DimensionCount[]): Record<string, DimensionCount[]> {
  return data.reduce<Record<string, DimensionCount[]>>((acc, item) => {
    (acc[item.dimension] ??= []).push(item);
    return acc;
  }, {});
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

const DimensionCounts: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("count");

  const { data = [], isLoading, error } = useQuery<DimensionCount[], unknown>({
    queryKey: ["dimensionCounts"],
    queryFn: fetchDimensionCounts,
  });

  const handleMetricChange = (event: SelectChangeEvent<MetricKey>) => {
    setSelectedMetric(event.target.value as MetricKey);
  };

  const { groupedData, dimensions } = useMemo(() => {
    const grouped = groupByDimension(data);
    const dims = Object.keys(grouped).sort();
    return { groupedData: grouped, dimensions: dims };
  }, [data]);

  if (isLoading) {
    return (
        <>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
              <CircularProgress />
            </Box>
          </Container>
        </>
    );
  }

  if (error) {
    return (
        <>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography color="error">
              Error loading dimension counts: {getErrorMessage(error)}
            </Typography>
          </Container>
        </>
    );
  }

  return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4" component="h1">
              PowerCalc Statistics
            </Typography>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="metric-select-label">Metric</InputLabel>
              <Select<MetricKey>
                  labelId="metric-select-label"
                  value={selectedMetric}
                  label="Metric"
                  onChange={handleMetricChange}
              >
                <MenuItem value="count">Total Count</MenuItem>
                <MenuItem value="installation_count">Installation Count</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={4}>
            {dimensions.map((dimension) => {
              const dimensionData = groupedData[dimension] ?? [];

              const sortedData = [...dimensionData].sort(
                  (a, b) => (b[selectedMetric] ?? 0) - (a[selectedMetric] ?? 0)
              );

              const chartData = sortedData
                  .map((item) => ({
                    id: `${dimension}:${item.key_name}`, // ensure unique
                    value: item[selectedMetric] ?? 0,
                    label: item.key_name,
                  }))
                  .filter((x) => x.value > 0);

              const title = dimension
                  .replace("by_", "")
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                      <Typography variant="h6" gutterBottom>
                        {title}
                      </Typography>

                      <Box sx={{ position: "relative" }}>
                        {chartData.length === 0 ? (
                            <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Typography color="text.secondary">No data</Typography>
                            </Box>
                        ) : (
                            <PieChart
                                series={[
                                  {
                                    data: chartData,
                                    // highlightScope: { faded: "global", highlighted: "item" },
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: {
                                      innerRadius: 30,
                                      additionalRadius: -30,
                                      // keeping your styling; optional
                                      color: "gray",
                                    },
                                    arcLabel: (item) => `${item.label ?? ""} (${item.value})`,
                                    arcLabelMinAngle: 18,
                                  },
                                ]}
                                sx={{
                                  [`& .${pieArcLabelClasses.root}`]: {
                                    fill: "white",
                                    fontSize: 14,
                                  },
                                }}
                                height={300}
                                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                            />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
              );
            })}
          </Grid>
        </Container>
      </>
  );
};

export default DimensionCounts;
