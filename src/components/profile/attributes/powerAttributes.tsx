import BoltIcon from "@mui/icons-material/Bolt";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import LightModeIcon from "@mui/icons-material/LightMode";
import Typography from "@mui/material/Typography";

import type { PowerProfile } from "../../../types/PowerProfile";

import { watts } from "./AttributeRenderers";
import type { ProfileAttribute } from "./types";

export const createPowerAttributes = (profile: PowerProfile): ProfileAttribute[] => [
  {
    label: "Max power",
    value: profile.maxPower,
    icon: BoltIcon,
    group: "power",
    render: watts,
  },
  {
    label: "Power range",
    value: profile.powerRange?.min,
    icon: BoltIcon,
    group: "power",
    render: () =>
      profile.powerRange ? watts(`${profile.powerRange.min} – ${profile.powerRange.max}`) : null,
  },
  {
    label: "Rated power",
    value: profile.deviceSpecs?.ratedPower,
    icon: BoltIcon,
    group: "power",
    render: (value) => (
      <>
        {watts(value)}{" "}
        <Typography variant="body2" color="text.secondary" component="span">
          claimed
        </Typography>
      </>
    ),
  },
  {
    label: "Maximum load",
    value: profile.deviceSpecs?.maxLoadWatts,
    icon: ElectricalServicesIcon,
    group: "power",
    render: watts,
  },
  {
    label: "Light output",
    value: profile.deviceSpecs?.lumens,
    icon: LightModeIcon,
    group: "power",
    render: (value) => (
      <>
        {String(value)} lm
        {profile.maxPower ? (
          <Typography variant="body2" color="text.secondary" component="span">
            {" "}
            · {Math.round(Number(value) / profile.maxPower)} lm/W
          </Typography>
        ) : null}
      </>
    ),
  },
  {
    label: "Standby power",
    value: profile.standbyPower,
    icon: BoltIcon,
    group: "power",
    render: watts,
  },
  {
    label: "Standby power on",
    value: profile.standbyPowerOn,
    icon: BoltIcon,
    group: "power",
    render: watts,
  },
];
