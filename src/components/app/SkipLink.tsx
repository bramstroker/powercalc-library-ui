import { Box } from "@mui/material";

export const SkipLink = () => (
  <Box
    component="a"
    href="#main-content"
    sx={{
      position: "fixed",
      top: 8,
      left: 8,
      zIndex: (theme) => theme.zIndex.tooltip + 1,
      px: 2,
      py: 1,
      borderRadius: 1,
      bgcolor: "background.paper",
      color: "text.primary",
      boxShadow: 4,
      transform: "translateY(calc(-100% - 16px))",
      transition: "transform 120ms ease-out",
      "&:focus": { transform: "translateY(0)" },
    }}
  >
    Skip to main content
  </Box>
);
