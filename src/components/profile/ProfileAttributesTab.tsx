import type { PowerProfile } from "../../types/PowerProfile";

import { createDeviceAttributes } from "./attributes/deviceAttributes";
import { createLibraryAttributes } from "./attributes/libraryAttributes";
import { createMeasurementAttributes } from "./attributes/measurementAttributes";
import { createPowerAttributes } from "./attributes/powerAttributes";
import { ProfileAttributeGrid } from "./attributes/ProfileAttributeGrid";
import { isVisibleProfileAttribute } from "./attributes/types";

export const ProfileAttributesTab = ({ profile }: { profile: PowerProfile }) => {
  const attributes = [
    ...createDeviceAttributes(profile),
    ...createPowerAttributes(profile),
    ...createMeasurementAttributes(profile),
    ...createLibraryAttributes(profile),
  ].filter(isVisibleProfileAttribute);

  return <ProfileAttributeGrid attributes={attributes} />;
};
