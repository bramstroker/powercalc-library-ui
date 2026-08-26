import { API_ENDPOINTS } from "../config/api";

import { fetchJson } from "./http";

export interface SensorStats {
  dimension: string;
  key_name: string;
  count: number;
  installation_count: number;
  percentage: number;
}

export interface Summary {
  sampled_installations: number;
  snapshots: number;
  hacs_installs: number;
  github_stars: number;
  total_sensors: number;
  contributors: number;
}

export interface ProfileStats {
  manufacturer: string;
  model: string;
  count: number;
  installation_count: number;
  percentage: number;
}

export interface VersionInfo {
  version: string;
  installation_count: number;
  percentage: number;
}

export interface VersionStats {
  ha_versions: VersionInfo[];
  powercalc_versions: VersionInfo[];
}

export interface CountryStats {
  country_code: string;
  installation_count: number;
  percentage: number;
}

export const fetchSensors = () =>
  fetchJson<SensorStats[]>(API_ENDPOINTS.ANALYTICS_SENSORS, "Failed to fetch dimension counts");

export const fetchSummary = () =>
  fetchJson<Summary>(API_ENDPOINTS.ANALYTICS_SUMMARY, "Failed to fetch analytics summary");

export const fetchProfile = async (manufacturer: string, model: string): Promise<ProfileStats> => {
  const url = `${API_ENDPOINTS.ANALYTICS_PROFILES}/${encodeURIComponent(manufacturer)}/${encodeURIComponent(model)}`;
  // The endpoint is addressed by manufacturer and model, so it does not echo them back.
  const data = await fetchJson<Omit<ProfileStats, "manufacturer" | "model">>(
    url,
    "Failed to fetch profile metrics",
  );
  return { ...data, manufacturer, model };
};

export const fetchProfiles = () =>
  fetchJson<ProfileStats[]>(API_ENDPOINTS.ANALYTICS_PROFILES, "Failed to fetch profile metrics");

export const fetchVersions = () =>
  fetchJson<VersionStats>(API_ENDPOINTS.ANALYTICS_VERSIONS, "Failed to fetch versions data");

export const fetchCountries = () =>
  fetchJson<CountryStats[]>(API_ENDPOINTS.ANALYTICS_COUNTRIES, "Failed to fetch country data");

export interface TimeseriesQuery {
  metric: string;
  bucket: string;
  timezone: string;
  from: Date;
  to: Date;
}

export interface TimeseriesPoint {
  ts: string;
  value: number;
}

export interface TimeseriesSeries {
  name: string;
  points: TimeseriesPoint[];
}

export interface TimeseriesResponse {
  query: TimeseriesQuery;
  series: TimeseriesSeries[];
}

export const fetchTimeseries = (
  metric: string = "optin_date",
  bucket: string = "day",
  timezone: string = "UTC",
  from: Date = new Date("2024-01-01"),
  to: Date = new Date(),
): Promise<TimeseriesResponse> => {
  const url = new URL(API_ENDPOINTS.ANALYTICS_TIMESERIES);
  url.searchParams.append("metric", metric);
  url.searchParams.append("bucket", bucket);
  url.searchParams.append("timezone", timezone);
  url.searchParams.append("from", from.toISOString().split("T")[0]);
  url.searchParams.append("to", to.toISOString().split("T")[0]);

  return fetchJson<TimeseriesResponse>(url.toString(), "Failed to fetch timeseries data");
};
