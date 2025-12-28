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
  Button,
} from "@mui/material";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { useQuery } from "@tanstack/react-query";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate, useParams } from "react-router-dom";

import {fetchDimensionCounts, DimensionCount, fetchSummary} from "../../api/analytics.api";
import { Header } from "../Header";
import DimensionDetailView from "./DimensionDetailView";
import {mangoFusionPalette} from "@mui/x-charts";

type MetricKey = "installation_count" | "count";

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
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("installation_count");
  const navigate = useNavigate();
  const { dimension: urlDimension } = useParams<{ dimension: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dimensionData"],
    queryFn: async () => {
      const [dimensionCounts, stats] = await Promise.all([
        fetchDimensionCounts(),
        fetchSummary(),
      ]);

      return { dimensionCounts, stats };
    },
  });

  const sampledInstallations = data?.stats.sampled_installations ?? 0;

  const handleMetricChange = (event: SelectChangeEvent<MetricKey>) => {
    setSelectedMetric(event.target.value as MetricKey);
  };

  const handleShowDetails = (dimension: string) => {
    navigate(`/statistics/dimension-counts/${dimension}`);
  };

  const handleBackToOverview = () => {
    navigate('/statistics/dimension-counts');
  };

  // Keep a stable empty array reference so useMemo can actually memoize
  const EMPTY_DIMENSION_COUNTS: DimensionCount[] = [];

  const dimensionCounts = data?.dimensionCounts ?? EMPTY_DIMENSION_COUNTS;

  const groupedData = useMemo(
      () => groupByDimension(dimensionCounts),
      [dimensionCounts]
  );

  const dimensions = useMemo(
      () => Object.keys(groupedData).sort(),
      [groupedData]
  );

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

  // If a dimension is specified in the URL, show the detailed view
  if (urlDimension && groupedData[urlDimension]) {
    return (
      <DimensionDetailView
        dimension={urlDimension}
        data={groupedData[urlDimension]}
        metric={selectedMetric}
        onBack={handleBackToOverview}
      />
    );
  }

  // Otherwise show the overview with pie charts
  return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                PowerCalc Statistics
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Overview of PowerCalc usage across different dimensions.
              </Typography>

              <Box
                  component="ul"
                  sx={{
                    pl: 2,
                    mt: 1,
                    mb: 1,
                    color: "text.secondary",
                    "& li": { mb: 0.5 },
                  }}
              >
                <li>
                  <strong>Installation count</strong> – unique Home Assistant installations
                </li>
                <li>
                  <strong>Count</strong> – total PowerCalc sensor instances
                </li>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Based on {sampledInstallations} active installations that opted in to analytics.
              </Typography>
            </Box>

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
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6">
                          {title}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<BarChartIcon />}
                          onClick={() => handleShowDetails(dimension)}
                        >
                          Details
                        </Button>
                      </Box>

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
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: {
                                      innerRadius: 30,
                                      additionalRadius: -30,
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
                                colors={mangoFusionPalette}
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
