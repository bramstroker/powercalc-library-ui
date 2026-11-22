import { DeviceType } from "../../types/DeviceType";

/** Opens the Powercalc config flow in the reader's own Home Assistant instance. */
export const MY_HA_CONFIG_FLOW_URL =
  "https://my.home-assistant.io/redirect/config_flow_start/?domain=powercalc";

const EXAMPLE_ENTITY_IDS: Record<DeviceType, string> = {
  [DeviceType.AIR_CONDITIONER]: "climate.my_air_conditioner",
  [DeviceType.AIR_PURIFIER]: "fan.my_air_purifier",
  [DeviceType.CAMERA]: "camera.my_camera",
  [DeviceType.COVER]: "cover.my_cover",
  [DeviceType.FAN]: "fan.my_fan",
  [DeviceType.GENERIC_IOT]: "sensor.my_sensor",
  [DeviceType.HEATING]: "climate.my_heater",
  [DeviceType.HUMIDIFIER]: "humidifier.my_humidifier",
  [DeviceType.LAWN_MOWER_ROBOT]: "lawn_mower.my_lawn_mower",
  [DeviceType.LIGHT]: "light.my_light",
  [DeviceType.NETWORK]: "binary_sensor.my_router",
  [DeviceType.POWER_METER]: "sensor.my_power_meter",
  [DeviceType.PRINTER]: "sensor.my_printer",
  [DeviceType.SET_TOP_BOX]: "media_player.my_set_top_box",
  [DeviceType.SMART_DIMMER]: "light.my_dimmer",
  [DeviceType.SMART_SPEAKER]: "media_player.my_speaker",
  [DeviceType.SMART_SWITCH]: "switch.my_switch",
  [DeviceType.TELEVISION]: "media_player.my_tv",
  [DeviceType.UPS]: "sensor.my_ups",
  [DeviceType.VACUUM_ROBOT]: "vacuum.my_vacuum",
  [DeviceType.WATER_HEATER]: "water_heater.my_water_heater",
};

export const getExampleEntityId = (deviceType: DeviceType): string =>
  Object.hasOwn(EXAMPLE_ENTITY_IDS, deviceType)
    ? EXAMPLE_ENTITY_IDS[deviceType]
    : EXAMPLE_ENTITY_IDS[DeviceType.GENERIC_IOT];

/**
 * Builds the YAML a Home Assistant user pastes into configuration.yaml.
 * Sub-profiles are appended to the model with a slash, per the Powercalc docs.
 */
export const buildSensorYaml = ({
  manufacturerDir,
  modelId,
  subProfile,
  entityId,
}: {
  manufacturerDir: string;
  modelId: string;
  subProfile?: string;
  entityId: string;
}): string => {
  const model = subProfile ? `${modelId}/${subProfile}` : modelId;
  return [
    "powercalc:",
    "  sensors:",
    `    - entity_id: ${entityId}`,
    `      manufacturer: ${manufacturerDir}`,
    `      model: ${model}`,
  ].join("\n");
};
