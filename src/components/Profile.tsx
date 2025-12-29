import {useLoaderData, useNavigate} from "react-router-dom";
import FactoryIcon from "@mui/icons-material/Factory";
import PermDeviceInformationIcon from "@mui/icons-material/PermDeviceInformation";
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
import MoreIcon from "@mui/icons-material/More";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import PaletteIcon from "@mui/icons-material/Palette";
import MediationIcon from "@mui/icons-material/Mediation";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import CalculateIcon from "@mui/icons-material/Calculate";
import BoltIcon from "@mui/icons-material/Bolt";
import HomeIcon from "@mui/icons-material/Home";
import GithubIcon from "@mui/icons-material/GitHub";
import Grid from "@mui/material/Grid";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import {
  Button,
  Paper,
  Tab,
  Tabs,
  List,
  ListItemButton,
  Collapse,
  IconButton,
  CircularProgress,
  Card, CardContent, Stack, LinearProgress,
  Tooltip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useQuery } from "@tanstack/react-query";

import AliasChips from "./AliasChips";
import React, {Suspense, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import {FullPowerProfile} from "../types/PowerProfile";
import { fetchProfile } from "../api/analytics.api";
import { useSummary } from "../hooks/useSummary";

import {Header} from "./Header";
import {Plot} from "./Plot";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const {children, value, index, ...other} = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
      >
        {value === index && <Box sx={{p: 3}}>{children}</Box>}
      </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function distributeIntoColumns<T>(items: T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => result[i % columns].push(item));
  return result;
}

interface PropertyItem {
  label: string;
  value: string | number | undefined | string[];
  icon: React.ElementType;
  filterKey?: string;
}

