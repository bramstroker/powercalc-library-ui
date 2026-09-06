import Typography from "@mui/material/Typography";

import type { MetricKey } from "./sensorMetric";

export const SensorMetricContext = ({ metric }: { metric: MetricKey }) => (
  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
    {metric === "count"
      ? "Counts represent sensor instances, not installations."
      : "One installation can appear in multiple categories. Percentages are relative to all reporting installations and can add up to more than 100%."}
  </Typography>
);
