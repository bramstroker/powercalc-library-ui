import type { SvgIconComponent } from "@mui/icons-material";
import BluetoothIcon from "@mui/icons-material/Bluetooth";
import CableIcon from "@mui/icons-material/Cable";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import HubIcon from "@mui/icons-material/Hub";
import LanIcon from "@mui/icons-material/Lan";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import SensorsIcon from "@mui/icons-material/Sensors";
import SettingsRemoteIcon from "@mui/icons-material/SettingsRemote";
import WifiIcon from "@mui/icons-material/Wifi";
import { Stack, Tooltip } from "@mui/material";

import type { Connectivity } from "../../types/PowerProfile";
import { connectivityLabel } from "../../utils/profilePresentation";

const ICONS = {
  zigbee: HubIcon,
  wifi: WifiIcon,
  zwave: SensorsIcon,
  matter: ScatterPlotIcon,
  thread: DeviceHubIcon,
  bluetooth: BluetoothIcon,
  ethernet: LanIcon,
  rf433: SensorsIcon,
  infrared: SettingsRemoteIcon,
  proprietary: CableIcon,
} satisfies Record<Connectivity, SvgIconComponent>;

export const ConnectivityIcons = ({ connectivity }: { connectivity: Connectivity[] }) => {
  if (connectivity.length === 0) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", height: "100%", color: "text.secondary" }}
    >
      {connectivity.map((protocol, index) => {
        const Icon = ICONS[protocol];
        const title = connectivityLabel(protocol);

        return (
          <Tooltip key={`${protocol}-${index}`} title={title} describeChild>
            <Icon fontSize="small" aria-label={title} />
          </Tooltip>
        );
      })}
    </Stack>
  );
};
