import React from "react";
import {
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import {VersionInfo} from "../../../api/analytics.api";

interface VersionChartProps {
  title: string;
  data: VersionInfo[];
  color: string;
  marginBottom?: number;
}

const VersionChart: React.FC<VersionChartProps> = ({
  title,
  data,
  color,
  marginBottom = 0,
}) => {
  const series = data.map((item) => item.installation_count);
  const labels = data.map((item) => item.version);

  return (
    <Paper sx={{ p: 3, mb: marginBottom }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 400 }}>
        <BarChart
          layout="horizontal"
          xAxis={[{
            label: 'Installation Count',
          }]}
          series={[
            {
              data: series,
              label: 'Installation Count',
              color: color,
            },
          ]}
          yAxis={[{
            scaleType: 'band',
            data: labels,
            label: 'Version',
            width: 140
          }]}
          height={350}
          margin={{ top: 20, right: 20, bottom: 70, left: 70 }}
        />
      </Box>
    </Paper>
  );
};

export default VersionChart;