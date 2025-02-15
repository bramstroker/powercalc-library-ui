import { DeviceType } from "./DeviceType";
import { ColorMode } from "./ColorMode";

export type PowerProfile = {
  manufacturer: string;
  modelId: string;
  name: string;
  aliases: string; // Cannot use string[] yet as global search won't work
  deviceType: DeviceType;
  colorModes: ColorMode[];
  updatedAt: number;
};

export type FullPowerProfile = PowerProfile & {
  rawJson: any,
  createdAt: string;
  description: string;
  measureDevice: string;
  measureMethod: string;
  measureDescription: string;
  calculationStrategy: string;
  standbyPower: number;
  standbyPowerOn?: number;
  author?: string;
  plots: PlotLink[];
};

export interface PlotLink {
  url: string;
  colorMode: ColorMode;
}
