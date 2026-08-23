import type { LibraryModel } from "../api/library.api";
import type { ColorMode } from "../types/ColorMode";
import type { DeviceType } from "../types/DeviceType";
import type { LutQuality, Manufacturer, PowerProfile, UsageStats } from "../types/PowerProfile";

const mapLutQuality = (quality: LibraryModel["lut_quality"]): LutQuality | null =>
  quality
    ? { score: quality.score, brightness: quality.brightness, colorTemp: quality.color_temp }
    : null;

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
    aliases: model.aliases ?? [],
    legacyIds: model.legacy_ids ?? [],
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
    standbyPower: model.standby_power ?? null,
    standbyPowerOn: model.standby_power_on,
    authors: (model.authors ?? []).map((author) => ({
      name: author.name,
      email: author.email,
      githubUsername: author.github,
    })),
    subProfileCount: model.sub_profile_count || 0,
    minVersion: model.min_version || null,
    compatibleIntegrations: model.compatible_integrations || [],
    measureSettings: model.measure_settings ?? null,
    measureDeviceFirmware: model.measure_device_firmware ?? null,
    discoveryBy: model.discovery_by ?? null,
    onlySelfUsage: model.only_self_usage ?? false,
    linkedProfile: model.linked_profile ?? null,
    lutQuality: mapLutQuality(model.lut_quality),
    voltageRange: model.voltage_range ?? null,
    usageStats: usageStats,
  };
};
