import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
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
  Typography,
} from "@mui/material";
import { useId, useState } from "react";

import type { PlotLink } from "../types/PowerProfile";
import { colorModeLabel } from "../utils/profilePresentation";

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
  const label = colorModeLabel(link.label);
  const titleId = useId();

  return (
    <>
      <Card>
        <CardActionArea onClick={() => setOpen(true)}>
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
          <Button size="small" startIcon={<ZoomInIcon />} onClick={() => setOpen(true)}>
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
        aria-labelledby={titleId}
      >
        <DialogTitle id={titleId} sx={{ pr: 7 }}>
          {label} power measurements
          <IconButton
            aria-label="Close graph"
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={plateSx}>
            <Box
              component="img"
              src={link.url}
              alt={`${label} power measurements`}
              sx={{ display: "block", width: "100%", maxHeight: "75vh", objectFit: "contain" }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
