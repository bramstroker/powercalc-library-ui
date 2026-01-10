import { Box, Link, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[900],
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link
          href="https://github.com/bramstroker/homeassistant-powercalc"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <GitHubIcon fontSize="small" />
          <Typography variant="body2">GitHub</Typography>
        </Link>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link
          href="https://buymeacoffee.com/bramski"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <LocalCafeIcon fontSize="small" />
          <Typography variant="body2">Buy Me A Coffee</Typography>
        </Link>
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        © {currentYear} Bram Gerritsen
      </Typography>
    </Box>
  );
};