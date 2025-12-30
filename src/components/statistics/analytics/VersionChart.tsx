import React from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import {BarChart} from "@mui/x-charts/BarChart";
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
                                                   }) => {
  const series = data.map((item) => item.installation_count);
  const labels = data.map((item) => item.version);

  return (
      <Card
          variant="elevation"
          sx={{display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1}}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{height: 400}}>
            <BarChart
                layout="horizontal"
                hideLegend={true}
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
                  width: 120
                }]}
                height={350}
            />
          </Box>
        </CardContent>
      </Card>
  );
};

export default VersionChart;