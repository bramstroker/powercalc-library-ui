import type { PowerProfile } from "../types/PowerProfile";

/** Keep estimates and self-consumption explicit when these sentences are quoted on their own. */
export const profilePowerSummary = (profile: PowerProfile): string => {
  const device = `${profile.manufacturer.fullName} ${profile.modelId}`;
  const values: string[] = [];
  if (profile.standbyPower != null) {
    values.push(
      `${profile.standbyPower} W in standby${profile.standbyPowerEstimated ? " (estimated, not measured)" : ""}`,
    );
  }
  if (profile.standbyPowerOn != null) {
    values.push(`${profile.standbyPowerOn} W standby with the switch on`);
  }
  if (profile.maxPower != null && profile.maxPower !== profile.standbyPowerOn) {
    values.push(`a maximum of ${profile.maxPower} W`);
  }

  const sentences = [
    values.length
      ? `${device} uses ${values.length > 2 ? `${values.slice(0, -1).join(", ")} and ${values.at(-1)}` : values.join(" and ")}.`
      : `Power consumption data for ${device} is available in this Powercalc profile.`,
  ];
  if (profile.onlySelfUsage) {
    sentences.push(
      "These values cover only the device's own consumption, excluding connected appliances.",
    );
  }
  if (profile.measureDevice?.trim()) {
    sentences.push(
      `Measurement equipment: ${profile.measureDevice.trim()}${profile.mainsVoltage != null ? `; nominal mains voltage: ${profile.mainsVoltage} V` : ""}.`,
    );
  } else if (profile.mainsVoltage != null) {
    sentences.push(`Nominal mains voltage: ${profile.mainsVoltage} V.`);
  }
  return sentences.join(" ");
};
