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
const DAILY_STALE_TIME_MS = 24 * 60 * 60 * 1000;

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export const analyticsQueryKeys = {
  summary: [...ANALYTICS_QUERY_ROOT, "summary"] as const,
  sensorDimensions: [...ANALYTICS_QUERY_ROOT, "sensor-dimensions"] as const,
  profiles: [...ANALYTICS_QUERY_ROOT, "profiles"] as const,
  versions: [...ANALYTICS_QUERY_ROOT, "versions"] as const,
  countries: [...ANALYTICS_QUERY_ROOT, "countries"] as const,
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
};

export const dailySummaryQuery = () =>
  queryOptions({
    queryKey: analyticsQueryKeys.summary,
    queryFn: fetchSummary,
    staleTime: DAILY_STALE_TIME_MS,
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

export const analyticsVersionsQuery = () =>
  queryOptions({
    queryKey: analyticsQueryKeys.versions,
    queryFn: fetchVersions,
    staleTime: DAILY_STALE_TIME_MS,
  });

export const analyticsCountriesQuery = () =>
  queryOptions({
    queryKey: analyticsQueryKeys.countries,
    queryFn: fetchCountries,
    staleTime: DAILY_STALE_TIME_MS,
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
