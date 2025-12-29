import { API_ENDPOINTS } from "../config/api";

export interface DimensionCount {
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
}

export interface ProfileMetrics {
  count: number;
  installation_count: number;
  percentage: number;
}

export interface VersionInfo {
  version: string;
  installation_count: number;
  percentage: number;
}

export interface VersionsData {
  ha_versions: VersionInfo[];
  powercalc_versions: VersionInfo[];
}

export const fetchSensorDimensions = async (): Promise<DimensionCount[]> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_SENSORS);
  if (!res.ok) throw new Error("Failed to fetch dimension counts");
  return res.json();
};

export const fetchSummary = async (): Promise<Summary> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_SUMMARY);
  if (!res.ok) throw new Error("Failed to fetch dimension counts");
  return res.json();
};

export const fetchProfileMetrics = async (manufacturer: string, model: string): Promise<ProfileMetrics> => {
  const url = `${API_ENDPOINTS.ANALYTICS_PROFILES}/${encodeURIComponent(manufacturer)}/${encodeURIComponent(model)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch profile metrics");
  return res.json();
};

export const fetchVersionsData = async (): Promise<VersionsData> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_VERSIONS);
  if (!res.ok) throw new Error("Failed to fetch versions data");
  return res.json();
};
