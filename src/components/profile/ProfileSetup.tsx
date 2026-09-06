import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import { Box, Button, Collapse, Paper, Typography } from "@mui/material";
import { lazy, Suspense, useState } from "react";

import type { PowerProfile } from "../../types/PowerProfile";

export { buildSensorYaml, MY_HA_CONFIG_FLOW_URL } from "./profileSetupYaml";

const ProfileSetupDetails = lazy(() =>
  import("./ProfileSetupDetails").then((module) => ({ default: module.ProfileSetupDetails })),
);

export type ProfileSetupProps = {
  profile: PowerProfile;
};

export const ProfileSetup = ({ profile }: ProfileSetupProps) => {
  const [setupExpanded, setSetupExpanded] = useState(false);
  return (
    <Box data-testid="profile-setup">
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        sx={{ minHeight: 44 }}
        aria-expanded={setupExpanded}
        aria-controls="profile-setup-details"
        endIcon={
          <ExpandMoreIcon
            sx={{ transform: setupExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }}
          />
        }
        onClick={() => setSetupExpanded((expanded) => !expanded)}
      >
        Use in Home Assistant
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        View discovery and setup instructions for this profile.
      </Typography>

      <Collapse in={setupExpanded} timeout="auto" mountOnEnter>
        <Paper id="profile-setup-details" variant="outlined" sx={{ p: 2, mt: 1 }}>
          <Suspense fallback={<Typography role="status">Loading setup instructions…</Typography>}>
            <ProfileSetupDetails profile={profile} expanded={setupExpanded} />
          </Suspense>
        </Paper>
      </Collapse>
    </Box>
  );
};
