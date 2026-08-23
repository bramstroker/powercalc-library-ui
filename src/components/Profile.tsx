import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import BoltIcon from "@mui/icons-material/Bolt";
import CalculateIcon from "@mui/icons-material/Calculate";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FactoryIcon from "@mui/icons-material/Factory";
import GithubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import HomeIcon from "@mui/icons-material/Home";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import MediationIcon from "@mui/icons-material/Mediation";
import MoreIcon from "@mui/icons-material/More";
import PaletteIcon from "@mui/icons-material/Palette";
import PermDeviceInformationIcon from "@mui/icons-material/PermDeviceInformation";
import PersonIcon from "@mui/icons-material/Person";
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  List,
  ListItemButton,
  Collapse,
  IconButton,
  Card,
  CardContent,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useLocation, useNavigate, useSearchParams, Link as RouterLink } from "react-router";

import type { Summary } from "../api/analytics.api";
import {
  profileJsonQuery,
  profilePlotsQuery,
  subProfilesQuery,
} from "../queries/profileDetails.query";
import type { BreadcrumbItem } from "../seo/breadcrumbs";
import type { PowerProfile } from "../types/PowerProfile";
import { formatTimestampUtc } from "../utils/dateFormat";
import { colorModeLabel, humanizeIdentifier } from "../utils/profilePresentation";
import { authorPath, manufacturerPath, profilePath as getProfilePath } from "../utils/urlSlugs.mjs";

import { AliasChips } from "./AliasChips";
import { getDeviceTypeIcon } from "./library/facetIcons";
import { ProfileSetup } from "./library/ProfileSetup";
import { QualityBadge } from "./library/QualityBadge";
import { ManufacturerLogo } from "./ManufacturerLogo";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { Plot } from "./Plot";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ px: { xs: 0, sm: 3 }, py: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

type ItemValueType =
  string | number | boolean | undefined | null | string[] | Record<string, unknown>;

/** Power figures are watts; the unit belongs next to the number, not only in the headline. */
const watts = (value: ItemValueType) => `${String(value)} W`;
const volts = (value: ItemValueType) => `${String(value)} V`;

type AttributeGroup = "device" | "power" | "measurement" | "library";

/** Section order and headings for the attributes tab. */
const ATTRIBUTE_GROUPS: { key: AttributeGroup; label: string }[] = [
  { key: "device", label: "Device" },
  { key: "power", label: "Power" },
  { key: "measurement", label: "Measurement" },
  { key: "library", label: "Library" },
];

/** Already visible in the profile heading or headline facts. */
const SUMMARY_PROPERTY_LABELS = new Set([
  "Model ID",
  "Device type",
  "Name",
  "Max power",
  "Standby power",
]);

interface PropertyItem {
  label: string;
  value: ItemValueType;
  icon: React.ElementType;
  group: AttributeGroup;
  filterKey?: string;
  stackValues?: boolean;
  renderFn?: (value: ItemValueType) => React.ReactNode;
  /**
   * Turns a raw identifier into the label a reader should see — `smart_switch` into "Smart
   * Switch". Display only: the filter link keeps the raw value, which is what the library query
   * expects.
   */
  display?: (value: string) => string;
}

const MEASURE_DESCRIPTION_COLLAPSED_LINES = 4;
const MEASURE_DESCRIPTION_TOGGLE_THRESHOLD = 300;

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

/*
 * Everything below renders inside `Profile` but is declared here on purpose. A component defined
 * in a render body is a new type on every render, so React unmounts and remounts its whole subtree
 * — losing the tab state, the copy confirmations and the "Show more" toggles every time the page
 * re-renders, and refetching nothing only because React Query caches across the remount.
 */

type FilterLinkProps = {
  filterKey: string;
  value: string;
  label: string;
  children: React.ReactNode;
};
/**
 * Coloured and underlined rather than styled as plain text — otherwise there is nothing to tell
 * the clickable attributes apart from the inert ones sitting right next to them.
 *
 * `describeChild` matters: without it MUI labels the child with the tooltip, so the link would
 * announce as "Show all profiles with this manufacturer" instead of "Signify".
 */
