import { DeviceType } from "../types/DeviceType";
import type { PowerProfile } from "../types/PowerProfile";
import { numberFormat } from "../utils/formatters";
import { humanizeIdentifier } from "../utils/profilePresentation";
import { deviceTypePath } from "../utils/urlSlugs.mjs";

export type ProfileCategoryConfig = {
  indexPath: "/device-types";
  indexTitle: string;
  indexDescription: string;
  breadcrumbLabel: string;
  values: (profile: PowerProfile) => string[];
  label: (value: string) => string;
  path: (value: string) => string;
  introduction: (value: string) => string;
  description: (value: string, label: string, profileCount: number) => string;
};

const formattedCount = (count: number) => numberFormat.format(count);

const DEVICE_TYPE_INTRODUCTIONS: Record<DeviceType, string> = {
  [DeviceType.AIR_CONDITIONER]:
    "Compare air-conditioner profiles across standby, cooling, heating, and fan modes to understand how their demand changes in operation.",
  [DeviceType.AIR_PURIFIER]:
    "Explore air-purifier profiles across idle and fan-speed settings, including the continuous power used while filtering indoor air.",
  [DeviceType.CAMERA]:
    "Compare profiles for connected cameras, doorbells, and related imaging hardware whose idle and active modes can have very different power use.",
  [DeviceType.COVER]:
    "Find measurements for powered blinds, shades, curtains, and other motorised covers across their resting and moving states.",
  [DeviceType.FAN]:
    "Explore fan profiles that capture how power use changes between standby and the speed settings exposed by connected controllers.",
  [DeviceType.GENERIC_IOT]:
    "Explore connected hardware that does not fit a narrower device class, including hubs, controllers, and purpose-built smart devices.",
  [DeviceType.HEATING]:
    "Compare heating-device profiles for thermostats, electric heaters, and related climate equipment with distinct idle and heating demand.",
  [DeviceType.HUMIDIFIER]:
    "Browse humidifier profiles across standby and output settings for devices that regulate indoor humidity over extended periods.",
  [DeviceType.LAWN_MOWER_ROBOT]:
    "Find robotic lawn-mower profiles covering devices that alternate between charging, docked, and autonomous operating states.",
  [DeviceType.LIGHT]:
    "Browse measured profiles for smart bulbs, fixtures, light strips, and controllers across brightness and supported colour settings.",
  [DeviceType.POWER_METER]:
    "Explore the self-consumption of power meters and monitoring hardware that stay energised while measuring other devices or circuits.",
  [DeviceType.PRINTER]:
    "Compare printer profiles across standby, ready, and working states for equipment whose short active peaks can differ sharply from idle use.",
  [DeviceType.NETWORK]:
    "Find profiles for routers, access points, switches, and other network equipment designed to remain powered around the clock.",
  [DeviceType.SET_TOP_BOX]:
    "Browse set-top box and media receiver profiles, including devices with meaningful differences between active playback and standby.",
  [DeviceType.SMART_DIMMER]:
    "Explore smart dimmer profiles for modules and wall controls that regulate a separate lighting load while drawing power themselves.",
  [DeviceType.SMART_SPEAKER]:
    "Compare connected speaker and voice-assistant profiles across listening, playback, and idle behaviour.",
  [DeviceType.SMART_SWITCH]:
    "Browse smart plugs, relays, and wall switches, including the power used by the controller independently of its connected load.",
  [DeviceType.TELEVISION]:
    "Find television profiles that distinguish low standby consumption from the changing demand of an active display.",
  [DeviceType.UPS]:
    "Explore uninterruptible power supply profiles, where charging losses and the protected load can affect measured consumption.",
  [DeviceType.VACUUM_ROBOT]:
    "Compare robotic vacuum profiles across docked, charging, and cleaning states instead of relying on a single rated-power figure.",
  [DeviceType.WATER_HEATER]:
    "Compare water-heater profiles across standby and active heating states, where storage losses and heating cycles shape overall consumption.",
};

const deviceTypeIntroduction = (value: string) =>
  DEVICE_TYPE_INTRODUCTIONS[value as DeviceType] ??
  `Explore community-contributed measurements for ${humanizeIdentifier(value).toLocaleLowerCase("en-US")} devices.`;

export const categoryProfileCountDescription = (count: number) =>
  `This category contains ${formattedCount(count)} community-contributed Powercalc power measurement ${count === 1 ? "profile" : "profiles"}.`;

export const DEVICE_TYPE_CATEGORY: ProfileCategoryConfig = {
  indexPath: "/device-types",
  indexTitle: "Device types",
  indexDescription:
    "Browse Powercalc power measurement profiles by device type, from smart lights and switches to appliances and network equipment.",
  breadcrumbLabel: "Device types",
  values: (profile) => [profile.deviceType],
  label: humanizeIdentifier,
  path: deviceTypePath,
  introduction: deviceTypeIntroduction,
  description: (value, _label, count) =>
    `${deviceTypeIntroduction(value)} ${categoryProfileCountDescription(count)}`,
};
