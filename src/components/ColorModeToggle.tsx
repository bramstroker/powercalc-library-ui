import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton, Tooltip, useColorScheme } from "@mui/material";

export const ColorModeToggle = () => {
  const { mode, systemMode, setMode } = useColorScheme();

  // `mode` is undefined until the provider has resolved the stored preference; rendering nothing
  // until then avoids showing the wrong icon on the first paint.
  if (!mode) {
    return null;
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