const FilterLink = ({ filterKey, value, label, children }: FilterLinkProps) => {
  return (
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
};

const PropertyValue = ({ property }: { property: PropertyItem }) => {
  if (property.renderFn && property.value != null) {
    return property.renderFn(property.value);
  }

  if (property.label === "Aliases" && property.value) {
    return <AliasChips aliases={property.value as string[]} marginTop={1} wrap />;
  }

  const display = property.display ?? ((value: string) => value);

  if (Array.isArray(property.value)) {
    const values = property.value.map(String);
    if (property.stackValues) {
      return (
        <Stack component="span" spacing={0.25} sx={{ alignItems: "flex-start" }}>
          {values.map((value) => (
            <Box component="span" key={`${property.filterKey ?? "v"}-${value}`}>
              {property.filterKey ? (
                <FilterLink filterKey={property.filterKey} value={value} label={property.label}>
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
        {values.map((v: string, i: number) => (
          <React.Fragment key={`${property.filterKey ?? "v"}-${v}`}>
            {property.filterKey ? (
              <FilterLink filterKey={property.filterKey} value={v} label={property.label}>
                {display(v)}
              </FilterLink>
            ) : (
              display(v)
            )}
            {i < values.length - 1 && ", "}
          </React.Fragment>
        ))}
      </>
    );
  }

  if (property.filterKey && property.value != null) {
    return (
      <FilterLink
        filterKey={property.filterKey}
        value={String(property.value)}
        label={property.label}
      >
        {display(String(property.value))}
      </FilterLink>
    );
  }

  if (property.value == null || typeof property.value === "object") {
    // Objects only render through a renderFn of their own; there is nothing sensible to print.
    return null;
  }

  return display(String(property.value));
};

type AttributesTabProps = { properties: PropertyItem[] };
/**
 * Grouped into sections so related attributes sit together. Items flow left to right within a
 * section, which is the natural Grid order — no round-robin dealing needed.
 */
const AttributesTab = ({ properties }: AttributesTabProps) => (
  <Stack spacing={3}>
    {ATTRIBUTE_GROUPS.map(({ key, label }) => {
      const items = properties.filter((property) => property.group === key);
      if (items.length === 0) {
        return null;
      }

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
            {items.map((property) => (
              <Grid
                component="div"
                size={{ xs: 12, sm: 6, md: 3 }}
                key={`${property.label}-${property.filterKey ?? ""}`}
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
                  <property.icon aria-hidden="true" fontSize="small" />
                  <Box component="span">{property.label}</Box>
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
                  <PropertyValue property={property} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    })}
  </Stack>
);

const LoadingDetails = () => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 2 }}>
    <CircularProgress size={22} />
    <Typography color="text.secondary">Loading profile details…</Typography>
  </Stack>
);

const DetailsError = () => (
  <Alert severity="error">The profile details could not be loaded. Please try again.</Alert>
);

type JsonTabProps = { profile: PowerProfile };
const JsonTab = ({ profile }: JsonTabProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const { data: rawJson, isPending, isError } = useQuery(profileJsonQuery(profile));

  if (isPending) return <LoadingDetails />;
  if (isError) return <DetailsError />;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rawJson, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Paper sx={{ p: 2, position: "relative" }}>
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
        <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"} arrow>
          <IconButton
            onClick={() => void handleCopy()}
            size="small"
            color={copySuccess ? "success" : "default"}
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box component="pre" sx={{ m: 0, overflow: "auto" }}>
        {JSON.stringify(rawJson, null, 2)}
      </Box>
    </Paper>
  );
};

type SubProfilesTabProps = {
  profile: PowerProfile;
};
const SubProfilesTab = ({ profile }: SubProfilesTabProps) => {
  const [copySuccessMap, setCopySuccessMap] = useState<Record<string, boolean>>({});
  const [expandedSubProfiles, setExpandedSubProfiles] = useState<Record<string, boolean>>({});
  const { data: subProfiles, isPending, isError } = useQuery(subProfilesQuery(profile));

  const toggleSubProfile = (name: string) => {
    setExpandedSubProfiles((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  if (isPending) return <LoadingDetails />;
  if (isError) return <DetailsError />;

  const handleCopy = async (name: string, json: Record<string, unknown>) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopySuccessMap((prev) => ({ ...prev, [name]: true }));
      setTimeout(() => {
        setCopySuccessMap((prev) => ({ ...prev, [name]: false }));
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <List component="nav" aria-label="sub profiles">
      {subProfiles.map((subProfile) => (
        <React.Fragment key={subProfile.name}>
          {/*
           * The chevron is decorative: an IconButton here would nest a control inside the
           * row's own button, giving keyboard users a second stop announced as "expand"
           * that only worked by event bubbling. The row carries the state instead.
           */}
          <ListItemButton
            onClick={() => toggleSubProfile(subProfile.name)}
            aria-expanded={Boolean(expandedSubProfiles[subProfile.name])}
            aria-controls={`sub-profile-${subProfile.name}`}
          >
            <ListItemText primary={subProfile.name} />
            {expandedSubProfiles[subProfile.name] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse
            in={expandedSubProfiles[subProfile.name]}
            id={`sub-profile-${subProfile.name}`}
            timeout="auto"
            unmountOnExit
          >
            <Paper sx={{ p: 2, m: 2, position: "relative" }}>
              <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
                <Tooltip
                  title={copySuccessMap[subProfile.name] ? "Copied!" : "Copy to clipboard"}
                  arrow
                >
                  <IconButton
                    onClick={() => void handleCopy(subProfile.name, subProfile.rawJson)}
                    size="small"
                    color={copySuccessMap[subProfile.name] ? "success" : "default"}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box component="pre" sx={{ m: 0, overflow: "auto" }}>
                {JSON.stringify(subProfile.rawJson, null, 2)}
              </Box>
            </Paper>
          </Collapse>
        </React.Fragment>
      ))}
    </List>
  );
};

type PlotsTabProps = { profile: PowerProfile };
const PlotsTab = ({ profile }: PlotsTabProps) => {
  const { data: plots, isPending, isError } = useQuery(profilePlotsQuery(profile));

  if (isPending) return <LoadingDetails />;
  if (isError) return <DetailsError />;
  if (plots.length === 0) {
    return (
      <Typography color="text.secondary">No graphs are available for this profile.</Typography>
    );
  }

  return (
    <Grid container spacing={1} sx={{ width: "100%" }}>
      {plots.map((plot) => (
        <Plot key={plot.url} link={plot} />
      ))}
    </Grid>
  );
};

type HeadlineFactProps = { label: string; value: string; icon: React.ElementType };
const HeadlineFact = ({ label, value, icon: Icon }: HeadlineFactProps) => (
  <Paper
    variant="outlined"
    // The same tinted surface the filter panel uses, so the app has one secondary surface
    // rather than a new colour per component.
    sx={(theme) => ({
      px: 1.5,
      py: 1,
      borderRadius: 2,
      backgroundColor: theme.palette.grey[100],
      ...theme.applyStyles("dark", { backgroundColor: theme.palette.grey[900] }),
    })}
  >
    <Stack direction="row" sx={{ alignItems: "center", gap: 1.25 }}>
      <Icon sx={{ fontSize: 26, color: "text.secondary" }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

export const ProfileMetrics = ({
  profile,
  summary,
}: {
  profile: PowerProfile;
  summary: Summary;
}) => {
  const hasReportedUsage = profile.usageStats.installationCount > 0;
  const installationCount = new Intl.NumberFormat("en-US").format(
    profile.usageStats.installationCount,
  );
  const sampledInstallations = new Intl.NumberFormat("en-US").format(summary.sampled_installations);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        backgroundImage: "var(--mui-overlays-6)",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Community usage
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {hasReportedUsage
              ? `${installationCount} opted-in ${profile.usageStats.installationCount === 1 ? "installation" : "installations"}`
              : "No opted-in usage yet"}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {hasReportedUsage
              ? `${profile.usageStats.percentage}% of ${sampledInstallations} reporting installations`
              : `Based on ${sampledInstallations} reporting installations`}
            <Tooltip
              title="These are active installations whose users opted in to analytics."
              arrow
              describeChild
            >
              <Box
                component="span"
                role="img"
                tabIndex={0}
                aria-label="About installation analytics"
                sx={{ display: "inline-flex", ml: 0.5, verticalAlign: "text-bottom" }}
              >
                <InfoOutlinedIcon aria-hidden="true" sx={{ fontSize: 16 }} />
              </Box>
            </Tooltip>
          </Typography>

          <Divider sx={{ my: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            Help improve these insights.
          </Typography>
          <Link
            variant="body2"
            href="https://docs.powercalc.nl/misc/analytics/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ alignSelf: "flex-start", fontWeight: 700 }}
          >
            Opt in to anonymous analytics
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const Profile = ({ profile, summary }: { profile: PowerProfile; summary: Summary }) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", to: "/" },
    { label: "Manufacturers", to: "/manufacturers" },
    {
      label: profile.manufacturer.fullName,
      to: manufacturerPath(profile.manufacturer.dirName),
    },
    { label: profile.modelId },
  ];

  const properties: PropertyItem[] = [
    {
      label: "Manufacturer",
      value: profile.manufacturer.fullName,
      icon: FactoryIcon,
      group: "device",
      renderFn: () => (
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
      renderFn: () => (profile.updatedAt ? <Timestamp date={profile.updatedAt} /> : null),
    },
    {
      label: "Authors",
      value: profile.authors.map((author) => author.name),
      icon: PersonIcon,
      group: "library",
      filterKey: "author",
      renderFn: () => (
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
      renderFn: (value) => <MeasureDescription description={String(value)} />,
    },
    {
      label: "LUT quality",
      value: profile.lutQuality?.score,
      icon: AutoGraphIcon,
      group: "measurement",
      renderFn: (value) => (
        <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <QualityBadge score={value as number} showBand />
          {/* Only worth spelling out when one color mode is rougher than the other. */}
          {profile.lutQuality?.brightness != null &&
            profile.lutQuality.colorTemp != null &&
            profile.lutQuality.brightness !== profile.lutQuality.colorTemp && (
              <Typography variant="body2" color="text.secondary" component="span">
                brightness {profile.lutQuality.brightness} · color temp{" "}
                {profile.lutQuality.colorTemp}
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
      // Two identical bounds read as a spurious range, so collapse them to a single figure.
      renderFn: () =>
        profile.voltageRange
          ? volts(
              profile.voltageRange.min === profile.voltageRange.max
                ? String(profile.voltageRange.min)
                : `${profile.voltageRange.min} – ${profile.voltageRange.max}`,
            )
          : null,
    },
    {
      label: "Max power",
      value: profile.maxPower,
      icon: BoltIcon,
      group: "power",
      renderFn: watts,
    },
    {
      label: "Standby power",
      value: profile.standbyPower,
      icon: BoltIcon,
      group: "power",
      renderFn: watts,
    },
    {
      label: "Standby power on",
      value: profile.standbyPowerOn,
      icon: BoltIcon,
      group: "power",
      renderFn: watts,
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
      renderFn: (value) => (
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
      value: `Automatic, by ${profile.discoveryBy ?? "entity"}`,
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
      // The value is "<manufacturer>/<model>", which is exactly the profile route.
      renderFn: (value) => {
        const [manufacturer, ...modelParts] = String(value).split("/");
        return (
          <Link component={RouterLink} to={getProfilePath(manufacturer, modelParts.join("/"))}>
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

  const filteredProperties = properties.filter(
    (property) =>
      property.value != null &&
      property.value !== "" &&
      !(Array.isArray(property.value) && property.value.length === 0) &&
      !SUMMARY_PROPERTY_LABELS.has(property.label),
  );

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const libraryPath =
    typeof location.state?.libraryPath === "string" &&
    location.state.libraryPath.startsWith("/") &&
    !location.state.libraryPath.startsWith("//")
      ? location.state.libraryPath
      : "/";

  const tabs = [
    {
      key: "attributes",
      label: "Attributes",
      render: <AttributesTab properties={filteredProperties} />,
    },
    { key: "json", label: "JSON", render: <JsonTab profile={profile} /> },
    ...(profile.subProfileCount > 0
      ? [
          {
            key: "sub-profiles",
            label: "Sub Profiles",
            render: <SubProfilesTab profile={profile} />,
          },
        ]
      : []),
    ...(["lut", "linear", "composite"].includes(profile.calculationStrategy)
      ? [{ key: "graphs", label: "Graphs", render: <PlotsTab profile={profile} /> }]
      : []),
  ];

  /**
   * The open tab lives in the query string so a graph or a sub-profile can be linked to directly,
   * and so a reload does not silently drop the reader back on Attributes. An unknown or
   * inapplicable key falls back to the first tab rather than showing nothing.
   */
  const tabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === searchParams.get("tab")),
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (newValue === 0) {
          params.delete("tab");
        } else {
          params.set("tab", tabs[newValue].key);
        }
        return params;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  return (
    <>
      <PageBreadcrumbs items={breadcrumbItems} includeStructuredData={false} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2, gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => void navigate(libraryPath)}
              startIcon={<HomeIcon />}
            >
              {libraryPath === "/" ? "Back to library" : "Back to results"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              href={`https://github.com/bramstroker/homeassistant-powercalc/tree/master/profile_library/${profile.manufacturer.dirName}/${profile.modelId}`}
              startIcon={<GithubIcon />}
              target={"_blank"}
              rel="noopener noreferrer"
            >
              Github
            </Button>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", minWidth: 0 }}>
            <ManufacturerLogo manufacturer={profile.manufacturer} size={44} plate />

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" component="h1" sx={{ overflowWrap: "anywhere" }}>
                <Link
                  component={RouterLink}
                  to={manufacturerPath(profile.manufacturer.dirName)}
                  color="inherit"
                  underline="hover"
                >
                  {profile.manufacturer.fullName}
                </Link>{" "}
                {profile.modelId}
              </Typography>
              {profile.name && (
                <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
                  {profile.name}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 2 }}>
            <HeadlineFact
              label="Device type"
              value={humanizeIdentifier(profile.deviceType)}
              // Same per-device-type glyph the grid and the filter panel use.
              icon={getDeviceTypeIcon(profile.deviceType) ?? TypeSpecimenIcon}
            />
            {profile.maxPower != null && (
              <HeadlineFact label="Max power" value={`${profile.maxPower} W`} icon={BoltIcon} />
            )}
            {profile.standbyPower != null && (
              <HeadlineFact
                label="Standby power"
                value={`${profile.standbyPower} W`}
                icon={BedtimeIcon}
              />
            )}
            {profile.subProfileCount > 0 && (
              <HeadlineFact
                label="Sub profiles"
                value={String(profile.subProfileCount)}
                icon={LayersIcon}
              />
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <ProfileMetrics profile={profile} summary={summary} />
        </Grid>
      </Grid>

      <ProfileSetup profile={profile} />

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          indicatorColor="secondary"
          // Keep the prerendered and first browser render identical. Switching this prop from a
          // media query changes the tab DOM during hydration on desktop and makes React discard
          // the static profile page.
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((t, i) => (
            <Tab key={t.label} label={t.label} {...a11yProps(i)} />
          ))}
        </Tabs>
      </Box>

      {tabs.map((t, i) => (
        <CustomTabPanel key={t.label} value={tabIndex} index={i}>
          {t.render}
        </CustomTabPanel>
      ))}
    </>
  );
};
