import type { CalculationStrategy } from "./CalculationStrategy";
import type { ColorMode } from "./ColorMode";
import type { DeviceType } from "./DeviceType";

export type Author = {
  name: string;
  email?: string | null;
  githubUsername: string;
};

export type ContributorSummary = {
  author: Author;
  profileCount: number;
  manufacturerCount: number;
  deviceTypes: DeviceType[];
  firstContributionAt: Date | null;
  latestContributionAt: Date | null;
  latestProfile: PowerProfile | null;
};

export type UsageStats = {
  installationCount: number;
  deviceCount: number;
  percentage: number;
};

/**
 * Smoothness of the measured curves, 0-100. `score` is the worst over every LUT file of the
 * profile, sub profiles included; the per-mode entries tell which curve pulls it down.
 */
export type LutQuality = {
  score: number;
  brightness?: number;
  colorTemp?: number;
};

/** Mains voltage in volts observed while the measurements were taken. */
export type VoltageRange = {
  min: number;
  max: number;
};

/** Lowest and highest power a profile draws, both ends of the same measurements. */
export type PowerRange = {
  min: number;
  max: number;
};

export type Connectivity =
  | "zigbee"
  | "wifi"
  | "zwave"
  | "matter"
  | "thread"
  | "bluetooth"
  | "ethernet"
  | "usb"
  | "rf433"
  | "infrared"
  | "proprietary";

/**
 * What the manufacturer claims about the device, as opposed to what was measured. The available
 * keys vary by device type.
 */
export type DeviceSpecs = {
  socket?: string[];
  formFactor?: string;
  lumens?: number;
  ratedPower?: number;
  connectivity?: Connectivity[];
  maxLoadWatts?: number;
  powerMonitoring?: boolean;
};

export type PowerProfile = {
  manufacturer: Manufacturer;
  modelId: string;
  name: string;
  aliases: string[];
  /** Previous model directory IDs retained for canonical URL redirects. */
  legacyIds?: string[];
  deviceType: DeviceType;
  colorModes: ColorMode[];
  updatedAt?: Date | null;
  createdAt: Date;
  description: string;
  measureDevice: string;
  measureMethod: string;
  measureDescription: string;
  calculationStrategy: CalculationStrategy;
  standbyPower: number | null;
  standbyPowerOn?: number;
  maxPower?: number | null;
  authors: Author[];
  subProfileCount: number;
  minVersion?: string | null;
  compatibleIntegrations: string[];
  measureSettings?: Record<string, unknown> | null;
  measureDeviceFirmware?: string | null;
  /** How the profile is selected: automatically by "device"/"entity", or "manual" only. */
  discoveryBy?: string | null;
  onlySelfUsage?: boolean;
  /** "<manufacturer>/<model>" of the profile this one reuses measurements from. */
  linkedProfile?: string | null;
  /** Only set for LUT profiles. */
  lutQuality?: LutQuality | null;
  /** Only set for profiles measured with a device that reports voltage. */
  voltageRange?: VoltageRange | null;
  /** Nominal mains voltage the measurements were taken on, 230 or 120 in practice. */
  mainsVoltage?: number | null;
  /** Absent when a strategy only knows the top of the range, e.g. linear without calibration. */
  powerRange?: PowerRange | null;
  /** When the measurements themselves last changed, unlike `updatedAt`, which any commit moves. */
  measurementUpdatedAt?: Date | null;
  /** The standby figure is an assumed value, not something anybody measured. */
  standbyPowerEstimated?: boolean;
  deviceSpecs?: DeviceSpecs | null;
  productUrl?: string | null;
  /** Barcodes on the packaging. A model often ships under several, one per region. */
  ean: string[];
  usageStats: UsageStats;
};

export interface Manufacturer {
  dirName: string;
  fullName: string;
  /** Other names the brand ships under, e.g. "Leedarson" for Linkind. Often empty. */
  aliases: string[];
  website?: string | null;
  /** ISO 3166-1 alpha-2, which is what the flag component expects. */
  country?: string | null;
  description?: string | null;
}

export type SubProfile = {
  name: string;
  rawJson: Record<string, unknown>;
};

export interface PlotLink {
  url: string;
  label: string;
}
