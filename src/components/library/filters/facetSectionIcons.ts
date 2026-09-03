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

import type { FacetKey, RangeKey } from "../../../types/LibraryFilters";

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
