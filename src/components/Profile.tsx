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
  Card, CardContent, Stack, LinearProgress, Divider,
  Tooltip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import {useQuery} from "@tanstack/react-query";
import React, {useState} from "react";
import {useLoaderData, useNavigate, Link as RouterLink} from "react-router";

import {useSummary} from "../hooks/useSummary";
import {
  profileJsonQuery,
  profilePlotsQuery,
  subProfilesQuery,
} from "../queries/profileDetails.query";
import type {BreadcrumbItem} from "../seo/breadcrumbs";
import type {PowerProfile} from "../types/PowerProfile";
import {formatTimestampUtc} from "../utils/dateFormat";
import {
  authorPath,
  manufacturerPath,
  profilePath as getProfilePath,
} from "../utils/urlSlugs.mjs";

import {AliasChips} from "./AliasChips";
import {ClientOnly} from "./ClientOnly";
import {getDeviceTypeIcon} from "./library/facetIcons";
import {ProfileSetup} from "./library/ProfileSetup";
import {QualityBadge} from "./library/QualityBadge";
import {ManufacturerLogo} from "./ManufacturerLogo";
import {PageBreadcrumbs} from "./PageBreadcrumbs";
import {Plot} from "./Plot";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const {children, value, index, ...other} = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
      >
        {value === index && <Box sx={{px: {xs: 0, sm: 3}, py: 3}}>{children}</Box>}
      </div>
  );
}

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

type ItemValueType = string | number | boolean | undefined | null | string[] | Record<string, unknown>;

/** Power figures are watts; the unit belongs next to the number, not only in the headline. */
const watts = (value: ItemValueType) => `${String(value)} W`;
const volts = (value: ItemValueType) => `${String(value)} V`;
const humanizeIdentifier = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type AttributeGroup = "device" | "power" | "measurement" | "library";

/** Section order and headings for the attributes tab. */
const ATTRIBUTE_GROUPS: {key: AttributeGroup; label: string}[] = [
  {key: "device", label: "Device"},
  {key: "power", label: "Power"},
  {key: "measurement", label: "Measurement"},
  {key: "library", label: "Library"},
];

interface PropertyItem {
  label: string;
  value: ItemValueType;
  icon: React.ElementType;
  group: AttributeGroup;
  filterKey?: string;
  renderFn?: (value: ItemValueType) => React.ReactNode;
}

const MEASURE_DESCRIPTION_COLLAPSED_LINES = 4;
const MEASURE_DESCRIPTION_TOGGLE_THRESHOLD = 300;

const MeasureDescription = ({description}: { description: string }) => {
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
                sx={{mt: 0.5, px: 0, minWidth: 0}}
            >
              {expanded ? "Show less" : "Show more"}
            </Button>
        )}
      </>
  );
};

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
const FilterLink = ({filterKey, value, label, children}: FilterLinkProps) => {
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
            sx={{cursor: "pointer", textDecorationStyle: "dotted"}}
        >
          {children}
        </Link>
      </Tooltip>
  );
}

