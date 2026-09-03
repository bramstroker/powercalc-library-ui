import type { PowerProfile } from "../../../types/PowerProfile";

export const profileRowId = (profile: PowerProfile) =>
  `${profile.manufacturer.dirName}/${profile.modelId}`;
