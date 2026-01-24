import GitHubIcon from '@mui/icons-material/GitHub';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { 
  Typography, 
  Box, 
  Paper, 
  Container, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';
import { useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import { useLibrary } from '../context/LibraryContext';
import type { PowerProfile } from '../types/PowerProfile';

export const Author = () => {
  const { authorName } = useParams<{ authorName: string }>();
  const { powerProfiles, authors } = useLibrary();

  const authorProfiles = useMemo(() => {
    if (!authorName) return [];
    return powerProfiles.filter(profile => profile.author.githubUsername === authorName);
  }, [powerProfiles, authorName]);

  const contributionCount = authorProfiles.length;

  // Get author details from the authors hashMap
  const authorDetails = authorName ? authors[authorName] : null;

  // Group profiles by device type for better organization
  const profilesByDeviceType = useMemo(() => {
    const grouped: Record<string, PowerProfile[]> = {};

    authorProfiles.forEach(profile => {
      const deviceType = profile.deviceType;
      if (!grouped[deviceType]) {
        grouped[deviceType] = [];
      }
      grouped[deviceType].push(profile);
    });

    return grouped;
  }, [authorProfiles]);

  if (!authorName) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4">Author not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={`https://github.com/${authorName}.png`}
            alt={authorDetails?.name || authorName}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h4" component="h1">
              {authorDetails?.name || authorName}
            </Typography>
            {authorDetails?.email && (
              <Typography variant="body1" color="text.secondary">
                {authorDetails.email}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              GitHub: {authorName}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LibraryBooksIcon sx={{ mr: 1 }} />
          <Typography variant="body1">
            {contributionCount} contribution{contributionCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to={`/?author=${encodeURIComponent(authorName)}`}
          >
            View all profiles by this author
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<GitHubIcon />}
            href={`https://github.com/${authorName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Profile
          </Button>
        </Box>
      </Paper>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Contributions by Device Type
      </Typography>

      {Object.entries(profilesByDeviceType).map(([deviceType, profiles]) => (
        <Paper key={deviceType} elevation={2} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            {deviceType} ({profiles.length})
          </Typography>

          <List>
            {profiles.map(profile => (
              <ListItem 
                key={`${profile.manufacturer.dirName}-${profile.modelId}`}
                component={RouterLink}
                to={`/profiles/${profile.manufacturer.dirName}/${profile.modelId}`}
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemText 
                  primary={profile.name} 
                  secondary={`${profile.manufacturer.fullName} • Created: ${profile.createdAt.toLocaleDateString()}`}
                />
                <Chip 
                  label={profile.deviceType} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Container>
  );
};
