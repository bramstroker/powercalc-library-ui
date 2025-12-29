import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DimensionCount } from "../../../api/analytics.api";
import { Header } from "../../Header";
import { bluePalette } from "@mui/x-charts";

type MetricKey = "installation_count" | "count" | "percentage";

interface DimensionDetailViewProps {
  dimension: string;
  data: DimensionCount[];
  metric: MetricKey;
  onBack: () => void;
  onMetricChange?: (metric: MetricKey) => void;
}

const METRIC_OPTIONS: ReadonlyArray<{ label: string; value: MetricKey }> = [
  { label: "Total count", value: "count" },
  { label: "Installation count", value: "installation_count" },
  { label: "Percentage", value: "percentage" },
];

function formatDimensionTitle(dimension: string) {
  return dimension
      .replace(/^by_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
}

const SensorDimensionDetailView: React.FC<DimensionDetailViewProps> = ({
 dimension,
 data,
 metric,
 onBack,
 onMetricChange,
}) => {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>(metric);

  React.useEffect(() => {
    setSelectedMetric(metric);
  }, [metric]);

  const handleMetricChange = (event: SelectChangeEvent) => {
    const newMetric = event.target.value as MetricKey;
    setSelectedMetric(newMetric);
    onMetricChange?.(newMetric);
  };

  const metricLabel =
      METRIC_OPTIONS.find((x) => x.value === selectedMetric)?.label ?? "Metric";

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

  return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Box
              sx={{
                display: "flex",
                alignItems: "center",
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

            <FormControl
                size="small"
                variant="outlined"
                sx={{ minWidth: 200, flexShrink: 0 }}
            >
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
          </Box>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ height: "calc(100vh - 250px)", minHeight: 500 }}>
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
                      yAxis={[
                        {
                          scaleType: "band",
                          dataKey: "key",
                          width: 140
                        }
                      ]}
                      xAxis={[
                        {
                          label: metricLabel,
                          valueFormatter: (v: number) => ((selectedMetric === "percentage") ? `${v}%` : v.toLocaleString()),
                          ...(selectedMetric === "percentage" && { min: 0, max: 100 }),
                        },
                      ]}
                      series={[
                        {
                          dataKey: "value",
                          label: metricLabel,
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

export default SensorDimensionDetailView;