import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import FactoryIcon from "@mui/icons-material/Factory";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MediationIcon from "@mui/icons-material/Mediation";
import MoreIcon from "@mui/icons-material/More";
import PaletteIcon from "@mui/icons-material/Palette";
import PermDeviceInformationIcon from "@mui/icons-material/PermDeviceInformation";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import SettingsInputSvideoIcon from "@mui/icons-material/SettingsInputSvideo";
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
import { Tooltip } from "@mui/material";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";

import type { PowerProfile } from "../../../types/PowerProfile";
import {
  colorModeLabel,
  connectivityLabel,
  humanizeIdentifier,
  productUrlLabel,
} from "../../../utils/profilePresentation";
import { manufacturerPath, profilePath } from "../../../utils/urlSlugs.mjs";
import { ValueChips } from "../AliasChips";

import type { ProfileAttribute } from "./types";

export const createDeviceAttributes = (profile: PowerProfile): ProfileAttribute[] => [
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
    label: "Power monitoring",
    value: profile.deviceSpecs?.powerMonitoring,
    icon: ElectricMeterIcon,
    group: "device",
    render: (value) => (value ? "Yes" : "No"),
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
];
