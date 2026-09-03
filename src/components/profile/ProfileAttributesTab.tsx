import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BoltIcon from "@mui/icons-material/Bolt";
import CalculateIcon from "@mui/icons-material/Calculate";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import FactoryIcon from "@mui/icons-material/Factory";
import HistoryIcon from "@mui/icons-material/History";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LightModeIcon from "@mui/icons-material/LightMode";
import MediationIcon from "@mui/icons-material/Mediation";
import MoreIcon from "@mui/icons-material/More";
import PaletteIcon from "@mui/icons-material/Palette";
import PermDeviceInformationIcon from "@mui/icons-material/PermDeviceInformation";
import PersonIcon from "@mui/icons-material/Person";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import SettingsInputSvideoIcon from "@mui/icons-material/SettingsInputSvideo";
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
import { Button, Divider, Stack, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router";

import type { PowerProfile } from "../../types/PowerProfile";
import { formatTimestampUtc } from "../../utils/dateFormat";
import { mainsVoltageBand } from "../../utils/libraryFiltering";
import {
  colorModeLabel,
  connectivityLabel,
  humanizeIdentifier,
  productUrlLabel,
} from "../../utils/profilePresentation";
import { authorPath, manufacturerPath, profilePath } from "../../utils/urlSlugs.mjs";
import { AliasChips, ValueChips } from "../AliasChips";
import { QualityBadge } from "../library/QualityBadge";

type ItemValue = string | number | boolean | undefined | null | string[] | Record<string, unknown>;
type AttributeGroup = "device" | "power" | "measurement" | "library";

type AttributeItem = {
  label: string;
  value: ItemValue;
  icon: React.ElementType;
  group: AttributeGroup;
  filterKey?: string;
  stackValues?: boolean;
  render?: (value: ItemValue) => React.ReactNode;
  /** Converts a raw filter value into its human-readable label. */
  display?: (value: string) => string;
};

const ATTRIBUTE_GROUPS: { key: AttributeGroup; label: string }[] = [
  { key: "device", label: "Device" },
  { key: "power", label: "Power" },
  { key: "measurement", label: "Measurement" },
  { key: "library", label: "Library" },
];

/** Already visible in the profile heading or headline facts. */
const SUMMARY_ATTRIBUTE_LABELS = new Set([
  "Model ID",
  "Device type",
  "Name",
  "Max power",
  "Standby power",
]);

const MEASURE_DESCRIPTION_COLLAPSED_LINES = 4;
const MEASURE_DESCRIPTION_TOGGLE_THRESHOLD = 300;

const watts = (value: ItemValue) => `${String(value)} W`;
const volts = (value: ItemValue) => `${String(value)} V`;

const MeasureDescription = ({ description }: { description: string }) => {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = description.length > MEASURE_DESCRIPTION_TOGGLE_THRESHOLD;

  return (
    <>
      <Typography
        component="div"
        variant="body2"
        sx={
          canCollapse && !expanded
            ? {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: MEASURE_DESCRIPTION_COLLAPSED_LINES,
                overflow: "hidden",
              }
            : undefined
        }
      >
        {description}
      </Typography>
      {canCollapse && (
        <Button
          size="small"
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          aria-expanded={expanded}
          sx={{ mt: 0.5, px: 0, minWidth: 0 }}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </>
  );
};

const Timestamp = ({ date }: { date: Date }) => (
  <Box component="time" dateTime={date.toISOString()}>
    {formatTimestampUtc(date)}
  </Box>
);

const FilterLink = ({
  filterKey,
  value,
  label,
  children,
}: {
  filterKey: string;
  value: string;
  label: string;
  children: React.ReactNode;
}) => (
  <Tooltip
    title={`Show all profiles with this ${label.toLowerCase()}`}
    describeChild
    arrow
    placement="top"
  >
    <Link
      component={RouterLink}
      to={`/?${filterKey}=${encodeURIComponent(value)}`}
      prefetch="intent"
      underline="always"
      color="primary"
      sx={{ cursor: "pointer", textDecorationStyle: "dotted" }}
    >
      {children}
    </Link>
  </Tooltip>
);

const AttributeValue = ({ attribute }: { attribute: AttributeItem }) => {
  if (attribute.render && attribute.value != null) {
    return attribute.render(attribute.value);
  }

  if (attribute.label === "Aliases" && attribute.value) {
    return <AliasChips aliases={attribute.value as string[]} />;
  }

  const display = attribute.display ?? ((value: string) => value);

  if (Array.isArray(attribute.value)) {
    const values = attribute.value.map(String);
    if (attribute.stackValues) {
      return (
        <Stack component="span" spacing={0.25} sx={{ alignItems: "flex-start" }}>
          {values.map((value) => (
            <Box component="span" key={`${attribute.filterKey ?? "v"}-${value}`}>
              {attribute.filterKey ? (
                <FilterLink filterKey={attribute.filterKey} value={value} label={attribute.label}>
                  {display(value)}
                </FilterLink>
              ) : (
                display(value)
              )}
            </Box>
          ))}
        </Stack>
      );
    }

    return (
      <>
        {values.map((value, index) => (
          <React.Fragment key={`${attribute.filterKey ?? "v"}-${value}`}>
            {attribute.filterKey ? (
              <FilterLink filterKey={attribute.filterKey} value={value} label={attribute.label}>
                {display(value)}
              </FilterLink>
            ) : (
              display(value)
            )}
            {index < values.length - 1 && ", "}
          </React.Fragment>
        ))}
      </>
    );
  }

  if (attribute.filterKey && attribute.value != null) {
    return (
      <FilterLink
        filterKey={attribute.filterKey}
        value={String(attribute.value)}
        label={attribute.label}
      >
        {display(String(attribute.value))}
      </FilterLink>
    );
  }

  if (attribute.value == null || typeof attribute.value === "object") {
    return null;
  }

  return display(String(attribute.value));
};

const AttributeGrid = ({ attributes }: { attributes: AttributeItem[] }) => (
  <Stack spacing={3}>
    {ATTRIBUTE_GROUPS.map(({ key, label }) => {
      const items = attributes.filter((attribute) => attribute.group === key);
      if (items.length === 0) return null;

      const headingId = `attribute-group-${key}`;
      return (
        <Box
          component="section"
          key={key}
          data-testid="attribute-group"
          aria-labelledby={headingId}
        >
          <Typography
            component="h2"
            id={headingId}
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: ".08em", m: 0 }}
          >
            {label}
          </Typography>
          <Divider sx={{ mb: 0.5 }} />

          <Grid component="dl" container spacing={1} sx={{ m: 0 }}>
            {items.map((attribute) => (
              <Grid
                component="div"
                size={{ xs: 12, sm: 6, md: 3 }}
                key={`${attribute.label}-${attribute.filterKey ?? ""}`}
                data-testid="profile-attribute"
                sx={{
                  py: 1,
                  minWidth: 0,
                  display: "grid",
                  gridTemplateColumns: "34px minmax(0, 1fr)",
                  alignContent: "start",
                }}
              >
                <Typography
                  component="dt"
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: "34px minmax(0, 1fr)",
                    alignItems: "start",
                  }}
                >
                  <attribute.icon aria-hidden="true" fontSize="small" />
                  <Box component="span">{attribute.label}</Box>
                </Typography>
                <Box
                  component="dd"
                  sx={{
                    gridColumn: 2,
                    m: 0,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}
                >
                  <AttributeValue attribute={attribute} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    })}
  </Stack>
);

const createAttributes = (profile: PowerProfile): AttributeItem[] => [
  {
    label: "Manufacturer",
    value: profile.manufacturer.fullName,
    icon: FactoryIcon,
    group: "device",
    render: () => (
      <Tooltip title="View this manufacturer's profiles" describeChild arrow placement="top">
        <Link
          component={RouterLink}
          to={manufacturerPath(profile.manufacturer.dirName)}
          prefetch="intent"
          underline="always"
          color="primary"
          sx={{ textDecorationStyle: "dotted" }}
        >
          {profile.manufacturer.fullName}
        </Link>
      </Tooltip>
    ),
  },
  { label: "Model ID", value: profile.modelId, icon: PermDeviceInformationIcon, group: "device" },
  {
    label: "Device type",
    value: profile.deviceType,
    icon: TypeSpecimenIcon,
    group: "device",
    filterKey: "deviceType",
    display: humanizeIdentifier,
  },
  { label: "Name", value: profile.name, icon: MoreIcon, group: "device" },
  { label: "Description", value: profile.description, icon: MoreIcon, group: "device" },
  {
    label: "Created",
    value: formatTimestampUtc(profile.createdAt),
    icon: HistoryIcon,
    group: "library",
  },
  {
    label: "Updated",
    value: profile.updatedAt && formatTimestampUtc(profile.updatedAt),
    icon: HistoryIcon,
    group: "library",
    render: () => (profile.updatedAt ? <Timestamp date={profile.updatedAt} /> : null),
  },
  {
    label: "Authors",
    value: profile.authors.map((author) => author.name),
    icon: PersonIcon,
    group: "library",
    filterKey: "author",
    render: () => (
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5 }}>
        {profile.authors.map((author, index) => (
          <Tooltip
            key={author.githubUsername || `${author.name}-${index}`}
            title="View this author's profiles"
            describeChild
            arrow
            placement="top"
          >
            <Link
              component={RouterLink}
              to={authorPath(author.githubUsername)}
              underline="always"
              color="primary"
              sx={{ textDecorationStyle: "dotted" }}
            >
              {author.name}
            </Link>
          </Tooltip>
        ))}
      </Stack>
    ),
  },
  {
    label: "Calculation strategy",
    value: profile.calculationStrategy,
    icon: CalculateIcon,
    group: "measurement",
    filterKey: "calculationStrategy",
    display: humanizeIdentifier,
  },
  {
    label: "Color modes",
    value: profile.colorModes,
    icon: PaletteIcon,
    group: "device",
    filterKey: "colorMode",
    stackValues: true,
    display: colorModeLabel,
  },
  { label: "Aliases", value: profile.aliases, icon: MediationIcon, group: "device" },
  {
    label: "Socket",
    value: profile.deviceSpecs?.socket,
    icon: SettingsInputComponentIcon,
    group: "device",
    filterKey: "socket",
  },
  {
    label: "Form factor",
    value: profile.deviceSpecs?.formFactor,
    icon: LightbulbIcon,
    group: "device",
    filterKey: "formFactor",
    display: humanizeIdentifier,
  },
  {
    label: "Connectivity",
    value: profile.deviceSpecs?.connectivity,
    icon: SettingsInputSvideoIcon,
    group: "device",
    filterKey: "connectivity",
    display: connectivityLabel,
  },
  {
    label: "Barcode",
    value: profile.ean,
    icon: MoreIcon,
    group: "device",
    render: (value) => (
      <ValueChips
        values={value as string[]}
        singularLabel="barcode"
        pluralLabel="barcodes"
        description="Product barcodes found on this device's packaging."
      />
    ),
  },
  {
    label: "Product page",
    value: profile.productUrl,
    icon: MoreIcon,
    group: "device",
    render: (value) => (
      <Link href={String(value)} target="_blank" rel="noreferrer noopener">
        {productUrlLabel(String(value))}
      </Link>
    ),
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
    label: "Power monitoring",
    value: profile.deviceSpecs?.powerMonitoring,
    icon: ElectricMeterIcon,
    group: "device",
    render: (value) => (value ? "Yes" : "No"),
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
  { label: "Min version", value: profile.minVersion, icon: MoreIcon, group: "library" },
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
  {
    label: "Discovery",
    value:
      profile.discoveryBy === "manual"
        ? "Not available (manual setup only)"
        : `Automatic, by ${profile.discoveryBy ?? "entity"}`,
    icon: PermDeviceInformationIcon,
    group: "library",
  },
  {
    label: "Only self usage",
    value: profile.onlySelfUsage ? "Yes" : null,
    icon: BoltIcon,
    group: "library",
  },
  {
    label: "Linked profile",
    value: profile.linkedProfile,
    icon: MediationIcon,
    group: "device",
    render: (value) => {
      const [manufacturer, ...modelParts] = String(value).split("/");
      return (
        <Link component={RouterLink} to={profilePath(manufacturer, modelParts.join("/"))}>
          {String(value)}
        </Link>
      );
    },
  },
  {
    label: "Compatible integrations",
    value: profile.compatibleIntegrations,
    icon: MoreIcon,
    group: "library",
  },
];

export const ProfileAttributesTab = ({ profile }: { profile: PowerProfile }) => {
  const attributes = createAttributes(profile).filter(
    (attribute) =>
      attribute.value != null &&
      attribute.value !== "" &&
      !(Array.isArray(attribute.value) && attribute.value.length === 0) &&
      !SUMMARY_ATTRIBUTE_LABELS.has(attribute.label),
  );

  return <AttributeGrid attributes={attributes} />;
};
