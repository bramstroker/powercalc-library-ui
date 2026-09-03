import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import CalculateIcon from "@mui/icons-material/Calculate";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import HistoryIcon from "@mui/icons-material/History";
import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { PowerProfile } from "../../../types/PowerProfile";
import { formatTimestampUtc } from "../../../utils/dateFormat";
import { mainsVoltageBand } from "../../../utils/libraryFiltering";
import { humanizeIdentifier } from "../../../utils/profilePresentation";
import { QualityBadge } from "../../library/QualityBadge";

import { MeasureDescription, Timestamp, volts } from "./AttributeRenderers";
import { FilterLink } from "./ProfileAttributeGrid";
import type { ProfileAttribute } from "./types";

export const createMeasurementAttributes = (profile: PowerProfile): ProfileAttribute[] => [
  {
    label: "Calculation strategy",
    value: profile.calculationStrategy,
    icon: CalculateIcon,
    group: "measurement",
    filterKey: "calculationStrategy",
    display: humanizeIdentifier,
  },
  {
    label: "Measure device",
    value: profile.measureDevice,
    icon: ElectricMeterIcon,
    group: "measurement",
    filterKey: "measureDevice",
  },
  {
    label: "Measure method",
    value: profile.measureMethod,
    icon: ElectricMeterIcon,
    group: "measurement",
    filterKey: "measureMethod",
    display: humanizeIdentifier,
  },
  {
    label: "Measure description",
    value: profile.measureDescription,
    icon: ElectricMeterIcon,
    group: "measurement",
    render: (value) => <MeasureDescription description={String(value)} />,
  },
  {
    label: "LUT quality",
    value: profile.lutQuality?.score,
    icon: AutoGraphIcon,
    group: "measurement",
    render: (value) => (
      <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <QualityBadge score={value as number} showBand />
        {profile.lutQuality?.brightness != null &&
          profile.lutQuality.colorTemp != null &&
          profile.lutQuality.brightness !== profile.lutQuality.colorTemp && (
            <Typography variant="body2" color="text.secondary" component="span">
              brightness {profile.lutQuality.brightness} · color temp {profile.lutQuality.colorTemp}
            </Typography>
          )}
      </Stack>
    ),
  },
  {
    label: "Voltage range",
    value: profile.voltageRange?.min,
    icon: ElectricalServicesIcon,
    group: "measurement",
    render: () =>
      profile.voltageRange
        ? volts(
            profile.voltageRange.min === profile.voltageRange.max
              ? String(profile.voltageRange.min)
              : `${profile.voltageRange.min} – ${profile.voltageRange.max}`,
          )
        : null,
  },
  {
    label: "Mains voltage",
    value: profile.mainsVoltage,
    icon: ElectricalServicesIcon,
    group: "measurement",
    render: () =>
      profile.mainsVoltage ? (
        <FilterLink
          filterKey="mainsVoltage"
          value={mainsVoltageBand(profile.mainsVoltage)}
          label="Mains voltage"
        >
          {volts(profile.mainsVoltage)}
        </FilterLink>
      ) : null,
  },
  {
    label: "Measurements updated",
    value: profile.measurementUpdatedAt && formatTimestampUtc(profile.measurementUpdatedAt),
    icon: HistoryIcon,
    group: "measurement",
    render: () =>
      profile.measurementUpdatedAt ? <Timestamp date={profile.measurementUpdatedAt} /> : null,
  },
  {
    label: "Measure device firmware",
    value: profile.measureDeviceFirmware,
    icon: ElectricMeterIcon,
    group: "measurement",
  },
  {
    label: "Measure settings",
    value: profile.measureSettings,
    icon: ElectricMeterIcon,
    group: "measurement",
    render: (value) => (
      <Stack component="span" spacing={0.25} sx={{ alignItems: "flex-start" }}>
        {Object.entries(value as Record<string, unknown>).map(([key, entry]) => (
          <Typography key={key} variant="body2" component="span" data-testid="measure-setting">
            <Box component="span" sx={{ fontWeight: 600 }}>
              {key}:
            </Box>{" "}
            {String(entry)}
          </Typography>
        ))}
      </Stack>
    ),
  },
];
