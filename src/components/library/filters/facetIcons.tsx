import { Box } from "@mui/material";

import type { ColorMode } from "../../../types/ColorMode";
import type { FacetKey } from "../../../types/LibraryFilters";
import type { Connectivity } from "../../../types/PowerProfile";
import { getDeviceTypeIcon } from "../../profile/DeviceTypeIcon";
import { ColorModeIcons } from "../presentation/ColorModeIcons";
import { ConnectivityIcons } from "../presentation/ConnectivityIcons";

/**
 * Per-option icon for the facets where one exists. Unknown values — a device type the API added
 * before this map caught up — fall back to a blank spacer so the labels stay aligned.
 */
export const renderFacetOptionIcon = (key: FacetKey, value: string) => {
  if (key === "deviceType") {
    const Icon = getDeviceTypeIcon(value);
    return Icon ? (
      <Icon fontSize="small" sx={{ color: "text.secondary" }} />
    ) : (
      <Box sx={{ width: 20 }} />
    );
  }
  if (key === "colorMode") {
    return <ColorModeIcons colorModes={[value as ColorMode]} />;
  }
  if (key === "connectivity") {
    return <ConnectivityIcons connectivity={[value as Connectivity]} />;
  }
  return null;
};
