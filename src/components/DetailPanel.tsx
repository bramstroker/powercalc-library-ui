import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {PowerProfile} from '../types/PowerProfile'
import { Alert, CircularProgress, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query'; 

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

    return (
      <Grid container>
        <Grid xs={6}>
          <Typography>Manufacturer: {profile.manufacturer}</Typography>
          <Typography>Model ID: {profile.modelId}</Typography>
          <Typography>Device type: {profile.deviceType}</Typography>
          <Typography>Name: {profile.name}</Typography>
          <Typography>Created: {fullProfile?.createdAt}</Typography>
          <Typography>Updated: {profile.updatedAt}</Typography>
        </Grid>
        <Grid xs={6}>
          {profile.colorModes.length ? <Typography>Color modes: {profile.colorModes.join(', ')}</Typography> : ''}
          <Typography>Aliases: {profile.aliases}</Typography>
          <Typography>Measure device: {fullProfile?.measureDevice}</Typography>
          <Typography>Measure method: {fullProfile?.measureMethod}</Typography>
          <Typography>Measure description: {fullProfile?.measureDescription}</Typography>
          <Typography>Standby power: {fullProfile?.standbyPower}</Typography>
        </Grid>
    </Grid>
    )
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