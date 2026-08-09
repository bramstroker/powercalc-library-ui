import type { ColorMode } from "./ColorMode";
import type { DeviceType } from "./DeviceType";

export type Author = {
  name: string;
  email?: string | null;
  githubUsername: string;
}

export type UsageStats = {
  installationCount: number;
  deviceCount: number;
  percentage: number;
}

export type PowerProfile = {
  manufacturer: Manufacturer;
  modelId: string;
  name: string;
  aliases: string[];
  deviceType: DeviceType;
  colorModes: ColorMode[];
  updatedAt?: Date | null;
  createdAt: Date;
  description: string;
  measureDevice: string;
  measureMethod: string;
  measureDescription: string;
  calculationStrategy: string;
  standbyPower: number;
  standbyPowerOn?: number;
  maxPower?: number | null;
  author: Author;
  subProfileCount: number;
  minVersion?: string | null;
  compatibleIntegrations: string[];
  measureSettings?: Record<string, unknown> | null;
  measureDeviceFirmware?: string | null;
  /** Set when Powercalc can discover this model automatically, by "device" or by "entity". */
  discoveryBy?: string | null;
  onlySelfUsage?: boolean;
  /** "<manufacturer>/<model>" of the profile this one reuses measurements from. */
  linkedProfile?: string | null;
  usageStats: UsageStats;
};

export interface Manufacturer {
  dirName: string;
  fullName: string;
}

export type SubProfile = {
  name: string;
  rawJson: Record<string, unknown>
}

export type FullPowerProfile = PowerProfile & {
  rawJson: Record<string, unknown>,
  subProfiles: SubProfile[];
  plots: PlotLink[];
};

export interface PlotLink {
  url: string;
  label: string;
}
