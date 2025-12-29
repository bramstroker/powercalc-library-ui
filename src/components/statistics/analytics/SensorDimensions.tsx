import React, { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { useQuery } from "@tanstack/react-query";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {fetchSensorDimensions, DimensionCount} from "../../../api/analytics.api";
import { Header } from "../../Header";
import SensorDimensionDetailView from "./SensorDimensionDetailView";
import {mangoFusionPalette} from "@mui/x-charts";
import MetricsSelect, { MetricKey } from "./MetricsSelect";
import AnalyticsHeader from "./AnalyticsHeader";

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

const SensorDimensions: React.FC = () => {
  const navigate = useNavigate();
  const { dimension: urlDimension } = useParams<{ dimension: string }>();
  const [searchParams] = useSearchParams();

  // Initialize metric from URL query parameter or default to "installation_count"
  const initialMetric = (searchParams.get("metric") as MetricKey) || "installation_count";
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(initialMetric);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dimensionData"],
    queryFn: fetchSensorDimensions
  });

  const handleMetricChange = (value: MetricKey) => {
    setSelectedMetric(value);
    // Update URL with new metric without navigating
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("metric", value);
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  const handleShowDetails = (dimension: string) => {
    // Include current metric in URL when navigating to detail view
    navigate(`/analytics/sensor-dimensions/${dimension}?metric=${selectedMetric}`);
  };

  const handleBackToOverview = () => {
    // Include current metric in URL when navigating back to overview
    navigate(`/analytics/sensor-dimensions?metric=${selectedMetric}`);
  };

  // Callback for when metric changes in detail view
  const handleDetailMetricChange = (metric: MetricKey) => {
    setSelectedMetric(metric);
  };

  // Keep a stable empty array reference so useMemo can actually memoize
  const EMPTY_DIMENSION_COUNTS: DimensionCount[] = [];

  const dimensionCounts = data ?? EMPTY_DIMENSION_COUNTS;

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
      <SensorDimensionDetailView
        dimension={urlDimension}
        data={groupedData[urlDimension]}
        metric={selectedMetric}
        onBack={handleBackToOverview}
        onMetricChange={handleDetailMetricChange}
      />
    );
  }

  // Otherwise show the overview with pie charts
  return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <AnalyticsHeader
              title={"Sensor Statistics"}
              description={"Overview of Powercalc usage across different dimensions."}
              children={
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
                    <strong>Installation Count</strong> – unique Home Assistant installations
                  </li>
                  <li>
                    <strong>Total Count</strong> – total PowerCalc sensor instances
                  </li>
                  <li>
                    <strong>Percentage</strong> – percentage of installations using specific type
                  </li>
                </Box>
              }
              rightContent={
                <MetricsSelect
                    value={selectedMetric}
                    onChange={handleMetricChange}
                />
              }
          />

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
                                    arcLabel: (item) => {
                                      let value = item.value.toString();
                                      if (selectedMetric === "percentage") {
                                        value = `${item.value.toFixed(1)}%`;
                                      }
                                      return `${item.label ?? ""} (${value})`
                                    },
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

export default SensorDimensions;
