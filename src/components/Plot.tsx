import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import { useState } from "react";

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

export const Plot = ({ link }: { link: PlotLink }) => {
  const [open, setOpen] = useState(false);
  const label = colorModeLabel(link.label);

  return (
    <>
      <Card onClick={() => setOpen(true)}>
        <CardActionArea>
          <Typography
            gutterBottom
            variant="subtitle1"
            component="div"
            sx={{ px: 2, pt: 1 }}
          >
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
        </CardActionArea>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box sx={plateSx}>
            <Box
              component="img"
              src={link.url}
              alt={`${label} power measurements`}
              sx={{ display: "block", width: "100%" }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
