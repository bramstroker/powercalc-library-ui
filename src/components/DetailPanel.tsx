import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
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

    return (<Box
          sx={{
            display: 'grid',
            margin: 'auto',
            gridTemplateColumns: '1fr 1fr',
            width: '100%',
          }}
        >
          <Typography>Manufacturer: {profile.manufacturer}</Typography>
          <Typography>Model ID: {profile.modelId}</Typography>
          <Typography>DeviceType: {profile.deviceType}</Typography>
          <Typography>Name: {profile.name}</Typography>
          <Typography>Updated: {profile.updatedAt}</Typography>
          <Typography>Created: {fullProfile?.createdAt}</Typography>
          <Typography>Color modes: {profile.colorModes.join(', ')}</Typography>
          <Typography>Aliases: {profile.aliases}</Typography>
          <Typography>Measure device: {fullProfile?.measureDevice}</Typography>
        </Box>)
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
        measureDevice: json["measure_device"]
      } as FullPowerProfile
    },
  });
};


export default DetailPanel;