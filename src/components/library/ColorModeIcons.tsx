import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import BrightnessIcon from "@mui/icons-material/Brightness6";
import PaletteIcon from "@mui/icons-material/Palette";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { Stack, Tooltip } from "@mui/material";

import { ColorMode } from "../../types/ColorMode";

const ICONS: Record<ColorMode, { title: string; Icon: typeof BrightnessIcon }> = {
  [ColorMode.BRIGHTNESS]: { title: "Brightness", Icon: BrightnessIcon },
  [ColorMode.COLOR_TEMP]: { title: "Color Temperature", Icon: ThermostatIcon },
  [ColorMode.HS]: { title: "Hue/Saturation", Icon: PaletteIcon },
  [ColorMode.EFFECT]: { title: "Effect", Icon: AutoFixHighIcon },
  [ColorMode.TAPERING]: { title: "Tapering", Icon: TrendingDownIcon },
};

export const ColorModeIcons = ({ colorModes }: { colorModes: ColorMode[] }) => {
  if (!colorModes || colorModes.length === 0) {
    return null;
  }

  return (
    // Muted to match the device type icons, in both the filter panel and the grid column.
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", height: "100%", color: "text.secondary" }}
    >
      {colorModes.map((colorMode) => {
        const icon = ICONS[colorMode];
        if (!icon) {
          return null;
        }
        return (
          <Tooltip key={colorMode} title={icon.title}>
            <icon.Icon fontSize="small" />
          </Tooltip>
        );
      })}
    </Stack>
  );
};
