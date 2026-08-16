import GitHubIcon from "@mui/icons-material/GitHub";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PeopleIcon from "@mui/icons-material/People";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { useLibrary } from "../context/LibraryContext";
import { usePageMeta } from "../hooks/usePageMeta";
import type { PowerProfile } from "../types/PowerProfile";

import { getDeviceTypeIcon } from "./library/facetIcons";
import { ManufacturerLogo } from "./ManufacturerLogo";

export const Manufacturer = () => {
  const { manufacturerName } = useParams<{ manufacturerName: string }>();
  const { powerProfiles, manufacturers } = useLibrary();

  const manufacturer = manufacturerName ? manufacturers[manufacturerName] : undefined;

  const profiles = useMemo(() => {
    if (!manufacturerName) return [];
    return powerProfiles.filter((profile) => profile.manufacturer.dirName === manufacturerName);
  }, [powerProfiles, manufacturerName]);

  const profileCount = profiles.length;
  const displayName = manufacturer?.fullName ?? manufacturerName ?? "";

  usePageMeta({
    title: displayName,
    description: `${profileCount} Powercalc device profiles for ${displayName}.`,
  });

  const profilesByDeviceType = useMemo(() => {
    const grouped: Record<string, PowerProfile[]> = {};
    for (const profile of profiles) {
      (grouped[profile.deviceType] ||= []).push(profile);
    }
    // Biggest group first — for a brand with 200 lights and one plug, the lights are the page.
    return Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);
  }, [profiles]);

  if (!manufacturer) {
    return (
      <Container>
        <Typography variant="h5">Manufacturer not found</Typography>
        <Button component={RouterLink} to="/manufacturers" sx={{ mt: 2 }}>
          Back to all manufacturers
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ alignItems: { xs: "flex-start", sm: "center" }, mb: { xs: 1.5, sm: 2 } }}
        >
          <ManufacturerLogo manufacturer={manufacturer} size={72} variant="wide" />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2.125rem" },
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {manufacturer.fullName}
            </Typography>

            {manufacturer.aliases.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                Also known as: {manufacturer.aliases.join(", ")}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: { xs: 1.5, sm: 2 } }}>
          <LibraryBooksIcon fontSize="small" />
          <Typography variant="body2">
            {profileCount} profile{profileCount !== 1 ? "s" : ""}
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
          <Button
            size="small"
            fullWidth
            variant="contained"
            component={RouterLink}
            to={`/?manufacturer=${encodeURIComponent(manufacturer.fullName)}`}
            sx={{ width: { sm: "auto" }, whiteSpace: "normal", textAlign: "center" }}
          >
            View all profiles by this manufacturer
          </Button>

          <Button
            size="small"
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            href={`https://github.com/bramstroker/homeassistant-powercalc/tree/master/profile_library/${manufacturer.dirName}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ width: { sm: "auto" }, whiteSpace: "normal" }}
          >
            Library source
          </Button>
        </Stack>
      </Paper>

      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
      >
        Profiles by Device Type
      </Typography>

      {profilesByDeviceType.map(([deviceType, deviceProfiles]) => {
        const DeviceIcon = getDeviceTypeIcon(deviceType);
        return (
          <Paper key={deviceType} elevation={2} sx={{ mb: { xs: 0, sm: 3 }, p: { xs: 1, sm: 2 } }}>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                px: { xs: 1, sm: 0 },
                mb: 1,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                {DeviceIcon && <DeviceIcon fontSize="small" sx={{ color: "text.secondary" }} />}
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" } }}
                >
                  {deviceType}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {deviceProfiles.length}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 0.5 }} />

            <List disablePadding>
              {deviceProfiles.map((profile) => (
                <ListItem key={profile.modelId} disablePadding divider>
                  <ListItemButton
                    component={RouterLink}
                    to={`/profiles/${profile.manufacturer.dirName}/${profile.modelId}`}
                    sx={{ py: { xs: 1, sm: 1.25 }, px: { xs: 1, sm: 1.5 }, gap: 1 }}
                  >
                    <ListItemText
                      primary={profile.modelId}
                      secondary={profile.name}
                      sx={{ my: 0, minWidth: 0 }}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: { xs: "0.95rem", sm: "1rem" },
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        },
                        secondary: {
                          sx: {
                            fontSize: "0.8rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        },
                      }}
                    />

                    <Chip
                      icon={<PeopleIcon />}
                      label={profile.usageStats.installationCount}
                      size="small"
                      sx={{ display: { xs: "none", sm: "inline-flex" }, flexShrink: 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        );
      })}
    </Container>
  );
};
