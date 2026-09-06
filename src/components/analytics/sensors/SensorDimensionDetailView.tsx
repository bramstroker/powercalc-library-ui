import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { bluePalette } from "@mui/x-charts";
import { BarChart } from "@mui/x-charts/BarChart";
import React from "react";

import type { SensorStats } from "../../../api/analytics.api";
import { sensorDimensionTitle } from "../../../config/sensorDimensions.mjs";
import { PageBreadcrumbs } from "../../shared/PageBreadcrumbs";

import { MetricsSelect } from "./MetricsSelect";
import { sensorCategoryLabel } from "./sensorCategoryLabel";
import type { MetricKey } from "./sensorMetric";
import { SensorMetricContext } from "./SensorMetricContext";

interface DimensionDetailViewProps {
  dimension: string;
  data: SensorStats[];
  metric: MetricKey;
  onBack: () => void;
  onMetricChange: (metric: MetricKey) => void;
}

const BAR_HEIGHT = 36; // px per bar (tweak to taste)
const CHART_PADDING = 40; // top + bottom breathing room

export const SensorDimensionDetailView = ({
  dimension,
  data,
  metric,
  onBack,
  onMetricChange,
}: DimensionDetailViewProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const av = (a[metric] as number | undefined) ?? 0;
      const bv = (b[metric] as number | undefined) ?? 0;
      if (bv !== av) return bv - av;
      return String(a.key_name).localeCompare(String(b.key_name));
    });
  }, [data, metric]);

  const chartData = React.useMemo(
    () =>
      sortedData.map((item) => ({
        key: sensorCategoryLabel(item.key_name),
        value: (item[metric] as number | undefined) ?? 0,
      })),
    [sortedData, metric],
  );

  const formattedDimension = React.useMemo(() => sensorDimensionTitle(dimension), [dimension]);

  const chartHeight = chartData.length * BAR_HEIGHT + CHART_PADDING;

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <PageBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Analytics", to: "/analytics" },
            { label: "Sensor statistics", to: "/analytics/sensor-dimensions" },
            { label: formattedDimension },
          ]}
        />
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
            value={metric}
            onChange={onMetricChange}
            formControlProps={{
              size: "small",
              variant: "outlined",
              sx: { minWidth: 200, flexShrink: 0 },
            }}
          />
        </Box>

        <SensorMetricContext metric={metric} />
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
                margin={{ left: 0, right: isMobile ? 8 : 20, top: 20, bottom: 0 }}
                yAxis={[
                  {
                    scaleType: "band",
                    dataKey: "key",
                    width: isMobile ? 96 : 140,
                  },
                ]}
                xAxis={[
                  {
                    valueFormatter: (v: number) =>
                      metric === "percentage" ? `${v}%` : v.toLocaleString(),
                    ...(metric === "percentage" && { min: 0, max: 100 }),
                  },
                ]}
                series={[
                  {
                    dataKey: "value",
                    valueFormatter: (v: number | null) =>
                      metric === "percentage" ? `${v?.toFixed(2)}%` : (v ?? 0).toLocaleString(),
                  },
                ]}
                layout="horizontal"
                colors={bluePalette}
                grid={{ vertical: true }}
              />
            )}
            {chartData.length > 0 && (
              <Box sx={{ overflowX: "auto", mt: 2 }}>
                <Box
                  component="table"
                  sx={{
                    width: "100%",
                    borderCollapse: "collapse",
                    "& th, & td": {
                      p: 1,
                      textAlign: "left",
                      borderBottom: 1,
                      borderColor: "divider",
                    },
                  }}
                >
                  <caption>{formattedDimension} sensor statistics</caption>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Installations</th>
                      <th>% of reporting installations</th>
                      <th>Sensors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item) => (
                      <tr key={item.key_name}>
                        <th scope="row">{sensorCategoryLabel(item.key_name)}</th>
                        <td>{item.installation_count.toLocaleString()}</td>
                        <td>{item.percentage}%</td>
                        <td>{item.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
};
