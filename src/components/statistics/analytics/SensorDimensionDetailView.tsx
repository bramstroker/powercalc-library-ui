import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { bluePalette } from "@mui/x-charts";
import { BarChart } from "@mui/x-charts/BarChart";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { SensorStats } from "../../../api/analytics.api";


import type { MetricKey } from "./MetricsSelect";
import { MetricsSelect } from "./MetricsSelect";

interface DimensionDetailViewProps {
  dimension: string;
  data: SensorStats[];
  metric: MetricKey;
  onBack: () => void;
  onMetricChange?: (metric: MetricKey) => void;
}

const BAR_HEIGHT = 36;      // px per bar (tweak to taste)
const CHART_PADDING = 40;  // top + bottom breathing room

const formatDimensionTitle = (dimension: string) => {
  return dimension
      .replace(/^by_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const SensorDimensionDetailView = ({
 dimension,
 data,
 metric,
 onBack,
 onMetricChange,
}: DimensionDetailViewProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>(metric);

  React.useEffect(() => {
    setSelectedMetric(metric);
  }, [metric]);

  const handleMetricChange = (newMetric: MetricKey) => {
    setSelectedMetric(newMetric);

    // Update URL with new metric
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("metric", newMetric);
    void navigate(`/analytics/sensor-dimensions/${dimension}?${newSearchParams.toString()}`, { replace: true });

    // Notify parent component
    onMetricChange?.(newMetric);
  };

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const av = (a[selectedMetric] as number | undefined) ?? 0;
      const bv = (b[selectedMetric] as number | undefined) ?? 0;
      if (bv !== av) return bv - av;
      return String(a.key_name).localeCompare(String(b.key_name));
    });
  }, [data, selectedMetric]);

  const chartData = React.useMemo(
      () =>
          sortedData.map((item) => ({
            key: item.key_name,
            value: (item[selectedMetric] as number | undefined) ?? 0,
          })),
      [sortedData, selectedMetric]
  );

  const formattedDimension = React.useMemo(
      () => formatDimensionTitle(dimension),
      [dimension]
  );

  const chartHeight =
      chartData.length * BAR_HEIGHT + CHART_PADDING;

  return (
      <>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 2,
                mb: 4,
              }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
              <Tooltip title="Back to overview">
                <IconButton onClick={onBack} aria-label="Back to overview">
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>

              <Typography
                  variant="h4"
                  component="h1"
                  noWrap
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {formattedDimension}
              </Typography>
            </Box>

            <MetricsSelect
              value={selectedMetric}
              onChange={handleMetricChange}
              formControlProps={{
                size: "small",
                variant: "outlined",
                sx: { minWidth: 200, flexShrink: 0 }
              }}
            />
          </Box>

          <Paper sx={{ p: { xs: 1, sm: 2 } }}>
            <Box>
              {chartData.length === 0 ? (
                  <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No data available for {formattedDimension.toLowerCase()}
                    </Typography>
                  </Box>
              ) : (
                  <BarChart
                      dataset={chartData}
                      height={chartHeight}
                      margin={{ left: 80, right: 20, top: 20, bottom: 40 }}
                      yAxis={[
                        {
                          scaleType: "band",
                          dataKey: "key",
                          width: 80
                        }
                      ]}
                      xAxis={[
                        {
                          valueFormatter: (v: number) => ((selectedMetric === "percentage") ? `${v}%` : v.toLocaleString()),
                          ...(selectedMetric === "percentage" && { min: 0, max: 100 }),
                        },
                      ]}
                      series={[
                        {
                          dataKey: "value",
                          valueFormatter: (v: number | null) => ((selectedMetric === "percentage") ? `${v?.toFixed(2)}%` : (v ?? 0).toLocaleString()),
                        },
                      ]}
                      layout="horizontal"
                      colors={bluePalette}
                      grid={{ vertical: true }}
                  />
              )}
            </Box>
          </Paper>
        </Container>
      </>
  );
};
