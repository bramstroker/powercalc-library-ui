import GitHubIcon from "@mui/icons-material/GitHub";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

const NAVIGATION_LINKS = [
  { label: "Browse profiles", to: "/" },
  { label: "Manufacturers", to: "/manufacturers" },
  { label: "Device types", to: "/device-types" },
  { label: "Contributors", to: "/contributors" },
  { label: "Contribute", to: "/contribute" },
  { label: "What's new", to: "/whats-new" },
  { label: "Statistics", to: "/statistics" },
  { label: "Analytics", to: "/analytics" },
  { label: "About", to: "/about" },
] as const;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        py: 1.5,
        px: 2,
        mt: "auto",
        backgroundColor: theme.palette.grey[900],
        ...theme.applyStyles("light", { backgroundColor: theme.palette.grey[200] }),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      })}
    >
      <Box
        component="nav"
        aria-label="Footer navigation"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 2,
          rowGap: 0.5,
        }}
      >
        {NAVIGATION_LINKS.map(({ label, to }) => (
          <Link key={to} component={RouterLink} to={to} color="inherit" variant="body2">
            {label}
          </Link>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Link
          href="https://github.com/bramstroker/homeassistant-powercalc"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          variant="body2"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
        >
          <GitHubIcon fontSize="small" />
          GitHub
        </Link>

        <Link
          href="https://buymeacoffee.com/bramski"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          variant="body2"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
        >
          <LocalCafeIcon fontSize="small" />
          Buy Me A Coffee
        </Link>

        <Typography variant="body2" color="text.secondary">
          © {currentYear} Bram Gerritsen
        </Typography>
      </Box>
    </Box>
  );
};
