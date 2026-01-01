import type { ColorMode } from "./ColorMode";
import type { DeviceType } from "./DeviceType";

export type PowerProfile = {
  manufacturer: Manufacturer;
  modelId: string;
  name: string;
  aliases: string; // Cannot use string[] yet as global search won't work
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
  maxPower?: number;
  author?: string;
  subProfileCount: number;
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
