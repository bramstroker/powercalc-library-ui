import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {PowerProfile} from '../types/PowerProfile'
import { Alert, CircularProgress, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query'; 
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import FactoryIcon from '@mui/icons-material/Factory';
import HistoryIcon from '@mui/icons-material/History';
import PaletteIcon from '@mui/icons-material/Palette';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeter';
import BoltIcon from '@mui/icons-material/Bolt';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

interface DetailPanelProps {
    profile: PowerProfile
}

const API_ENDPOINT_PROFILE = "https://powercalc.lauwbier.nl/api/profile"

type FullPowerProfile = PowerProfile & {
  createdAt: string;
  measureDevice: string;
  measureMethod: string;
	measureDescription: string;
  calculationStrategy: string;
	standbyPower: number;
};

export const DetailPanel: React.FC<DetailPanelProps> = ({ profile }) => {
  const {
    data: fullProfile,
    isLoading,
    isError,
  } = useFetchPowerProfile(
    profile
  );

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Error Loading Profile</Alert>;

  const properties = [
      { "label": "Manufacturer", "value": profile.manufacturer, "icon": FactoryIcon },
      { "label": "Model ID", "value": profile.modelId, "icon": WorkIcon },
      { "label": "Device type", "value": profile.deviceType, "icon": WorkIcon },
      { "label": "Name", "value": profile.name, "icon": WorkIcon },
      { "label": "Created", "value": fullProfile?.createdAt, "icon": HistoryIcon },
      { "label": "Updated", "value": profile.updatedAt, "icon": HistoryIcon },
      { "label": "Color modes", "value": profile.colorModes.join(', '), "icon": PaletteIcon },
      { "label": "Aliases", "value": profile.aliases, "icon": WorkIcon },
      { "label": "Measure device", "value": fullProfile?.measureDevice, "icon": ElectricMeterIcon },
      { "label": "Measure method", "value": fullProfile?.measureMethod, "icon": ElectricMeterIcon },
      { "label": "Measure description", "value": fullProfile?.measureDescription, "icon": ElectricMeterIcon },
      { "label": "Standby power", "value": fullProfile?.standbyPower, "icon": BoltIcon },
  ]
  
  const chunkedProperties = [];
  for (let i = 0; i < properties.length; i += 4) {
    chunkedProperties.push(properties.slice(i, i + 4));
  }

  return (
    <Grid container spacing={1} sx={{ width: '100%' }}>
      {chunkedProperties.map((chunk, columnIndex) => (
        <Grid item xs={12} sm={6} md={4} key={columnIndex}>
          {chunk.map((property, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar>
                  <property.icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={property.label} secondary={property.value} />
            </ListItem>
          ))}
        </Grid>
      ))}
    </Grid>
  );
}

const useFetchPowerProfile = (
  profile: PowerProfile
) => {
  return useQuery<FullPowerProfile>({
    staleTime: 60 * 1000,
    queryKey: [profile.manufacturer , profile.modelId],
    queryFn: async () => {
      const url = `${API_ENDPOINT_PROFILE}/${profile.manufacturer}/${profile.modelId}`
      const response = await fetch(url);
      const json = (await response.json());
      return {
        createdAt: json["created_at"],
        measureDevice: json["measure_device"],
        measureMethod: json['measure_method'],
	      measureDescription: json['measure_description'],
        calculationStrategy: json['calculation_strategy'],
        standbyPower: json['standby_power']
      } as FullPowerProfile
    },
  });
};


export default DetailPanel;