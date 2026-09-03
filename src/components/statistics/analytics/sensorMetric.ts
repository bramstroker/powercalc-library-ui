export const SENSOR_METRICS = ["installation_count", "count", "percentage"] as const;

export type MetricKey = (typeof SENSOR_METRICS)[number];

export const DEFAULT_METRIC: MetricKey = "installation_count";

export const isMetricKey = (value: string | null): value is MetricKey =>
  SENSOR_METRICS.some((metric) => metric === value);

export const parseMetricKey = (value: string | null): MetricKey =>
  isMetricKey(value) ? value : DEFAULT_METRIC;
