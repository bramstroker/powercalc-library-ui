import type { SvgIconComponent } from "@mui/icons-material";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import BoltIcon from "@mui/icons-material/Bolt";
import CalculateIcon from "@mui/icons-material/Calculate";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import FactoryIcon from "@mui/icons-material/Factory";
import HomeIcon from "@mui/icons-material/Home";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LightModeIcon from "@mui/icons-material/LightMode";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonIcon from "@mui/icons-material/Person";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import SettingsInputSvideoIcon from "@mui/icons-material/SettingsInputSvideo";
import StraightenIcon from "@mui/icons-material/Straighten";
import { Box } from "@mui/material";

import type { ColorMode } from "../../../types/ColorMode";
import type { FacetKey, RangeKey } from "../../../types/LibraryFilters";
import type { Connectivity } from "../../../types/PowerProfile";
import { getDeviceTypeIcon } from "../../profile/DeviceTypeIcon";
import { ColorModeIcons } from "../presentation/ColorModeIcons";
import { ConnectivityIcons } from "../presentation/ConnectivityIcons";

/** Section headers in the filter panel. */
export const FACET_ICONS: Record<FacetKey, SvgIconComponent> = {
  deviceType: DevicesOtherIcon,
  colorMode: PaletteIcon,
  qualityBand: AutoGraphIcon,
  calculationStrategy: CalculateIcon,
  measureMethod: StraightenIcon,
  manufacturer: FactoryIcon,
  measureDevice: ElectricMeterIcon,
  author: PersonIcon,
  socket: SettingsInputComponentIcon,
  formFactor: LightbulbIcon,
  connectivity: SettingsInputSvideoIcon,
  mainsVoltage: ElectricalServicesIcon,
};

export const RANGE_ICONS: Record<RangeKey, SvgIconComponent> = {
  standbyPower: BedtimeIcon,
  maxPower: BoltIcon,
  lumens: LightModeIcon,
  installationCount: HomeIcon,
};

export const SECTION_ICONS: Record<"dates", SvgIconComponent> = {
  dates: CalendarMonthIcon,
};

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
