/**
 * Words that have a settled spelling of their own. Without them `lut` becomes "Lut", which sits
 * badly next to the "LUT quality" label right beside it on the profile page.
 */
const ACRONYMS: Record<string, string> = { IOT: "IoT", LUT: "LUT" };

export const humanizeIdentifier = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => ACRONYMS[part.toUpperCase()] ?? part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/**
 * Home Assistant colour-mode keys, spelled the way the generated plots title themselves. Left to
 * the generic humaniser, `hs` becomes "Hs" — shoutier than the raw key and no clearer.
 */
const COLOR_MODE_LABELS: Record<string, string> = {
  brightness: "Brightness",
  color_temp: "Color temperature",
  effect: "Effects",
  hs: "Hue and saturation",
};

export const colorModeLabel = (value: string) =>
  COLOR_MODE_LABELS[value] ?? humanizeIdentifier(value);
