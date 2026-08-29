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

/**
 * Protocol names as their own standards bodies write them. The generic humaniser would produce
 * "Wifi", "Zwave" and "Rf433", none of which anybody recognises at a glance.
 */
const CONNECTIVITY_LABELS: Record<string, string> = {
  zigbee: "Zigbee",
  wifi: "Wi-Fi",
  zwave: "Z-Wave",
  matter: "Matter",
  thread: "Thread",
  bluetooth: "Bluetooth",
  ethernet: "Ethernet",
  rf433: "RF 433 MHz",
  infrared: "Infrared",
  proprietary: "Proprietary",
};

export const connectivityLabel = (value: string) =>
  CONNECTIVITY_LABELS[value] ?? humanizeIdentifier(value);

/**
 * A product page is linked by its host rather than its full URL: the paths manufacturers use run
 * to a hundred characters of campaign parameters and tell the reader nothing.
 */
export const productUrlLabel = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
