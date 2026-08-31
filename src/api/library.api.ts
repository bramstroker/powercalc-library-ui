import { API_ENDPOINTS } from "../config/api";
import type { CalculationStrategy } from "../types/CalculationStrategy";
import type { Connectivity } from "../types/PowerProfile";

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
  /** Nominal mains voltage the measurements were taken on, e.g. 230 or 120. */
  mains_voltage?: number;
  /** Lowest and highest power the profile draws. Absent when only the maximum is known. */
  power_range?: {
    min: number;
    max: number;
  };
  /** When the LUT files last changed, as opposed to `updated_at`, which any commit moves. */
  measurement_updated_at?: string;
  /** Set when `standby_power` holds an assumed value rather than a measured one. */
  standby_power_estimated?: boolean;
  /** Manufacturer specifications. Available keys depend on `device_type`. */
  device_specs?: {
    /** A profile can fit multiple regional equivalents, such as E26 and E27. */
    socket?: string | string[];
    form_factor?: string;
    lumens?: number;
    rated_power?: number;
    connectivity?: Connectivity[];
    /** Maximum load supported by a smart switch or dimmer, in watts. */
    max_load_watts?: number;
    /** Whether a smart switch or dimmer measures the connected load. */
    power_monitoring?: boolean;
  };
  product_url?: string;
  ean?: string[];
}

export type LibraryJson = {
  manufacturers: Array<{
    full_name: string;
    dir_name: string;
    /** Other brand names the same manufacturer is known by. */
    aliases?: string[];
    /** Home page of the brand. */
    website?: string;
    /** ISO 3166-1 alpha-2 country code, e.g. "NL". */
    country?: string;
    description?: string;
    models: LibraryModel[];
  }>;
};

export const fetchLibrary = async (): Promise<LibraryJson> => {
  const res = await fetch(API_ENDPOINTS.LIBRARY);
  if (!res.ok) throw new Error("Failed to fetch library");
  return res.json();
};