const PropertyValue = ({property}: { property: PropertyItem }) => {
  if (property.renderFn && property.value != null) {
    return property.renderFn(property.value);
  }

  if (property.label === "Aliases" && property.value) {
    return <AliasChips aliases={property.value as string[]} marginTop={1} wrap/>;
  }

  if (Array.isArray(property.value)) {
    const values = property.value.map(String);
    return (
        <>
          {values.map((v: string, i: number) => (
              <React.Fragment key={`${property.filterKey ?? "v"}-${v}`}>
                {property.filterKey ? (
                    <FilterLink filterKey={property.filterKey} value={v} label={property.label}>{v}</FilterLink>
                ) : (
                    v
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
          {String(property.value)}
        </FilterLink>
    );
  }

  if (property.value == null || typeof property.value === "object") {
    // Objects only render through a renderFn of their own; there is nothing sensible to print.
    return null;
  }

  return String(property.value);
};

type AttributesTabProps = { properties: PropertyItem[] };
/**
 * Grouped into sections so related attributes sit together. Items flow left to right within a
 * section, which is the natural Grid order — no round-robin dealing needed.
 */
const AttributesTab = ({properties}: AttributesTabProps) => (
    <Stack spacing={3}>
      {ATTRIBUTE_GROUPS.map(({key, label}) => {
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
                  sx={{fontWeight: 700, letterSpacing: ".08em", m: 0}}
              >
                {label}
              </Typography>
              <Divider sx={{mb: 0.5}}/>

              <Grid component="dl" container spacing={1} sx={{m: 0}}>
                {items.map((property) => (
                    <Grid
                        component="div"
                        size={{xs: 12, sm: 6, md: 3}}
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
                        <property.icon aria-hidden="true" fontSize="small"/>
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
                        <PropertyValue property={property}/>
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
    <Stack direction="row" spacing={1.5} sx={{alignItems: "center", py: 2}}>
      <CircularProgress size={22}/>
      <Typography color="text.secondary">Loading profile details…</Typography>
    </Stack>
);

const DetailsError = () => (
    <Alert severity="error">The profile details could not be loaded. Please try again.</Alert>
);

type JsonTabProps = { profile: PowerProfile };
const JsonTab = ({profile}: JsonTabProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const {data: rawJson, isPending, isError} = useQuery(profileJsonQuery(profile));

  if (isPending) return <LoadingDetails/>;
  if (isError) return <DetailsError/>;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rawJson, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
      <Paper sx={{p: 2, position: 'relative'}}>
        <Box sx={{position: 'absolute', top: 8, right: 8, zIndex: 1}}>
          <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"} arrow>
            <IconButton onClick={() => void handleCopy()} size="small" color={copySuccess ? "success" : "default"}>
              <ContentCopyIcon/>
            </IconButton>
          </Tooltip>
        </Box>
        <Box component="pre" sx={{m: 0, overflow: "auto"}}>
          {JSON.stringify(rawJson, null, 2)}
        </Box>
      </Paper>
  );
};

type SubProfilesTabProps = {
  profile: PowerProfile;
};
const SubProfilesTab = ({profile}: SubProfilesTabProps) => {
  const [copySuccessMap, setCopySuccessMap] = useState<Record<string, boolean>>({});
  const [expandedSubProfiles, setExpandedSubProfiles] = useState<Record<string, boolean>>({});
  const {data: subProfiles, isPending, isError} = useQuery(subProfilesQuery(profile));

  const toggleSubProfile = (name: string) => {
    setExpandedSubProfiles(prev => ({...prev, [name]: !prev[name]}));
  };

  if (isPending) return <LoadingDetails/>;
  if (isError) return <DetailsError/>;

  const handleCopy = async (name: string, json: Record<string, unknown>) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopySuccessMap(prev => ({...prev, [name]: true}));
      setTimeout(() => {
        setCopySuccessMap(prev => ({...prev, [name]: false}));
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
      <List component="nav" aria-label="sub profiles">
        {subProfiles.map((subProfile) => (
            <React.Fragment key={subProfile.name}>
              <ListItemButton onClick={() => toggleSubProfile(subProfile.name)}>
                <ListItemText primary={subProfile.name}/>
                <IconButton edge="end" aria-label="expand">
                  {expandedSubProfiles[subProfile.name] ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </IconButton>
              </ListItemButton>
              <Collapse in={expandedSubProfiles[subProfile.name]} timeout="auto" unmountOnExit>
                <Paper sx={{p: 2, m: 2, position: 'relative'}}>
                  <Box sx={{position: 'absolute', top: 8, right: 8, zIndex: 1}}>
                    <Tooltip title={copySuccessMap[subProfile.name] ? "Copied!" : "Copy to clipboard"} arrow>
                      <IconButton
                          onClick={() => void handleCopy(subProfile.name, subProfile.rawJson)}
                          size="small"
                          color={copySuccessMap[subProfile.name] ? "success" : "default"}
                      >
                        <ContentCopyIcon/>
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box component="pre" sx={{m: 0, overflow: "auto"}}>
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
const PlotsTab = ({profile}: PlotsTabProps) => {
  const {data: plots, isPending, isError} = useQuery(profilePlotsQuery(profile));

  if (isPending) return <LoadingDetails/>;
  if (isError) return <DetailsError/>;
  if (plots.length === 0) {
    return <Typography color="text.secondary">No graphs are available for this profile.</Typography>;
  }

  return (
      <Grid container spacing={1} sx={{width: "100%"}}>
        {plots.map((plot) => (
            <Plot key={plot.url} link={plot}/>
        ))}
      </Grid>
  );
};

type HeadlineFactProps = {label: string; value: string; icon: React.ElementType};
const HeadlineFact = ({label, value, icon: Icon}: HeadlineFactProps) => (
    <Paper
        variant="outlined"
        // The same tinted surface the filter panel uses, so the app has one secondary surface
        // rather than a new colour per component.
        sx={(theme) => ({
          px: 1.5,
          py: 1,
          borderRadius: 2,
          backgroundColor: theme.palette.grey[100],
          ...theme.applyStyles("dark", {backgroundColor: theme.palette.grey[900]}),
        })}
    >
      <Stack direction="row" sx={{alignItems: "center", gap: 1.25}}>
        <Icon sx={{fontSize: 26, color: "text.secondary"}}/>
        <Box sx={{minWidth: 0}}>
          <Typography variant="caption" color="text.secondary" sx={{display: "block"}}>
            {label}
          </Typography>
          <Typography
              variant="subtitle2"
              sx={{fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere"}}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
);

const ProfileMetrics = ({profile}: { profile: PowerProfile }) => {
  // Fetch summary data (will be cached by React Query)
  const {data: summaryData} = useSummary();

  if (!summaryData) return null;

  const hasReportedUsage = profile.usageStats.installationCount > 0;

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
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">
              Insights
            </Typography>

            <Typography variant="body2" sx={{fontWeight: 500}}>
              {hasReportedUsage
                  ? `Used in ${profile.usageStats.percentage}% of installations`
                  : "No opted-in installations reported yet"}
            </Typography>

            {hasReportedUsage && (
              <LinearProgress
                  variant="determinate"
                  value={profile.usageStats.percentage}
                  aria-label="Profile usage across opted-in installations"
                  aria-valuetext={`${profile.usageStats.percentage}%`}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                    },
                  }}
              />
            )}

            <Typography variant="body2" color="text.secondary">
              {profile.usageStats.installationCount} out of {summaryData.sampled_installations} total{' '}
              installations
              <Tooltip title="These are active installations whose users opted in to analytics." arrow>
                <IconButton
                    size="small"
                    aria-label="About installation analytics"
                    sx={{p: 0.25, ml: 0.25, verticalAlign: "text-bottom"}}
                >
                  <InfoOutlinedIcon sx={{fontSize: 16}}/>
                </IconButton>
              </Tooltip>
            </Typography>

            <Link
                variant="caption"
                href="https://docs.powercalc.nl/misc/analytics/"
                target="_blank"
                rel="noopener noreferrer"
            >
              Learn how to opt-in
            </Link>
          </Stack>
        </CardContent>
      </Card>
  );
};

export const Profile = () => {
  const profile = useLoaderData() as PowerProfile;
  const breadcrumbItems: BreadcrumbItem[] = [
    {label: "Library", to: "/"},
    {label: "Manufacturers", to: "/manufacturers"},
    {
      label: profile.manufacturer.fullName,
      to: manufacturerPath(profile.manufacturer.dirName),
    },
    {label: profile.modelId},
  ];

  const properties: PropertyItem[] = [
    {label: "Manufacturer", value: profile.manufacturer.fullName, icon: FactoryIcon, group: "device", filterKey: "manufacturer"},
    {label: "Model ID", value: profile.modelId, icon: PermDeviceInformationIcon, group: "device"},
    {label: "Device type", value: profile.deviceType, icon: TypeSpecimenIcon, group: "device", filterKey: "deviceType"},
    {label: "Name", value: profile.name, icon: MoreIcon, group: "device"},
    {label: "Description", value: profile.description, icon: MoreIcon, group: "device"},
    {label: "Created", value: formatTimestampUtc(profile.createdAt), icon: HistoryIcon, group: "library"},
    {label: "Updated", value: profile.updatedAt && formatTimestampUtc(profile.updatedAt), icon: HistoryIcon, group: "library"},
    {
      label: "Authors",
      value: profile.authors.map((author) => author.name),
      icon: PersonIcon,
      group: "library",
      filterKey: "author",
      renderFn: () => (
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5 }}>
          {profile.authors.map((author, index) => (
            <Tooltip key={author.githubUsername || `${author.name}-${index}`} title="View this author's profiles" describeChild arrow placement="top">
              <Link
                component={RouterLink}
                to={authorPath(author.githubUsername)}
                underline="always"
                color="primary"
                sx={{textDecorationStyle: "dotted"}}
              >
                {author.name}
              </Link>
            </Tooltip>
          ))}
        </Stack>
      )
    },
    {
      label: "Calculation strategy",
      value: profile.calculationStrategy,
      icon: CalculateIcon,
      group: "measurement",
      filterKey: "calculationStrategy"
    },
    {label: "Color modes", value: profile.colorModes, icon: PaletteIcon, group: "device", filterKey: "colorMode"},
    {label: "Aliases", value: profile.aliases, icon: MediationIcon, group: "device"},
    {label: "Measure device", value: profile.measureDevice, icon: ElectricMeterIcon, group: "measurement", filterKey: "measureDevice"},
    {label: "Measure method", value: profile.measureMethod, icon: ElectricMeterIcon, group: "measurement", filterKey: "measureMethod"},
    {
      label: "Measure description",
      value: profile.measureDescription,
      icon: ElectricMeterIcon,
      group: "measurement",
      renderFn: (value) => <MeasureDescription description={String(value)}/>,
    },
    {
      label: "LUT quality",
      value: profile.lutQuality?.score,
      icon: AutoGraphIcon,
      group: "measurement",
      renderFn: (value) => (
        <Stack direction="row" sx={{alignItems: "center", flexWrap: "wrap", gap: 1}}>
          <QualityBadge score={value as number} showBand/>
          {/* Only worth spelling out when one color mode is rougher than the other. */}
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
    {label: "Max power", value: profile.maxPower, icon: BoltIcon, group: "power", renderFn: watts},
    {label: "Standby power", value: profile.standbyPower, icon: BoltIcon, group: "power", renderFn: watts},
    {label: "Standby power on", value: profile.standbyPowerOn, icon: BoltIcon, group: "power", renderFn: watts},
    {label: "Min version", value: profile.minVersion, icon: MoreIcon, group: "library"},
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
        <Typography variant="body2" component="span">
          {Object.entries(value as Record<string, unknown>)
            .map(([key, entry]) => `${key}: ${String(entry)}`)
            .join(", ")}
        </Typography>
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
    {label: "Compatible integrations", value: profile.compatibleIntegrations, icon: MoreIcon, group: "library"},
  ];

  const filteredProperties = properties.filter(
      (property) =>
          property.value != null &&
          property.value !== "" &&
          !(Array.isArray(property.value) && property.value.length === 0),
  );

  const theme = useTheme();
  const isTabletUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    {label: "Attributes", render: <AttributesTab properties={filteredProperties}/>},
    {label: "JSON", render: <JsonTab profile={profile}/>},
    ...(profile.subProfileCount > 0 ? [{label: "Sub Profiles", render: <SubProfilesTab profile={profile}/>}] : []),
    ...(profile.calculationStrategy === "lut" ? [{label: "Graphs", render: <PlotsTab profile={profile}/>}] : []),
  ];

  return (
      <>
        <PageBreadcrumbs items={breadcrumbItems}/>
        <Grid container spacing={2} sx={{mb: 3}}>
          <Grid size={{xs: 12, md: 8, lg: 9}}>
            <Box sx={{display: "flex", flexWrap: "wrap", mb: 2, gap: 2}}>
              <Button
                  variant="contained"
                  color="primary"
                  onClick={() => void navigate("/")}
                  startIcon={<HomeIcon/>}
              >
                Back to library
              </Button>
              <Button
                  variant="outlined"
                  color="primary"
                  href={`https://github.com/bramstroker/homeassistant-powercalc/tree/master/profile_library/${profile.manufacturer.dirName}/${profile.modelId}`}
                  startIcon={<GithubIcon/>}
                  target={"_blank"}
                  rel="noopener noreferrer"
              >
                Github
              </Button>
            </Box>

            <Stack direction="row" spacing={2} sx={{alignItems: "flex-start", minWidth: 0}}>
              <ManufacturerLogo manufacturer={profile.manufacturer} size={44} plate/>

              <Box sx={{minWidth: 0}}>
                <Typography variant="h4" component="h1" sx={{overflowWrap: "anywhere"}}>
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

            <Stack direction="row" sx={{flexWrap: "wrap", gap: 1, mt: 2}}>
              <HeadlineFact
                  label="Device type"
                  value={humanizeIdentifier(profile.deviceType)}
                  // Same per-device-type glyph the grid and the filter panel use.
                  icon={getDeviceTypeIcon(profile.deviceType) ?? TypeSpecimenIcon}
              />
              {profile.maxPower != null && (
                <HeadlineFact label="Max power" value={`${profile.maxPower} W`} icon={BoltIcon}/>
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
          <Grid size={{xs: 12, md: 4, lg: 3}}>
            <ClientOnly><ProfileMetrics profile={profile}/></ClientOnly>
          </Grid>
        </Grid>

        <ProfileSetup profile={profile}/>

        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
          <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="secondary"
              variant={isTabletUp ? "standard" : "scrollable"}
              scrollButtons="auto"
              allowScrollButtonsMobile
          >
            {tabs.map((t, i) => (
                <Tab key={t.label} label={t.label} {...a11yProps(i)} />
            ))}
          </Tabs>
        </Box>

        {tabs.map((t, i) => (
            <CustomTabPanel key={t.label} value={value} index={i}>
              {t.render}
            </CustomTabPanel>
        ))}
      </>
  );
};
