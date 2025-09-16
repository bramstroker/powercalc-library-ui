import { API_ENDPOINTS } from "../config/api";

export interface LibraryModel {
  id: string;
  name: string;
  device_type: string;
  color_modes?: string[];
  aliases?: string[];
  author?: string;
  updated_at: number;
  created_at: string;
  description: string;
  measure_device: string;
  measure_method: string;
  measure_description: string;
  calculation_strategy: string;
  max_power?: number;
  standby_power: number;
  standby_power_on?: number;
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
