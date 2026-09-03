import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";

import { Logo } from "../Logo";

export const HeaderBrand = ({ compactOnMobile }: { compactOnMobile: boolean }) => (
  <Box
    component={RouterLink}
    to="/"
    sx={{
      my: { xs: 1, sm: 2 },
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      // The logo inherits its fill, and this anchor would otherwise tint it with the default link
      // colour instead of the app bar's white.
      color: "inherit",
      minWidth: 0,
    }}
  >
    <Logo width={40} />

    <Box
      sx={{
        ml: 2,
        minWidth: 0,
        // On a phone the search field takes the row, so the wordmark stands down — but without it
        // the bar is just icons floating in empty space.
        display: { xs: compactOnMobile ? "none" : "block", md: "block" },
      }}
    >
      <Typography
        variant="h6"
        component="span"
        noWrap
        sx={{
          display: "block",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".2rem",
          lineHeight: 1.15,
        }}
      >
        Powercalc
      </Typography>
      <Typography
        variant="caption"
        component="span"
        noWrap
        sx={{ display: "block", opacity: 0.75, letterSpacing: ".12em" }}
      >
        Profile Library
      </Typography>
    </Box>
  </Box>
);