export const ProfileContent: React.FC = () => {
  const profile = useLoaderData() as FullPowerProfile;
  const [expandedSubProfiles, setExpandedSubProfiles] = useState<Record<string, boolean>>({});

  // Fetch profile metrics
  const { data: profileMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["profileMetrics", profile.manufacturer.dirName, profile.modelId],
    queryFn: () => fetchProfile(profile.manufacturer.dirName, profile.modelId),
  });

  const toggleSubProfile = (name: string) => {
    setExpandedSubProfiles(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  type FilterLinkProps = {
    filterKey: string;
    value: string;
    children: React.ReactNode;
  };
  const FilterLink = ({filterKey, value, children}: FilterLinkProps) => {
    return (
        <Link
            href={`/?${filterKey}=${encodeURIComponent(value)}`}
            underline="hover"
            color="inherit"
            sx={{cursor: "pointer"}}
        >
          {children}
        </Link>
    );
  }

  const PropertyValue = ({property}: { property: PropertyItem }) => {
    if (property.label === "Aliases" && property.value) {
      return <AliasChips aliases={property.value as string} marginTop={1}/>;
    }

    if (Array.isArray(property.value)) {
      const values = property.value.map(String);
      return (
          <>
            {values.map((v: string, i: number) => (
                <React.Fragment key={`${property.filterKey ?? "v"}-${v}`}>
                  {property.filterKey ? (
                      <FilterLink filterKey={property.filterKey} value={v}>{v}</FilterLink>
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
          <FilterLink filterKey={property.filterKey} value={String(property.value)}>
            {String(property.value)}
          </FilterLink>
      );
    }

    return property.value ?? null;
  };

  type AttributesTabProps = { chunkedProperties: PropertyItem[][] };
  const AttributesTab = ({chunkedProperties}: AttributesTabProps) => (
      <Grid size={{xs: 12, md: 6}}>
        <Grid container spacing={1}>
          {chunkedProperties.map((chunk, columnIndex) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={columnIndex}>
                {chunk.map((property) => (
                    <ListItem
                        key={`${property.label}-${property.filterKey ?? ""}-${String(property.value)}`}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <property.icon/>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={property.label} secondary={<PropertyValue property={property}/>}/>
                    </ListItem>
                ))}
              </Grid>
          ))}
        </Grid>
      </Grid>
  );

  type JsonTabProps = { profile: FullPowerProfile };
  const JsonTab = ({profile}: JsonTabProps) => (
      <Paper sx={{p: 2}}>
        <Box component="pre" sx={{m: 0, overflow: "auto"}}>
          {JSON.stringify(profile.rawJson, null, 2)}
        </Box>
      </Paper>
  );

  type SubProfilesTabProps = {
    profile: FullPowerProfile;
  };
  const SubProfilesTab = ({profile}: SubProfilesTabProps) => (
      <List component="nav" aria-label="sub profiles">
        {profile.subProfiles.map((subProfile) => (
            <React.Fragment key={subProfile.name}>
              <ListItemButton onClick={() => toggleSubProfile(subProfile.name)}>
                <ListItemText primary={subProfile.name}/>
                <IconButton edge="end" aria-label="expand">
                  {expandedSubProfiles[subProfile.name] ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </IconButton>
              </ListItemButton>
              <Collapse in={expandedSubProfiles[subProfile.name]} timeout="auto" unmountOnExit>
                <Paper sx={{p: 2, m: 2}}>
                  <Box component="pre" sx={{m: 0, overflow: "auto"}}>
                    {JSON.stringify(subProfile.rawJson, null, 2)}
                  </Box>
                </Paper>
              </Collapse>
            </React.Fragment>
        ))}
      </List>
  );

  type PlotsTabProps = { profile: FullPowerProfile };
  const PlotsTab = ({profile}: PlotsTabProps) => (
      <Grid container spacing={1} sx={{width: "100%"}}>
        {profile.plots.map((plot) => (
            <Plot key={plot.url} link={plot}/>
        ))}
      </Grid>
  );

  const ProfileMetrics = () => {
    // Fetch summary data (will be cached by React Query)
    const { data: summaryData, isLoading: summaryLoading } = useSummary();

    if (metricsLoading || summaryLoading) {
      return (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={20} />
          </Box>
      );
    }

    if (!profileMetrics || !summaryData) return null;

    return (
        <Card
            variant="outlined"
            sx={{
              height: "100%",
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

              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Used in {profileMetrics.percentage}% of installations
              </Typography>

              <LinearProgress
                  variant="determinate"
                  value={profileMetrics.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                    },
                  }}
              />

              <Typography variant="body2" color="text.secondary">
                {profileMetrics.installation_count} out of {summaryData.sampled_installations} total{' '}
                <Tooltip title="Active installations are all users who have opted in for analytics." arrow>
                  <span style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>installations</span>
                </Tooltip>
                {' '}
                <Link 
                  href="https://docs.powercalc.nl/misc/analytics/"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Learn how to opt-in
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
    );
  };

  const properties: PropertyItem[] = [
    {label: "Manufacturer", value: profile.manufacturer.fullName, icon: FactoryIcon, filterKey: "manufacturer"},
    {label: "Model ID", value: profile.modelId, icon: PermDeviceInformationIcon},
    {label: "Device type", value: profile.deviceType, icon: TypeSpecimenIcon, filterKey: "deviceType"},
    {label: "Name", value: profile.name, icon: MoreIcon},
    {label: "Description", value: profile.description, icon: MoreIcon},
    {label: "Created", value: profile.createdAt.toLocaleString(), icon: HistoryIcon},
    {label: "Updated", value: profile.updatedAt?.toLocaleString(), icon: HistoryIcon},
    {label: "Author", value: profile.author, icon: PersonIcon, filterKey: "author"},
    {label: "Calculation strategy", value: profile.calculationStrategy, icon: CalculateIcon, filterKey: "calculationStrategy"},
    {label: "Color modes", value: profile.colorModes, icon: PaletteIcon, filterKey: "colorMode"},
    {label: "Aliases", value: profile.aliases, icon: MediationIcon},
    {label: "Measure device", value: profile.measureDevice, icon: ElectricMeterIcon, filterKey: "measureDevice"},
    {label: "Measure method", value: profile.measureMethod, icon: ElectricMeterIcon, filterKey: "measureMethod"},
    {label: "Measure description", value: profile.measureDescription, icon: ElectricMeterIcon},
    {label: "Max power", value: profile.maxPower, icon: BoltIcon},
    {label: "Standby power", value: profile.standbyPower, icon: BoltIcon},
    {label: "Standby power on", value: profile.standbyPowerOn, icon: BoltIcon},
  ];

  const filteredProperties = properties.filter(
      (property) => property.value != null && property.value !== "",
  );
  const chunkedProperties  =distributeIntoColumns(filteredProperties, 4)

  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    {label: "Attributes", render: <AttributesTab chunkedProperties={chunkedProperties}/>},
    {label: "JSON", render: <JsonTab profile={profile}/>},
    ...(profile.subProfiles.length > 0 ? [{label: "Sub Profiles", render: <SubProfilesTab profile={profile}/>}] : []),
    ...(profile.plots.length > 0 ? [{label: "Graphs", render: <PlotsTab profile={profile}/>}] : []),
  ];

  return (
      <>
        <Header/>
        <Box sx={{p: 3}}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8, lg: 9}}>
              <Box sx={{display: "flex", marginBottom: 2, gap: 2}}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/")}
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

              <Typography variant="h4" component="h1">
                {profile.manufacturer.fullName} {profile.modelId}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3}}>
              <ProfileMetrics/>
            </Grid>
          </Grid>

          <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
            <Tabs value={value} onChange={handleChange} indicatorColor="secondary">
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
        </Box>
      </>
  );
};

const Profile = () => {
  return (
      <Suspense fallback={<div>Loading profile...</div>}>
        <ProfileContent/>
      </Suspense>
  );
};

export default Profile;
