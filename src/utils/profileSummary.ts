import type { PowerProfile, ProfileSummary } from "../types/PowerProfile";

/** Do not serialize measurement descriptions/settings into every collection's loader payload. */
export const profileSummary = (profile: PowerProfile): ProfileSummary => ({
  manufacturer: profile.manufacturer,
  modelId: profile.modelId,
  name: profile.name,
  aliases: profile.aliases,
  deviceType: profile.deviceType,
  createdAt: profile.createdAt,
  calculationStrategy: profile.calculationStrategy,
  standbyPower: profile.standbyPower,
  maxPower: profile.maxPower,
  usageStats: profile.usageStats,
});
