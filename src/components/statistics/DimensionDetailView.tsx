import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DimensionCount } from "../../api/library.api";
import { Header } from "../Header";

interface DimensionDetailViewProps {
  dimension: string;
  data: DimensionCount[];
  metric: "installation_count" | "count";
  onBack: () => void;
}

const DimensionDetailView: React.FC<DimensionDetailViewProps> = ({
  dimension,
  data,
  metric,
  onBack,
}) => {
  // Sort data by the selected metric in descending order
  const sortedData = [...data].sort(
    (a, b) => (b[metric] ?? 0) - (a[metric] ?? 0)
  );

  // Format dimension name for display
  const formattedDimension = dimension
    .replace("by_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Format metric name for display
  const metricLabel = metric === "installation_count" 
    ? "Installation Count" 
    : "Total Count";

  // Prepare data for the bar chart
  const chartData = sortedData.map((item) => ({
    key: item.key_name,
    value: item[metric] ?? 0,
  }));

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Tooltip title="Back to overview">
            <IconButton onClick={onBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1">
            {formattedDimension} - {metricLabel}
          </Typography>
        </Box>

        <Paper sx={{ p: 3, height: "100%" }}>
          <Box sx={{ height: "calc(100vh - 250px)", minHeight: "500px" }}>
            {chartData.length === 0 ? (
              <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="text.secondary">No data</Typography>
              </Box>
            ) : (
              <BarChart
                  dataset={chartData}
                  yAxis={[{ scaleType: 'band', dataKey: 'key', width: 140 }]}
                  xAxis={[{ dataKey: 'value' }]}
                  series={[{ dataKey: 'value' }]}
                  layout="horizontal"
              />
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default DimensionDetailView;
