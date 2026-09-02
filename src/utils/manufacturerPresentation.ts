import type { Manufacturer, PowerProfile } from "../types/PowerProfile";

import { humanizeIdentifier } from "./profilePresentation";

const listFormat = new Intl.ListFormat("en-US", { style: "long", type: "conjunction" });

const deviceTypeCoverageLabel = (deviceType: string) => {
  const label = humanizeIdentifier(deviceType).toLocaleLowerCase("en-US");

  if (deviceType === "generic_iot") return "generic IoT devices";
  if (deviceType === "heating") return "heating devices";
  if (deviceType === "ups") return "UPS devices";
  if (label.endsWith("box") || label.endsWith("switch")) return `${label}es`;

  return `${label}s`;
};

export const manufacturerLibraryIntroduction = (
  manufacturer: Manufacturer,
  profiles: PowerProfile[],
) => {
  const deviceTypes = [
    ...new Set(profiles.map((profile) => deviceTypeCoverageLabel(profile.deviceType))),
  ].sort((a, b) => a.localeCompare(b));
  const coverage =
    deviceTypes.length > 0
      ? `Current library coverage includes ${listFormat.format(deviceTypes)}.`
      : "Profiles will appear here as they are contributed to the library.";
  const libraryContext = `Browse community-contributed Powercalc measurements for products from ${manufacturer.fullName}, with per-model calculation details and measured power data where available.`;

  return `${libraryContext} ${coverage}`;
};

export const manufacturerIntroduction = (manufacturer: Manufacturer, profiles: PowerProfile[]) =>
  [manufacturer.description?.trim(), manufacturerLibraryIntroduction(manufacturer, profiles)]
    .filter(Boolean)
    .join(" ");
