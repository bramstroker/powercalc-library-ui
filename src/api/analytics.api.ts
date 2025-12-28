import { API_ENDPOINTS } from "../config/api";

export interface DimensionCount {
  dimension: string;
  key_name: string;
  count: number;
  installation_count: number;
}

export interface Summary {
  sampled_installations: number;
  snapshots: number;
  hacs_installs: number;
  github_stars: number;
}

export const fetchDimensionCounts = async (): Promise<DimensionCount[]> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_DIMENSION_COUNTS);
  if (!res.ok) throw new Error("Failed to fetch dimension counts");
  return res.json();
};

export const fetchSummary = async (): Promise<Summary> => {
  const res = await fetch(API_ENDPOINTS.ANALYTICS_SUMMARY);
  if (!res.ok) throw new Error("Failed to fetch dimension counts");
  return res.json();
};
