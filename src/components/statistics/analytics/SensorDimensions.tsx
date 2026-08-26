import BarChartIcon from "@mui/icons-material/BarChart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { mangoFusionPalette } from "@mui/x-charts";
import { PieChart, pieClasses } from "@mui/x-charts/PieChart";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import type { SensorStats } from "../../../api/analytics.api";
import { fetchSensors } from "../../../api/analytics.api";
import { getSensorDimension, sensorDimensionTitle } from "../../../config/sensorDimensions.mjs";
import { visuallyHiddenSx } from "../../../utils/accessibility";

import { AnalyticsHeader } from "./AnalyticsHeader";
import type { MetricKey } from "./MetricsSelect";
import { MetricsSelect, parseMetricKey } from "./MetricsSelect";
import { SensorDimensionDetailView } from "./SensorDimensionDetailView";

const groupByDimension = (data: SensorStats[]): Record<string, SensorStats[]> => {
  return data.reduce<Record<string, SensorStats[]>>((acc, item) => {
    (acc[item.dimension] ??= []).push(item);
    return acc;
  }, {});
};

export const SensorDimensions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { dimension: urlDimension } = useParams<{ dimension: string }>();
  const [searchParams] = useSearchParams();

  // The URL remains the source of truth, so deep links and back/forward navigation cannot diverge
  // from the selected control. Unknown values safely fall back instead of indexing data by an
  // arbitrary string.
  const selectedMetric = parseMetricKey(searchParams.get("metric"));

  const { data } = useSuspenseQuery<SensorStats[]>({
    queryKey: ["dimensionData"],
    queryFn: ({ signal }) => fetchSensors(signal),
  });

  const handleMetricChange = (value: MetricKey) => {
    // Update URL with new metric without navigating
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("metric", value);
    void navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  const handleShowDetails = (dimension: string) => {
    // Include current metric in URL when navigating to detail view
    void navigate(`/analytics/sensor-dimensions/${dimension}?metric=${selectedMetric}`);
  };

  const handleBackToOverview = () => {
    // Include current metric in URL when navigating back to overview
    void navigate(`/analytics/sensor-dimensions?metric=${selectedMetric}`);
  };

  // Keep a stable empty array reference so useMemo can actually memoize
  const EMPTY_DIMENSION_COUNTS: SensorStats[] = [];

  const dimensionCounts = data ?? EMPTY_DIMENSION_COUNTS;

  const groupedData = useMemo(() => groupByDimension(dimensionCounts), [dimensionCounts]);

  const dimensions = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

  // If a dimension is specified in the URL, show the detailed view
  if (urlDimension && groupedData[urlDimension]) {
    return (
      <SensorDimensionDetailView
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
      <AnalyticsHeader
        title={"Sensor Statistics"}
        description={"Overview of Powercalc usage across different dimensions."}
        breadcrumbItems={[
          { label: "Home", to: "/" },
          { label: "Analytics", to: "/analytics" },
          { label: "Sensor statistics" },
        ]}
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
        filterSection={<MetricsSelect value={selectedMetric} onChange={handleMetricChange} />}
      />

      <Grid container spacing={4}>
        {dimensions.map((dimension) => {
          const dimensionData = groupedData[dimension] ?? [];

          const sortedData = [...dimensionData].sort(
            (a, b) => (b[selectedMetric] ?? 0) - (a[selectedMetric] ?? 0),
          );

          const chartData = sortedData
            .map((item) => ({
              id: `${dimension}:${item.key_name}`, // ensure unique
              value: item[selectedMetric] ?? 0,
              label: item.key_name,
            }))
            .filter((x) => x.value > 0);

          const dimensionInfo = getSensorDimension(dimension);
          const title = sensorDimensionTitle(dimension);

          return (
            <Grid size={{ xs: 12, md: 6 }} key={dimension}>
              <Paper sx={{ p: { xs: 1.5, sm: 3 }, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6">{title}</Typography>
                    {dimensionInfo?.description && (
                      <Tooltip title={dimensionInfo.description} arrow describeChild>
                        <Box
                          component="span"
                          role="img"
                          tabIndex={0}
                          aria-label={`${title}: ${dimensionInfo.description}`}
                          sx={{ display: "inline-flex", ml: 0.5, color: "text.secondary" }}
                        >
                          <InfoOutlinedIcon aria-hidden="true" fontSize="small" />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BarChartIcon />}
                    onClick={() => handleShowDetails(dimension)}
                  >
                    Details
                  </Button>
                </Box>

                <Box sx={{ position: "relative", height: isMobile ? 420 : 300 }}>
                  {chartData.length === 0 ? (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">No data</Typography>
                    </Box>
                  ) : (
                    <PieChart
                      series={[
                        {
                          data: chartData,
                          highlightScope: { fade: "global", highlight: "item" },
                          faded: {
                            innerRadius: 30,
                            additionalRadius: -30,
                            color: "gray",
                          },
                          arcLabel: (item) => {
                            const value =
                              selectedMetric === "percentage"
                                ? `${item.value.toFixed(1)}%`
                                : item.value.toString();
                            return isMobile ? value : `${item.label ?? ""} (${value})`;
                          },
                          arcLabelMinAngle: isMobile ? 25 : 18,
                        },
                      ]}
                      sx={{
                        [`& .${pieClasses.arcLabel}`]: {
                          fill: "white",
                          fontSize: 14,
                        },
                        height: "100%",
                      }}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      colors={mangoFusionPalette}
                      slotProps={{
                        legend: isMobile
                          ? {
                              direction: "horizontal",
                              position: {
                                vertical: "bottom",
                                horizontal: "center",
                              },
                              sx: {
                                flexWrap: "wrap",
                                justifyContent: "center",
                              },
                            }
                          : {
                              direction: "vertical",
                              position: {
                                vertical: "top",
                                horizontal: "end",
                              },
                              sx: {
                                overflowY: "scroll",
                                flexWrap: "nowrap",
                                height: "100%",
                              },
                            },
                      }}
                    />
                  )}
                  {chartData.length > 0 && (
                    <Box component="ul" sx={visuallyHiddenSx}>
                      {chartData.map((item) => (
                        <li key={item.id}>
                          {item.label}: {item.value}
                          {selectedMetric === "percentage" ? "%" : ""}
                        </li>
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
