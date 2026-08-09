import type { SvgIconComponent } from "@mui/icons-material";
import AirIcon from "@mui/icons-material/Air";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import BlindsIcon from "@mui/icons-material/Blinds";
import BoltIcon from "@mui/icons-material/Bolt";
import CalculateIcon from "@mui/icons-material/Calculate";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import FactoryIcon from "@mui/icons-material/Factory";
import GrassIcon from "@mui/icons-material/Grass";
import HomeIcon from "@mui/icons-material/Home";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonIcon from "@mui/icons-material/Person";
import PowerIcon from "@mui/icons-material/Power";
import PrintIcon from "@mui/icons-material/Print";
import RouterIcon from "@mui/icons-material/Router";
import SpeakerIcon from "@mui/icons-material/Speaker";
import StraightenIcon from "@mui/icons-material/Straighten";
import TuneIcon from "@mui/icons-material/Tune";
import TvIcon from "@mui/icons-material/Tv";
import VideocamIcon from "@mui/icons-material/Videocam";
import { Box, Tooltip, Typography } from "@mui/material";

import type { ColorMode } from "../../types/ColorMode";
import { DeviceType } from "../../types/DeviceType";
import type { FacetKey, RangeKey } from "../../types/LibraryFilters";

import { ColorModeIcons } from "./ColorModeIcons";

/** Section headers in the filter panel. */
export const FACET_ICONS: Record<FacetKey, SvgIconComponent> = {
  deviceType: DevicesOtherIcon,
  colorMode: PaletteIcon,
  calculationStrategy: CalculateIcon,
  measureMethod: StraightenIcon,
  manufacturer: FactoryIcon,
  measureDevice: ElectricMeterIcon,
  author: PersonIcon,
};

export const RANGE_ICONS: Record<RangeKey, SvgIconComponent> = {
  standbyPower: BedtimeIcon,
  maxPower: BoltIcon,
  installationCount: HomeIcon,
};

export const SECTION_ICONS: Record<"dates", SvgIconComponent> = {
  dates: CalendarMonthIcon,
};

const DEVICE_TYPE_ICONS: Partial<Record<DeviceType, SvgIconComponent>> = {
  [DeviceType.CAMERA]: VideocamIcon,
  [DeviceType.COVER]: BlindsIcon,
  [DeviceType.FAN]: AirIcon,
  [DeviceType.GENERIC_IOT]: DeviceHubIcon,
  [DeviceType.HEATING]: LocalFireDepartmentIcon,
  [DeviceType.LAWN_MOWER_ROBOT]: GrassIcon,
  [DeviceType.LIGHT]: LightbulbIcon,
  [DeviceType.NETWORK]: RouterIcon,
  [DeviceType.POWER_METER]: ElectricMeterIcon,
  [DeviceType.PRINTER]: PrintIcon,
  [DeviceType.SMART_DIMMER]: TuneIcon,
  [DeviceType.SMART_SPEAKER]: SpeakerIcon,
  [DeviceType.SMART_SWITCH]: PowerIcon,
  [DeviceType.TELEVISION]: TvIcon,
  [DeviceType.UPS]: BatteryChargingFullIcon,
  [DeviceType.VACUUM_ROBOT]: CleaningServicesIcon,
};

/** The icon for a device type, or undefined for one this map has not caught up with yet. */
export const getDeviceTypeIcon = (deviceType: string): SvgIconComponent | undefined =>
  DEVICE_TYPE_ICONS[deviceType as DeviceType];

/**
 * The device type as its icon, with the raw value one hover away. Falls back to plain text for a
 * type the API added before this map caught up.
 */
export const DeviceTypeIcon = ({ deviceType }: { deviceType: string }) => {
  const Icon = getDeviceTypeIcon(deviceType);
  return (
    // A bare icon sits on the text baseline and rides high in a grid cell, so it needs its own
    // full-height flex box to centre against the row.
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "text.secondary",
      }}
    >
      {Icon ? (
        <Tooltip title={deviceType}>
          <Icon fontSize="small" titleAccess={deviceType} />
        </Tooltip>
      ) : (
        <Typography variant="body2" noWrap>
          {deviceType}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Per-option icon for the facets where one exists. Unknown values — a device type the API added
 * before this map caught up — fall back to a blank spacer so the labels stay aligned.
 */
export const renderFacetOptionIcon = (key: FacetKey, value: string) => {
  if (key === "deviceType") {
    const Icon = DEVICE_TYPE_ICONS[value as DeviceType];
    return Icon ? (
      <Icon fontSize="small" sx={{ color: "text.secondary" }} />
    ) : (
      <Box sx={{ width: 20 }} />
    );
  }
  if (key === "colorMode") {
    return <ColorModeIcons colorModes={[value as ColorMode]} />;
  }
  return null;
};
