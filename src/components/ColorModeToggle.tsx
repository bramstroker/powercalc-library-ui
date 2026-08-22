import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Box, IconButton, Tooltip, useColorScheme } from "@mui/material";

export const ColorModeToggle = () => {
  const { mode, systemMode, setMode } = useColorScheme();

  // `mode` is undefined until the provider has resolved the stored preference; rendering no icon
  // until then avoids showing the wrong one on the first paint. The placeholder keeps the button's
  // 40x40 box reserved, so the toolbar does not shift once the real toggle appears.
  if (!mode) {
    return <Box aria-hidden sx={{ width: 40, height: 40, flexShrink: 0 }} />;
  }

  const resolved = mode === "system" ? (systemMode ?? "dark") : mode;
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <Tooltip title={`Switch to ${next} mode`}>
      <IconButton
        color="inherit"
        aria-label={`Switch to ${next} mode`}
        onClick={() => {
          setMode(next);
        }}
      >
        {resolved === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};
