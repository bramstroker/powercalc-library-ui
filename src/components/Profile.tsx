import {FullPowerProfile} from "../types/PowerProfile";
import {useLoaderData} from "react-router-dom";
import FactoryIcon from "@mui/icons-material/Factory";
import PermDeviceInformationIcon from "@mui/icons-material/PermDeviceInformation";
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
import MoreIcon from "@mui/icons-material/More";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import PaletteIcon from "@mui/icons-material/Palette";
import MediationIcon from "@mui/icons-material/Mediation";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import BoltIcon from "@mui/icons-material/Bolt";
import Grid2 from "@mui/material/Grid2";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import {Paper, Tab, Tabs} from "@mui/material";
import Plot from "./Plot";
import {Header} from "./Header";
import React from "react";
import Box from "@mui/material/Box";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const Profile: React.FC = () => {
  const profile = useLoaderData() as FullPowerProfile;

  const properties = [
    {label: "Manufacturer", value: profile.manufacturer, icon: FactoryIcon},
    {
      label: "Model ID",
      value: profile.modelId,
      icon: PermDeviceInformationIcon,
    },
    {label: "Device type", value: profile.deviceType, icon: TypeSpecimenIcon},
    {label: "Name", value: profile.name, icon: MoreIcon},
    {label: "Description", value: profile.description, icon: MoreIcon},
    {label: "Created", value: profile.createdAt, icon: HistoryIcon},
    {label: "Updated", value: profile.updatedAt, icon: HistoryIcon},
    {label: "Author", value: profile.author, icon: PersonIcon},
    {
      label: "Color modes",
      value: profile.colorModes?.join(", "),
      icon: PaletteIcon,
    },
    {label: "Aliases", value: profile.aliases, icon: MediationIcon},
    {
      label: "Measure device",
      value: profile.measureDevice,
      icon: ElectricMeterIcon,
    },
    {
      label: "Measure method",
      value: profile.measureMethod,
      icon: ElectricMeterIcon,
    },
    {
      label: "Measure description",
      value: profile.measureDescription,
      icon: ElectricMeterIcon,
    },
    {
      label: "Standby power",
      value: profile.standbyPower,
      icon: BoltIcon,
    },
  ];

  const filteredProperties = properties.filter(
      (property) => property.value != null && property.value !== "",
  );
  const chunkedProperties = [];
  for (let i = 0; i < filteredProperties.length; i += 4) {
    chunkedProperties.push(filteredProperties.slice(i, i + 4));
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
      <>
        <Header/>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <h1>{profile.manufacturer} {profile.modelId}</h1>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Attributes" {...a11yProps(0)} />
            <Tab label="Plots" {...a11yProps(1)} />
            <Tab label="JSON" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Grid2 size={{xs: 12, md: 6}}>
            <Grid2 container spacing={1}>
              {chunkedProperties.map((chunk, columnIndex) => (
                  <Grid2 size={{xs: 12, sm: 6, md: 4}} key={columnIndex}>
                    {chunk.map((property, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar>
                              <property.icon/>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                              primary={property.label}
                              secondary={property.value}
                          />
                        </ListItem>
                    ))}
                  </Grid2>
              ))}
            </Grid2>
          </Grid2>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Grid2 container spacing={1} sx={{width: "100%"}}>
            {profile?.plots.map((plot, index) => (
                <Plot link={plot}></Plot>
            ))}
          </Grid2>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <Paper style={{padding: 16}}>
            <pre>{JSON.stringify(profile?.rawJson, null, 2)}</pre>
          </Paper>
        </CustomTabPanel>
      </>
  );
};

export default Profile;
