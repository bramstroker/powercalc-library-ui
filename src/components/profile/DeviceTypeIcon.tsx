import type { SvgIconComponent } from "@mui/icons-material";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import AirIcon from "@mui/icons-material/Air";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import BlindsIcon from "@mui/icons-material/Blinds";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import DvrIcon from "@mui/icons-material/Dvr";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import GrassIcon from "@mui/icons-material/Grass";
import HeatPumpIcon from "@mui/icons-material/HeatPump";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PowerIcon from "@mui/icons-material/Power";
import PrintIcon from "@mui/icons-material/Print";
import RouterIcon from "@mui/icons-material/Router";
import SpeakerIcon from "@mui/icons-material/Speaker";
import TuneIcon from "@mui/icons-material/Tune";
import TvIcon from "@mui/icons-material/Tv";
import VideocamIcon from "@mui/icons-material/Videocam";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { Box, Tooltip, Typography } from "@mui/material";

import { DeviceType } from "../../types/DeviceType";

const DEVICE_TYPE_ICONS: Record<DeviceType, SvgIconComponent> = {
  [DeviceType.AIR_CONDITIONER]: AcUnitIcon,
  [DeviceType.AIR_PURIFIER]: BlurOnIcon,
  [DeviceType.CAMERA]: VideocamIcon,
  [DeviceType.COVER]: BlindsIcon,
  [DeviceType.FAN]: AirIcon,
  [DeviceType.GENERIC_IOT]: DeviceHubIcon,
  [DeviceType.HEATING]: LocalFireDepartmentIcon,
  [DeviceType.HUMIDIFIER]: WaterDropIcon,
  [DeviceType.LAWN_MOWER_ROBOT]: GrassIcon,
  [DeviceType.LIGHT]: LightbulbIcon,
  [DeviceType.NETWORK]: RouterIcon,
  [DeviceType.POWER_METER]: ElectricMeterIcon,
  [DeviceType.PRINTER]: PrintIcon,
  [DeviceType.SET_TOP_BOX]: DvrIcon,
  [DeviceType.SMART_DIMMER]: TuneIcon,
  [DeviceType.SMART_SPEAKER]: SpeakerIcon,
  [DeviceType.SMART_SWITCH]: PowerIcon,
  [DeviceType.TELEVISION]: TvIcon,
  [DeviceType.UPS]: BatteryChargingFullIcon,
  [DeviceType.VACUUM_ROBOT]: CleaningServicesIcon,
  [DeviceType.WATER_HEATER]: HeatPumpIcon,
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
