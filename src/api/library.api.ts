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
  description: string | null;
  measure_device: string;
  measure_method: string;
  measure_description: string | null;
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

export const SUPPORTED_LIBRARY_CHANGE_TYPES = ["profile_added", "measurement_updated"] as const;
export const LIBRARY_CHANGES_PAGE_SIZE = 30;
export const LIBRARY_CHANGES_WINDOW_MONTHS = 2;

export type SupportedLibraryChangeType = (typeof SUPPORTED_LIBRARY_CHANGE_TYPES)[number];

export interface LibraryChangeProfile {
  manufacturer: {
    dir_name: string;
    full_name: string;
  };
  id: string;
  /** Older historical changes can predate these optional profile metadata fields. */
  name?: string;
  device_type?: string;
}

export interface LibraryProfileChange {
  /** New API types may be returned in a PR that also contains a supported change. */
  type: string;
  profile: LibraryChangeProfile;
  changed_fields: string[];
}

export interface LibraryChange {
  id: string;
  occurred_at: string;
  summary: string;
  changes: LibraryProfileChange[];
  authors: Array<{
    name: string;
    github?: string;
  }>;
  source: {
    repository: string;
    branch: string;
    pull_request_number: number;
    pull_request_url: string;
  };
}

export interface LibraryChangesPage {
  items: LibraryChange[];
  next_cursor: string | null;
}

interface FetchLibraryChangesOptions {
  cursor?: string | null;
  since?: string;
  signal?: AbortSignal;
}

export const libraryChangesSince = (now = new Date()): string => {
  const day = now.getUTCDate();
  const since = new Date(now);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(1);
  since.setUTCMonth(since.getUTCMonth() - LIBRARY_CHANGES_WINDOW_MONTHS);
  const lastDayOfTargetMonth = new Date(
    Date.UTC(since.getUTCFullYear(), since.getUTCMonth() + 1, 0),
  ).getUTCDate();
  since.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  return since.toISOString();
};

export const fetchLibraryChanges = async ({
  cursor,
  since,
  signal,
}: FetchLibraryChangesOptions = {}): Promise<LibraryChangesPage> => {
  const url = new URL(API_ENDPOINTS.LIBRARY_CHANGES);
  url.searchParams.set("limit", String(LIBRARY_CHANGES_PAGE_SIZE));
  url.searchParams.set("types", SUPPORTED_LIBRARY_CHANGE_TYPES.join(","));
  if (cursor) url.searchParams.set("cursor", cursor);
  if (since) url.searchParams.set("since", since);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error("Failed to fetch library changes");
  return res.json();
};

export const fetchLibrary = async (): Promise<LibraryJson> => {
  const res = await fetch(API_ENDPOINTS.LIBRARY);
  if (!res.ok) throw new Error("Failed to fetch library");
  return res.json();
};
