import type { LibraryModel } from "../api/library.api";
import type { ColorMode } from "../types/ColorMode";
import type { DeviceType } from "../types/DeviceType";
import type {Manufacturer, PowerProfile, UsageStats} from "../types/PowerProfile";

/**
 * Maps library model data to a PowerProfile object
 */
export const mapToBasePowerProfile = (
  model: LibraryModel,
  manufacturer: Manufacturer,
  usageStats: UsageStats,
): PowerProfile => {
  return {
    manufacturer,
    modelId: model.id,
    name: model.name,
    aliases: model.aliases?.join("|") || "",
    deviceType: model.device_type as DeviceType,
    colorModes: (model.color_modes || []) as ColorMode[],
    updatedAt: new Date(model.updated_at),
    createdAt: new Date(model.created_at),
    description: model.description,
    measureDevice: model.measure_device,
    measureMethod: model.measure_method,
    measureDescription: model.measure_description,
    calculationStrategy: model.calculation_strategy,
    maxPower: model.max_power !== undefined && model.max_power > 0 ? model.max_power : null,
    standbyPower: model.standby_power,
    standbyPowerOn: model.standby_power_on,
    author: {
      name: model.author_info?.name ?? '',
      email: model.author_info?.email,
      githubUsername: model.author_info?.github ?? '',
    },
    subProfileCount: model.sub_profile_count || 0,
    minVersion: model.min_version || null,
    compatibleIntegrations: model.compatible_integrations || [],
    usageStats: usageStats
  };
}