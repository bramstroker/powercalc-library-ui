import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import GitHubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { Box, Button, Paper, Stack, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { useLibrary } from "../context/LibraryContext";
import { usePageMeta } from "../hooks/usePageMeta";
import type { PowerProfile } from "../types/PowerProfile";

import { getDeviceTypeIcon } from "./library/facetIcons";
import { ProfileCard } from "./library/ProfileCard";
import { ManufacturerLogo } from "./ManufacturerLogo";

const numberFormat = new Intl.NumberFormat("en-US");

const HeroStat = ({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) => (
  <Box
    aria-label={`${numberFormat.format(value)} ${(value === 1 ? label.replace(/s$/, "") : label).toLowerCase()}`}
    sx={{
      minWidth: 0,
      p: { xs: 1.25, sm: 1.5 },
      border: 1,
      borderColor: "divider",
      borderRadius: 2,
      bgcolor: "action.hover",
    }}
  >
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 0.75, color: "text.secondary" }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, textTransform: "uppercase" }}
      >
        {label}
      </Typography>
    </Stack>
    <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800, lineHeight: 1.1 }}>
      {numberFormat.format(value)}
    </Typography>
  </Box>
);

export const Manufacturer = () => {
  const { manufacturerName } = useParams<{ manufacturerName: string }>();
  const { powerProfiles, manufacturers } = useLibrary();

  const manufacturer = manufacturerName
    ? manufacturers[manufacturerName]
    : undefined;

  const profiles = useMemo(() => {
    if (!manufacturerName) return [];
    return powerProfiles.filter(
      (profile) => profile.manufacturer.dirName === manufacturerName,
    );
  }, [powerProfiles, manufacturerName]);

  const profileCount = profiles.length;
  const displayName = manufacturer?.fullName ?? manufacturerName ?? "";

  usePageMeta({
    title: displayName,
    description: `${profileCount} Powercalc device profiles for ${displayName}.`,
    noIndex: !manufacturer,
  });

  const profilesByDeviceType = useMemo(() => {
    const grouped: Record<string, PowerProfile[]> = {};
    for (const profile of profiles) {
      (grouped[profile.deviceType] ||= []).push(profile);
    }
    // Biggest group first — for a brand with 200 lights and one plug, the lights are the page.
    return Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);
  }, [profiles]);

  const knownProfileInstallations = profiles.reduce(
    (total, profile) => total + profile.usageStats.installationCount,
    0,
  );

  if (!manufacturer) {
    return (
      <>
        <Typography variant="h5">Manufacturer not found</Typography>
        <Button component={RouterLink} to="/manufacturers" sx={{ mt: 2 }}>
          Back to all manufacturers
        </Button>
      </>
    );
  }

  return (
    <>
      <Paper
        component="section"
        elevation={0}
        sx={[
          {
            position: "relative",
            overflow: "hidden",
            p: { xs: 2, sm: 3.5 },
            mb: { xs: 3, sm: 4 },
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
            backgroundImage:
              "radial-gradient(circle at 90% 0%, rgba(121, 134, 203, 0.22), transparent 42%)",
          },
          (theme) =>
            theme.applyStyles("light", {
              backgroundImage:
                "radial-gradient(circle at 90% 0%, rgba(63, 81, 181, 0.13), transparent 42%)",
            }),
        ]}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 2.5 },
          }}
        >
          <ManufacturerLogo manufacturer={manufacturer} size={64} plate />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 800, lineHeight: 1.2 }}
            >
              Powercalc profile library
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                mt: 0.25,
                fontSize: { xs: "1.75rem", sm: "2.5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                wordBreak: "break-word",
              }}
            >
              {manufacturer.fullName}
            </Typography>

            {manufacturer.aliases.length > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ wordBreak: "break-word" }}
              >
                Also known as: {manufacturer.aliases.join(", ")}
              </Typography>
            )}
          </Box>

          <Stack
            direction={{ xs: "row", sm: "column" }}
            sx={{ width: { xs: "100%", sm: "auto" }, gap: 1 }}
          >
            <Button
              variant="contained"
              component={RouterLink}
              to={`/?manufacturer=${encodeURIComponent(manufacturer.fullName)}`}
              sx={{ flex: { xs: 1, sm: "initial" } }}
            >
              Browse profiles
            </Button>

            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              href={`https://github.com/bramstroker/homeassistant-powercalc/tree/master/profile_library/${manufacturer.dirName}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ flex: { xs: 1, sm: "initial" } }}
            >
              Library source
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.25,
            mt: 3,
          }}
        >
          <HeroStat
            icon={<LibraryBooksIcon fontSize="small" />}
            value={profileCount}
            label="Profiles"
          />
          <Tooltip
            title="The same Home Assistant installation may report more than one profile."
            arrow
          >
            <Box>
              <HeroStat
                icon={<HomeIcon fontSize="small" />}
                value={knownProfileInstallations}
                label="Known installs"
              />
            </Box>
          </Tooltip>
          <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
            <HeroStat
              icon={<DevicesOtherIcon fontSize="small" />}
              value={profilesByDeviceType.length}
              label="Device types"
            />
          </Box>
        </Box>
      </Paper>

      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        Profiles by Device Type
      </Typography>

      {profilesByDeviceType.map(([deviceType, deviceProfiles]) => {
        const DeviceIcon = getDeviceTypeIcon(deviceType);
        return (
          <Box
            component="section"
            key={deviceType}
            sx={{ mb: { xs: 3, sm: 4 } }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", minWidth: 0 }}
              >
                {DeviceIcon && (
                  <DeviceIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                )}
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" } }}
                >
                  {deviceType}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {deviceProfiles.length} profile
                {deviceProfiles.length !== 1 ? "s" : ""}
              </Typography>
            </Stack>

            <Box
              data-testid={`manufacturer-profile-list-${deviceType}`}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {deviceProfiles.map((profile) => (
                <ProfileCard
                  key={profile.modelId}
                  profile={profile}
                  headingComponent="h4"
                />
              ))}
            </Box>
          </Box>
        );
      })}
    </>
  );
};
