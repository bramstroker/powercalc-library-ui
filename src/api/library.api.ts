import { API_ENDPOINTS } from "../config/api";

export interface DimensionCount {
  dimension: string;
  key_name: string;
  count: number;
  installation_count: number;
}

export interface LibraryModel {
  id: string;
  name: string;
  device_type: string;
  color_modes?: string[];
  aliases?: string[];
  author?: string;
  updated_at: string;
  created_at: string;
  description: string;
  measure_device: string;
  measure_method: string;
  measure_description: string;
  calculation_strategy: string;
  max_power?: number;
  standby_power: number;
  standby_power_on?: number;
  sub_profile_count: number;
}

export type LibraryJson = {
  manufacturers: Array<{
    full_name: string;
    dir_name: string;
    models: Array<LibraryModel>;
  }>;
};

export const fetchLibrary = async (): Promise<LibraryJson> => {
  const res = await fetch(API_ENDPOINTS.LIBRARY);
  if (!res.ok) throw new Error("Failed to fetch library");
  return res.json();
};

export const fetchDimensionCounts = async (): Promise<DimensionCount[]> => {
  const res = await fetch(API_ENDPOINTS.DIMENSION_COUNTS);
  if (!res.ok) throw new Error("Failed to fetch dimension counts");
  return res.json();
};
