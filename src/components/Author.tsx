import GitHubIcon from '@mui/icons-material/GitHub';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PeopleIcon from '@mui/icons-material/People';
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
  Avatar,
  Stack,
  Divider,
  ListItemButton,
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
    return powerProfiles.filter((profile) => profile.author.githubUsername === authorName);
  }, [powerProfiles, authorName]);

  const contributionCount = authorProfiles.length;
  const authorDetails = authorName ? authors[authorName] : null;

  const profilesByDeviceType = useMemo(() => {
    const grouped: Record<string, PowerProfile[]> = {};
    for (const profile of authorProfiles) {
      const deviceType = profile.deviceType;
      (grouped[deviceType] ||= []).push(profile);
    }
    return grouped;
  }, [authorProfiles]);

  if (!authorName) {
    return (
        <Typography variant="h5">Author not found</Typography>
    );
  }

  return (
      <Container>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
          {/* Header */}
          <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
          >
            <Avatar
                src={`https://github.com/${authorName}.png`}
                alt={authorDetails?.name || authorName}
                sx={{ width: { xs: 52, sm: 64 }, height: { xs: 52, sm: 64 } }}
            />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
              >
                {authorDetails?.name || authorName}
              </Typography>

              {authorDetails?.email && (
                  <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ wordBreak: 'break-word' }}
                  >
                    {authorDetails.email}
                  </Typography>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                GitHub: {authorName}
              </Typography>
            </Box>
          </Stack>

          {/* Contribution count */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <LibraryBooksIcon fontSize="small" />
            <Typography variant="body2">
              {contributionCount} contribution{contributionCount !== 1 ? 's' : ''}
            </Typography>
          </Stack>

          {/* Actions */}
          <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                mt: 1,
              }}
          >
            <Button
                size="small"
                fullWidth
                variant="contained"
                component={RouterLink}
                to={`/?author=${encodeURIComponent(authorName)}`}
                sx={{
                  width: { sm: 'auto' },
                  whiteSpace: 'normal',
                  textAlign: 'center',
                }}
            >
              View all profiles by this author
            </Button>

            <Button
                size="small"
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                href={`https://github.com/${authorName}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: { sm: 'auto' },
                  whiteSpace: 'normal',
                }}
            >
              GitHub Profile
            </Button>
          </Stack>
        </Paper>

        <Typography
            variant="h5"
            component="h2"
            sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Contributions by Device Type
        </Typography>

        {Object.entries(profilesByDeviceType).map(([deviceType, profiles]) => (
            <Paper key={deviceType} elevation={2} sx={{ mb: { xs: 0, sm: 3 }, p: { xs: 1, sm: 2 } }}>
              <Stack
                  direction="row"
                  alignItems="baseline"
                  justifyContent="space-between"
                  sx={{ px: { xs: 1, sm: 0 }, mb: 1 }}
              >
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
                >
                  {deviceType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profiles.length}
                </Typography>
              </Stack>

              <Divider sx={{ mb: 0.5 }} />

              <List disablePadding>
                {profiles.map((profile) => (
                    <ListItem
                        key={`${profile.manufacturer.dirName}-${profile.modelId}`}
                        disablePadding
                        divider
                    >
                      <ListItemButton
                          component={RouterLink}
                          to={`/profiles/${profile.manufacturer.dirName}/${profile.modelId}`}
                          sx={{
                            py: { xs: 1, sm: 1.25 },
                            px: { xs: 1, sm: 1.5 },
                            gap: 1,
                          }}
                      >
                        <ListItemText
                            primary={profile.name}
                            secondary={`${profile.manufacturer.fullName} • Created: ${profile.createdAt.toLocaleDateString()}`}
                            sx={{ my: 0, minWidth: 0 }}
                            slotProps={{
                              primary: {
                                sx: {
                                  fontSize: { xs: '0.95rem', sm: '1rem' },
                                  lineHeight: 1.2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                },
                              },
                              secondary: {
                                sx: {
                                  fontSize: '0.8rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                },
                              }
                            }}
                        />

                        <Chip
                            icon={<PeopleIcon />}
                            label={profile.usageStats.installationCount}
                            size="small"
                            sx={{
                              display: { xs: 'none', sm: 'inline-flex' },
                              flexShrink: 0,
                            }}
                        />
                      </ListItemButton>
                    </ListItem>
                ))}
              </List>
            </Paper>
        ))}
      </Container>
  );
};
