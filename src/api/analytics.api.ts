import { API_ENDPOINTS } from "../config/api";

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

export const fetchSensors = async (): Promise<SensorStats[]> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_SENSORS);
  if (!res.ok) throw new Error("Failed to fetch dimension counts");
  return res.json();
};

export const fetchSummary = async (): Promise<Summary> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_SUMMARY);
  if (!res.ok) throw new Error("Failed to fetch dimension counts");
  return res.json();
};

export const fetchProfile = async (manufacturer: string, model: string): Promise<ProfileStats> => {
  const url = `${API_ENDPOINTS.ANALYTICS_PROFILES}/${encodeURIComponent(manufacturer)}/${encodeURIComponent(model)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch profile metrics");
  const data = await res.json();
  return {
    ...data,
    manufacturer: manufacturer,
    model: model
  }
};

export const fetchProfiles = async(): Promise<ProfileStats[]> => {
  const url = `${API_ENDPOINTS.ANALYTICS_PROFILES}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch profile metrics");
  return res.json();
}

export const fetchVersions = async (): Promise<VersionStats> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_VERSIONS);
  if (!res.ok) throw new Error("Failed to fetch versions data");
  return res.json();
};

export const fetchCountries = async (): Promise<CountryStats[]> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_COUNTRIES);
  if (!res.ok) throw new Error("Failed to fetch versions data");
  return res.json();
};
