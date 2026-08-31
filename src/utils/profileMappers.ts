import type { LibraryModel } from "../api/library.api";
import type { ColorMode } from "../types/ColorMode";
import type { DeviceType } from "../types/DeviceType";
import type {
  DeviceSpecs,
  LutQuality,
  Manufacturer,
  PowerProfile,
  UsageStats,
} from "../types/PowerProfile";

const mapLutQuality = (quality: LibraryModel["lut_quality"]): LutQuality | null =>
  quality
    ? { score: quality.score, brightness: quality.brightness, colorTemp: quality.color_temp }
    : null;

const mapDeviceSpecs = (specs: LibraryModel["device_specs"]): DeviceSpecs | null =>
  specs
    ? {
        socket: specs.socket
          ? Array.isArray(specs.socket)
            ? specs.socket
            : [specs.socket]
          : undefined,
        formFactor: specs.form_factor,
        lumens: specs.lumens,
        ratedPower: specs.rated_power,
        connectivity: specs.connectivity ?? [],
        maxLoadWatts: specs.max_load_watts,
        powerMonitoring: specs.power_monitoring,
      }
    : null;

/**
 * The nominal supply the profile was measured on. Most profiles state neither, but the ones that
 * recorded a `voltage_range` carry the answer in it — a measurement centred on 232 V was taken on
 * a 230 V supply. Rounding that to the nearest standard here keeps the guesswork in presentation
 * rather than baking a derived number into the library.
 */
const NOMINAL_MAINS_VOLTAGES = [100, 110, 120, 127, 220, 230, 240];

const mapMainsVoltage = (model: LibraryModel): number | null => {
  if (model.mains_voltage) return model.mains_voltage;
  if (!model.voltage_range) return null;

  const midpoint = (model.voltage_range.min + model.voltage_range.max) / 2;
  return NOMINAL_MAINS_VOLTAGES.reduce((closest, nominal) =>
    Math.abs(nominal - midpoint) < Math.abs(closest - midpoint) ? nominal : closest,
  );
};

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
    mainsVoltage: mapMainsVoltage(model),
    powerRange: model.power_range ?? null,
    measurementUpdatedAt: model.measurement_updated_at
      ? new Date(model.measurement_updated_at)
      : null,
    standbyPowerEstimated: model.standby_power_estimated ?? false,
    deviceSpecs: mapDeviceSpecs(model.device_specs),
    productUrl: model.product_url ?? null,
    ean: model.ean ?? [],
    usageStats: usageStats,
  };
};
