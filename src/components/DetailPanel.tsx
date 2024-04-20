import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {PowerProfile} from '../types/PowerProfile'

interface DetailPanelProps {
    profile: PowerProfile
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ profile }) => {
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
          <Typography>Country: {profile.name}</Typography>
          <Typography>Updated: {new Date(profile.updateTimestamp * 1000).toDateString()}</Typography>
          <Typography>Color modes: {profile.colorModes.join(', ')}</Typography>
          <Typography>Aliases: {profile.aliases}</Typography>
        </Box>)
}

export default DetailPanel;