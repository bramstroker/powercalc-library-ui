import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useId, useState } from "react";

import type { PlotLink } from "../../types/PowerProfile";
import { colorModeLabel } from "../../utils/profilePresentation";

/**
 * The plots are matplotlib SVGs with a white figure background baked in, so they cannot follow
 * the colour scheme. Inverting them is not an option either — colour carries data here, and the
 * effect plot's legend maps hues to names. They are framed as light plates instead, so on the
 * dark theme each one reads as a figure on paper rather than a hole burnt through the page.
 */
const plateSx = {
  p: 1,
  bgcolor: "common.white",
  borderRadius: 1,
} as const;

const plotDescription = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized.includes("brightness")) return "Measured power draw as brightness changes.";
  if (normalized.includes("color temp"))
    return "Measured power draw across the supported color-temperature range.";
  if (normalized.includes("effect")) return "Measured power draw across supported light effects.";
  return `Measured power curve for the ${normalized} mode.`;
};

export const Plot = ({ link }: { link: PlotLink }) => {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const openGraph = () => {
    setZoom(1);
    setOpen(true);
  };
  const label = colorModeLabel(link.label);
  const titleId = useId();

  return (
    <>
      <Card>
        <CardActionArea onClick={openGraph}>
          <Typography gutterBottom variant="subtitle1" component="div" sx={{ px: 2, pt: 1 }}>
            {label}
          </Typography>
          <Box sx={{ ...plateSx, m: 1, mt: 0 }}>
            <CardMedia
              component="img"
              image={link.url}
              alt={`${label} power measurements`}
              sx={{
                height: 300,
                // `contain` rather than the default `cover`: a plot whose aspect ratio differs
                // from the box should letterbox, not lose its axes off the edge.
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
            {plotDescription(label)}
          </Typography>
        </CardActionArea>
        <CardActions sx={{ px: 2, pt: 0, pb: 2 }}>
          <Button size="small" startIcon={<ZoomInIcon />} onClick={openGraph}>
            Enlarge
          </Button>
          <Button
            size="small"
            startIcon={<OpenInNewIcon />}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open original
          </Button>
        </CardActions>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={fullScreen}
        aria-labelledby={titleId}
      >
        <DialogTitle id={`${titleId}-heading`} sx={{ pr: 7, py: 1.5, fontSize: "1rem" }}>
          <span id={titleId}>{label}</span>
          <IconButton
            aria-label="Close graph"
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Stack direction="row" sx={{ px: 1, alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          <IconButton
            aria-label="Zoom out"
            aria-disabled={zoom === 1}
            sx={{ opacity: zoom === 1 ? 0.4 : 1 }}
            onClick={() => setZoom((value) => Math.max(1, value - 1))}
          >
            <ZoomOutIcon />
          </IconButton>
          <Typography variant="body2" role="status" aria-live="polite">
            {zoom * 100}%
          </Typography>
          <IconButton
            aria-label="Zoom in"
            aria-disabled={zoom === 4}
            sx={{ opacity: zoom === 4 ? 0.4 : 1 }}
            onClick={() => setZoom((value) => Math.min(4, value + 1))}
          >
            <ZoomInIcon />
          </IconButton>
          <Button onClick={() => setZoom(1)}>Fit</Button>
          <Button href={link.url} target="_blank" rel="noopener noreferrer" sx={{ ml: "auto" }}>
            Open original
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1 }}>
          Zoom in, then scroll or swipe to explore the graph.
        </Typography>
        <DialogContent sx={{ p: 0, overflow: "auto" }} tabIndex={0} aria-label="Graph viewport">
          <Box sx={{ bgcolor: "common.white", width: `${zoom * 100}%` }}>
            <Box
              component="img"
              src={link.url}
              alt={`${label} power measurements`}
              sx={{ display: "block", width: "100%", height: "auto" }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
