import { API_ENDPOINTS } from "../config/api";
import type { CalculationStrategy } from "../types/CalculationStrategy";

import { fetchJson } from "./http";

export interface LibraryModel {
  id: string;
  name: string;
  device_type: string;
  color_modes?: string[];
  aliases?: string[];
  /** Previous model directory IDs which should redirect to `id`. */
  legacy_ids?: string[];
  authors?: Array<{
    name: string;
    email?: string;
    github: string;
  }>;
  updated_at: string;
  created_at: string;
  description: string;
  measure_device: string;
  measure_method: string;
  measure_description: string;
  calculation_strategy: CalculationStrategy;
  max_power?: number;
  standby_power?: number;
  standby_power_on?: number;
  sub_profile_count: number;
  min_version?: string;
  compatible_integrations?: string[];
  /** Settings the measurement was taken with, e.g. sample count and tooling version. */
  measure_settings?: Record<string, unknown>;
  measure_device_firmware?: string;
  /** How the profile is selected: automatically by "device"/"entity", or "manual" only. */
  discovery_by?: string;
  only_self_usage?: boolean;
  /** "<manufacturer>/<model>" of the profile whose measurements this one reuses. */
  linked_profile?: string;
  /**
   * Smoothness scores of the model's LUT files, 0-100. `score` is the worst over every LUT file,
   * sub profiles included. Absent for models that do not use the LUT calculation strategy.
   */
  lut_quality?: {
    score: number;
    brightness?: number;
    color_temp?: number;
  };
  /** Mains voltage in volts observed while the measurements were taken. */
  voltage_range?: {
    min: number;
    max: number;
  };
}

export type LibraryJson = {
  manufacturers: Array<{
    full_name: string;
    dir_name: string;
    /** Other brand names the same manufacturer is known by. */
    aliases?: string[];
    models: LibraryModel[];
  }>;
};

export const fetchLibrary = () =>
  fetchJson<LibraryJson>(API_ENDPOINTS.LIBRARY, "Failed to fetch library");
