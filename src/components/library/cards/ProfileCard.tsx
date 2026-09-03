import BoltIcon from "@mui/icons-material/Bolt";
import CalculateIcon from "@mui/icons-material/Calculate";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router";

import type { PowerProfile } from "../../../types/PowerProfile";
import { formatDateUtc } from "../../../utils/dateFormat";
import { numberFormat } from "../../../utils/formatters";
import { humanizeIdentifier } from "../../../utils/profilePresentation";
import { isRecentlyAdded } from "../../../utils/recency";
import { profilePath } from "../../../utils/urlSlugs.mjs";
import { ManufacturerLogo } from "../../manufacturer/logo/ManufacturerLogo";
import { getDeviceTypeIcon } from "../../profile/DeviceTypeIcon";
import { NewBadge } from "../presentation/NewBadge";

export const ProfileCard = ({
  profile,
  headingComponent = "h3",
}: {
  profile: PowerProfile;
  headingComponent?: "h3" | "h4";
}) => {
  const DeviceIcon = getDeviceTypeIcon(profile.deviceType);
  const power =
    profile.maxPower != null
      ? `${profile.maxPower} W max`
      : profile.standbyPower != null
        ? `${profile.standbyPower} W standby`
        : null;

  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 2.5 }}>
      <CardActionArea
        component={RouterLink}
        to={profilePath(profile.manufacturer.dirName, profile.modelId)}
        prefetch="intent"
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: "flex-start", gap: 1.5 }}>
            <ManufacturerLogo manufacturer={profile.manufacturer} size={40} plate />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  noWrap
                  sx={{ lineHeight: 1.3 }}
                >
                  {profile.manufacturer.fullName}
                </Typography>
                {isRecentlyAdded(profile) && <NewBadge />}
              </Stack>
              <Typography
                variant="h6"
                component={headingComponent}
                noWrap
                sx={{ fontSize: "1rem", fontWeight: 800 }}
              >
                {profile.modelId}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {profile.name}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
            <Chip
              size="small"
              variant="outlined"
              icon={DeviceIcon ? <DeviceIcon /> : undefined}
              label={humanizeIdentifier(profile.deviceType)}
            />
            <Chip
              size="small"
              variant="outlined"
              icon={<CalculateIcon />}
              label={humanizeIdentifier(profile.calculationStrategy)}
            />
            {power && <Chip size="small" variant="outlined" icon={<BoltIcon />} label={power} />}
          </Stack>

          <Stack direction="row" sx={{ alignItems: "center", gap: 1, mt: "auto" }}>
            <Tooltip title="Known installations reporting use of this profile" arrow>
              <Chip
                size="small"
                icon={<HomeIcon />}
                label={`${numberFormat.format(profile.usageStats.installationCount)} installs`}
              />
            </Tooltip>
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
              Added {formatDateUtc(profile.createdAt, { month: "short", year: "numeric" })}
            </Typography>
            <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
