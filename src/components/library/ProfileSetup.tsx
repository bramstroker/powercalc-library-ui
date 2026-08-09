import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

import type { FullPowerProfile } from "../../types/PowerProfile";

/** Opens the Powercalc config flow in the reader's own Home Assistant instance. */
export const MY_HA_CONFIG_FLOW_URL =
  "https://my.home-assistant.io/redirect/config_flow_start/?domain=powercalc";

const MY_HA_BADGE_URL = "https://my.home-assistant.io/badges/config_flow_start.svg";

/**
 * Builds the YAML a Home Assistant user pastes into configuration.yaml.
 * Sub-profiles are appended to the model with a slash, per the Powercalc docs.
 */
export const buildSensorYaml = ({
  manufacturerDir,
  modelId,
  subProfile,
  entityId,
}: {
  manufacturerDir: string;
  modelId: string;
  subProfile?: string;
  entityId: string;
}): string => {
  const model = subProfile ? `${modelId}/${subProfile}` : modelId;
  return [
    "powercalc:",
    "  sensors:",
    `    - entity_id: ${entityId}`,
    `      manufacturer: ${manufacturerDir}`,
    `      model: ${model}`,
  ].join("\n");
};

const ENTITY_PLACEHOLDER = "light.my_light";

export type ProfileSetupProps = {
  profile: FullPowerProfile;
};

export const ProfileSetup = ({ profile }: ProfileSetupProps) => {
  const [subProfile, setSubProfile] = useState("");
  const [copied, setCopied] = useState(false);
  // The badge is served by my.home-assistant.io; fall back to a plain button if it cannot load.
  const [badgeFailed, setBadgeFailed] = useState(false);

  const yaml = buildSensorYaml({
    manufacturerDir: profile.manufacturer.dirName,
    modelId: profile.modelId,
    subProfile: subProfile || undefined,
    entityId: ENTITY_PLACEHOLDER,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard access can be denied; the snippet is selectable either way.
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }} data-testid="profile-setup">
      <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700, mb: 1.5 }}>
        Use this profile
      </Typography>

      {profile.discoveryBy && (
        <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>
          Powercalc discovers this model automatically (by {profile.discoveryBy}) — it should appear
          in Home Assistant without any setup.{" "}
          <Link href="https://docs.powercalc.nl/library/discovery/" target="_blank" rel="noopener">
            About discovery
          </Link>
        </Alert>
      )}

      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Through the interface{" "}
        <Typography component="span" variant="body2" color="text.secondary">
          (recommended)
        </Typography>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
        Start the Powercalc config flow, choose <strong>Virtual power sensor</strong>, then{" "}
        <strong>Library</strong>, and pick <strong>{profile.manufacturer.fullName}</strong> →{" "}
        <strong>{profile.modelId}</strong>.
      </Typography>

      <Box sx={{ mb: 1 }}>
        {badgeFailed ? (
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            href={MY_HA_CONFIG_FLOW_URL}
            target="_blank"
            rel="noopener"
          >
            Open in my Home Assistant
          </Button>
        ) : (
          <Link href={MY_HA_CONFIG_FLOW_URL} target="_blank" rel="noopener">
            <Box
              component="img"
              src={MY_HA_BADGE_URL}
              alt="Open your Home Assistant instance and start setting up a new integration."
              onError={() => {
                setBadgeFailed(true);
              }}
              sx={{ height: 30, display: "block" }}
            />
          </Link>
        )}
      </Box>

      <Accordion
        disableGutters
        elevation={0}
        sx={{ mt: 1, backgroundColor: "transparent", "&:before": { display: "none" } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Or configure with YAML
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { sm: "center" }, gap: 1, mb: 1.5 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              Add this to your <code>configuration.yaml</code>, replacing{" "}
              <code>{ENTITY_PLACEHOLDER}</code> with your own entity.
            </Typography>

            {profile.subProfiles.length > 0 && (
              <TextField
                select
                size="small"
                label="Sub profile"
                value={subProfile}
                onChange={(event) => {
                  setSubProfile(event.target.value);
                }}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">None</MenuItem>
                {profile.subProfiles.map((entry) => (
                  <MenuItem key={entry.name} value={entry.name}>
                    {entry.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Tooltip title={copied ? "Copied" : "Copy YAML"}>
              <Button
                size="small"
                variant="outlined"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={() => {
                  void handleCopy();
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </Tooltip>
          </Stack>

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.5,
              borderRadius: 1,
              overflowX: "auto",
              fontSize: "0.8125rem",
              backgroundColor: (theme) => theme.palette.action.hover,
            }}
          >
            <code>{yaml}</code>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
        <Link
          href="https://docs.powercalc.nl/sensor-types/virtual-power-library/"
          target="_blank"
          rel="noopener"
        >
          Library sensor documentation
        </Link>
      </Typography>
    </Paper>
  );
};
