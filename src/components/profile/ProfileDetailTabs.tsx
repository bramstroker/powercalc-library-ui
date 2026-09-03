import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

import {
  profileJsonQuery,
  profilePlotsQuery,
  subProfilesQuery,
} from "../../queries/profileDetails.query";
import type { PowerProfile } from "../../types/PowerProfile";
import { Plot } from "../Plot";

const LoadingDetails = () => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 2 }}>
    <CircularProgress size={22} />
    <Typography color="text.secondary">Loading profile details…</Typography>
  </Stack>
);

const DetailsError = () => (
  <Alert severity="error">The profile details could not be loaded. Please try again.</Alert>
);

export const ProfileJsonTab = ({ profile }: { profile: PowerProfile }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const { data: rawJson, isPending, isError } = useQuery(profileJsonQuery(profile));

  if (isPending) return <LoadingDetails />;
  if (isError) return <DetailsError />;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rawJson, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <Paper sx={{ p: 2, position: "relative" }}>
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
        <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"} arrow>
          <IconButton
            onClick={() => void handleCopy()}
            size="small"
            color={copySuccess ? "success" : "default"}
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box component="pre" sx={{ m: 0, overflow: "auto" }}>
        {JSON.stringify(rawJson, null, 2)}
      </Box>
    </Paper>
  );
};

export const ProfileSubProfilesTab = ({ profile }: { profile: PowerProfile }) => {
  const [copySuccessMap, setCopySuccessMap] = useState<Record<string, boolean>>({});
  const [expandedSubProfiles, setExpandedSubProfiles] = useState<Record<string, boolean>>({});
  const { data: subProfiles, isPending, isError } = useQuery(subProfilesQuery(profile));

  if (isPending) return <LoadingDetails />;
  if (isError) return <DetailsError />;

  const handleCopy = async (name: string, json: Record<string, unknown>) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopySuccessMap((previous) => ({ ...previous, [name]: true }));
      setTimeout(() => {
        setCopySuccessMap((previous) => ({ ...previous, [name]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <List component="nav" aria-label="sub profiles">
      {subProfiles.map((subProfile) => {
        const expanded = Boolean(expandedSubProfiles[subProfile.name]);
        return (
          <React.Fragment key={subProfile.name}>
            <ListItemButton
              onClick={() =>
                setExpandedSubProfiles((previous) => ({
                  ...previous,
                  [subProfile.name]: !previous[subProfile.name],
                }))
              }
              aria-expanded={expanded}
              aria-controls={`sub-profile-${subProfile.name}`}
            >
              <ListItemText primary={subProfile.name} />
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse
              in={expanded}
              id={`sub-profile-${subProfile.name}`}
              timeout="auto"
              unmountOnExit
            >
              <Paper sx={{ p: 2, m: 2, position: "relative" }}>
                <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
                  <Tooltip
                    title={copySuccessMap[subProfile.name] ? "Copied!" : "Copy to clipboard"}
                    arrow
                  >
                    <IconButton
                      onClick={() => void handleCopy(subProfile.name, subProfile.rawJson)}
                      size="small"
                      color={copySuccessMap[subProfile.name] ? "success" : "default"}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box component="pre" sx={{ m: 0, overflow: "auto" }}>
                  {JSON.stringify(subProfile.rawJson, null, 2)}
                </Box>
              </Paper>
            </Collapse>
          </React.Fragment>
        );
      })}
    </List>
  );
};

export const ProfilePlotsTab = ({ profile }: { profile: PowerProfile }) => {
  const { data: plots, isPending, isError } = useQuery(profilePlotsQuery(profile));

  if (isPending) return <LoadingDetails />;
  if (isError) return <DetailsError />;
  if (plots.length === 0) {
    return (
      <Typography color="text.secondary">No graphs are available for this profile.</Typography>
    );
  }

  return (
    <Grid container spacing={1} sx={{ width: "100%" }}>
      {plots.map((plot) => (
        <Plot key={plot.url} link={plot} />
      ))}
    </Grid>
  );
};
