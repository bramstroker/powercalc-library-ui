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
import { BarChart } from "@mui/x-charts/BarChart";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";

import type { SensorStats } from "../../../api/analytics.api";
import { getSensorDimension, sensorDimensionTitle } from "../../../config/sensorDimensions.mjs";
import { useUrlSearchParams } from "../../../hooks/useUrlSearchParams";
import { sensorDimensionsQuery } from "../../../queries/analytics.query";
import { AnalyticsHeader } from "../AnalyticsHeader";

import { MetricsSelect } from "./MetricsSelect";
import { sensorCategoryLabel } from "./sensorCategoryLabel";
import { SensorDimensionDetailView } from "./SensorDimensionDetailView";
import type { MetricKey } from "./sensorMetric";
import { parseMetricKey } from "./sensorMetric";
import { SensorMetricContext } from "./SensorMetricContext";

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
  const { searchParams, updateSearchParams } = useUrlSearchParams();

  const selectedMetric = parseMetricKey(searchParams.get("metric"));

  const { data } = useSuspenseQuery(sensorDimensionsQuery());

  const handleMetricChange = (value: MetricKey) => {
    updateSearchParams({ metric: value });
  };

  const handleShowDetails = (dimension: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("metric", selectedMetric);
    void navigate({
      pathname: `/analytics/sensor-dimensions/${encodeURIComponent(dimension)}`,
      search: next.toString(),
    });
  };

  const handleBackToOverview = () => {
    const next = new URLSearchParams(searchParams);
    next.set("metric", selectedMetric);
    void navigate({ pathname: "/analytics/sensor-dimensions", search: next.toString() });
  };

  const groupedData = useMemo(() => groupByDimension(data), [data]);

  const dimensions = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

  // If a dimension is specified in the URL, show the detailed view
  if (urlDimension && groupedData[urlDimension]) {
    return (
      <SensorDimensionDetailView
        dimension={urlDimension}
        data={groupedData[urlDimension]}
        metric={selectedMetric}
        onBack={handleBackToOverview}
        onMetricChange={handleMetricChange}
      />
    );
  }

  // Show the largest categories; details retain the complete distribution.
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

      <SensorMetricContext metric={selectedMetric} />
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
              label: sensorCategoryLabel(item.key_name),
              installations: item.installation_count,
              percentage: item.percentage,
            }))
            .filter((x) => x.value > 0);
          const visibleData = chartData.slice(0, 8);

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
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6" component="h2">
                      {title}
                    </Typography>
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

                {chartData.length === 0 ? (
                  <Typography color="text.secondary">No data</Typography>
                ) : (
                  <>
                    {chartData.length > 8 && (
                      <Typography variant="body2" color="text.secondary">
                        Top 8 of {chartData.length} categories. Open Details for the full list.
                      </Typography>
                    )}
                    <BarChart
                      dataset={visibleData}
                      layout="horizontal"
                      height={visibleData.length * 42 + 50}
                      yAxis={[{ scaleType: "band", dataKey: "label", width: isMobile ? 100 : 140 }]}
                      xAxis={[
                        {
                          min: 0,
                          ...(selectedMetric === "percentage" ? { max: 100 } : {}),
                          valueFormatter: (value: number) =>
                            selectedMetric === "percentage" ? `${value}%` : value.toLocaleString(),
                        },
                      ]}
                      series={[
                        {
                          dataKey: "value",
                          valueFormatter: (value: number | null) =>
                            selectedMetric === "percentage"
                              ? `${value ?? 0}% of reporting installations`
                              : `${(value ?? 0).toLocaleString()} ${selectedMetric === "count" ? "sensors" : "installations"}`,
                        },
                      ]}
                      colors={mangoFusionPalette}
                      grid={{ vertical: true }}
                    />
                    <Box component="ul" sx={{ pl: 2, my: 1, overflowWrap: "anywhere" }}>
                      {visibleData.map((item) => (
                        <Typography component="li" variant="body2" key={item.id} sx={{ mb: 0.5 }}>
                          {item.label}:{" "}
                          {selectedMetric === "count"
                            ? `${item.value.toLocaleString()} sensors`
                            : `${item.installations.toLocaleString()} installations · ${item.percentage}% of reporting installations`}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
