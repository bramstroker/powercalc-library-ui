import { queryOptions } from "@tanstack/react-query";

import {
  fetchCountries,
  fetchProfiles,
  fetchSensors,
  fetchSummary,
  fetchTimeseries,
  fetchVersions,
} from "../api/analytics.api";

const ANALYTICS_QUERY_ROOT = ["analytics"] as const;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export const analyticsQueryKeys = {
  summary: [...ANALYTICS_QUERY_ROOT, "summary"] as const,
  sensorDimensions: [...ANALYTICS_QUERY_ROOT, "sensor-dimensions"] as const,
  profiles: [...ANALYTICS_QUERY_ROOT, "profiles"] as const,
  timeSeries: (metric: string, bucket: string, timezone: string, from: Date, to: Date) =>
    [
      ...ANALYTICS_QUERY_ROOT,
      "time-series",
      metric,
      bucket,
      timezone,
      dateKey(from),
      dateKey(to),
    ] as const,
  installations: (from: Date, to: Date) =>
    [...ANALYTICS_QUERY_ROOT, "installations", dateKey(from), dateKey(to)] as const,
};

export const dailySummaryQuery = () =>
  queryOptions({
    queryKey: analyticsQueryKeys.summary,
    queryFn: fetchSummary,
    staleTime: ONE_DAY_MS,
  });

export const sensorDimensionsQuery = () =>
  queryOptions({
    queryKey: analyticsQueryKeys.sensorDimensions,
    queryFn: fetchSensors,
  });

export const analyticsProfilesQuery = () =>
  queryOptions({
    queryKey: analyticsQueryKeys.profiles,
    queryFn: fetchProfiles,
  });

export const analyticsTimeSeriesQuery = (
  metric: string,
  bucket: string,
  timezone: string,
  from: Date,
  to: Date,
) =>
  queryOptions({
    queryKey: analyticsQueryKeys.timeSeries(metric, bucket, timezone, from, to),
    queryFn: () => fetchTimeseries(metric, bucket, timezone, from, to),
  });

export const installationsAnalyticsQuery = (from: Date, to: Date) =>
  queryOptions({
    queryKey: analyticsQueryKeys.installations(from, to),
    queryFn: async () => {
      const [versionsData, countriesData, optinsData, sensorsData] = await Promise.all([
        fetchVersions(),
        fetchCountries(),
        fetchTimeseries("optin_date", "day", "UTC", from, to),
        fetchTimeseries("sensors", "day", "UTC", from, to),
      ]);

      return { versionsData, countriesData, optinsData, sensorsData };
    },
  });
