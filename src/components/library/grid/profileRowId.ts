import type { PowerProfile } from "../../../types/PowerProfile";

export const profileRowId = (profile: Pick<PowerProfile, "manufacturer" | "modelId">) =>
  `${profile.manufacturer.dirName}/${profile.modelId}`;
