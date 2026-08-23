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
  Collapse,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { subProfileLinks } from "../../api/profileDetails.api";
import { profileFilesQuery } from "../../queries/profileDetails.query";
import type { PowerProfile } from "../../types/PowerProfile";

/** Opens the Powercalc config flow in the reader's own Home Assistant instance. */
export const MY_HA_CONFIG_FLOW_URL =
  "https://my.home-assistant.io/redirect/config_flow_start/?domain=powercalc";

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
  profile: PowerProfile;
};

export const ProfileSetup = ({ profile }: ProfileSetupProps) => {
  const [subProfile, setSubProfile] = useState("");
  const [copied, setCopied] = useState(false);
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [manualSetupExpanded, setManualSetupExpanded] = useState(false);
  const discoveryBy = profile.discoveryBy ?? "entity";
  const isManualOnly = discoveryBy === "manual";
  const {
    data: profileFiles = [],
    isPending: subProfilesPending,
    isError: subProfilesError,
  } = useQuery({
    ...profileFilesQuery(profile),
    enabled: setupExpanded && manualSetupExpanded && profile.subProfileCount > 0,
  });
  const subProfileNames = subProfileLinks(profileFiles).map((link) => link.path.split("/")[0]);

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

  const manualSetup = (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { sm: "center" }, gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }}>
            Through the interface{" "}
            <Typography component="span" variant="body2" color="text.secondary">
              (recommended)
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Start the Powercalc config flow, choose <strong>Virtual power (library)</strong>, and
            pick <strong>{profile.manufacturer.fullName}</strong> →{" "}
            <strong>{profile.modelId}</strong>.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          href={MY_HA_CONFIG_FLOW_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flexShrink: 0, alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          Open in Home Assistant
        </Button>
      </Stack>

      <Accordion
        disableGutters
        elevation={0}
        sx={{ mt: 1, backgroundColor: "transparent", "&:before": { display: "none" } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }}>
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

            {profile.subProfileCount > 0 && (
              <TextField
                select
                size="small"
                label="Sub profile"
                value={subProfile}
                disabled={subProfilesPending || subProfilesError}
                helperText={
                  subProfilesPending
                    ? "Loading sub profiles…"
                    : subProfilesError
                      ? "Could not load sub profiles"
                      : undefined
                }
                onChange={(event) => {
                  setSubProfile(event.target.value);
                }}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">None</MenuItem>
                {subProfileNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
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

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        <Link
          href="https://docs.powercalc.nl/sensor-types/virtual-power-library/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Library sensor documentation
        </Link>
      </Typography>
    </>
  );

  return (
    <Box sx={{ mb: 3 }} data-testid="profile-setup">
      <Button
        variant="outlined"
        aria-expanded={setupExpanded}
        aria-controls="profile-setup-details"
        endIcon={
          <ExpandMoreIcon
            sx={{ transform: setupExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }}
          />
        }
        onClick={() => setSetupExpanded((expanded) => !expanded)}
      >
        Use this profile
      </Button>

      <Collapse in={setupExpanded} timeout="auto">
        <Paper id="profile-setup-details" variant="outlined" sx={{ p: 2, mt: 1 }}>
          {isManualOnly ? (
            <>
              <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                Automatic discovery is not available for this profile. Set it up manually using one
                of the options below.
              </Alert>
              {manualSetup}
            </>
          ) : (
            <>
              <Alert severity="success" variant="outlined">
                Powercalc can discover this model automatically (by {discoveryBy}). Look for a
                discovery prompt in Home Assistant and accept it to create the sensors.{" "}
                <Link
                  href="https://docs.powercalc.nl/library/discovery/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About discovery
                </Link>
              </Alert>

              <Accordion
                disableGutters
                elevation={0}
                expanded={manualSetupExpanded}
                onChange={(_event, expanded) => setManualSetupExpanded(expanded)}
                sx={{ mt: 1, backgroundColor: "transparent", "&:before": { display: "none" } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                  <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Set up manually instead
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>{manualSetup}</AccordionDetails>
              </Accordion>
            </>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
};
