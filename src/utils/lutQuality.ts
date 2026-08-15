import type { PowerProfile } from "../types/PowerProfile";

export type QualityBand = "Excellent" | "Good" | "Fair" | "Poor" | "Not applicable";

/**
 * The bands the raw score is bucketed into for filtering, best first.
 *
 * Scores are heavily skewed — around 80% of the library sits between 90 and 100 — so a numeric
 * slider would spend nine tenths of its track on the part nobody needs. The thresholds live here
 * rather than in `library.json` so they can be retuned without regenerating the library.
 */
export const QUALITY_BANDS: { label: QualityBand; min: number }[] = [
  { label: "Excellent", min: 95 },
  { label: "Good", min: 85 },
  { label: "Fair", min: 70 },
  { label: "Poor", min: 0 },
];

/** Bucket for profiles without a LUT — fixed, linear and playbook strategies carry no score. */
export const NO_QUALITY_BAND: QualityBand = "Not applicable";

export const getQualityBand = (score: number | null | undefined): QualityBand => {
  if (score == null) {
    return NO_QUALITY_BAND;
  }
  return QUALITY_BANDS.find((band) => score >= band.min)?.label ?? NO_QUALITY_BAND;
};

export const getProfileQualityBand = (profile: PowerProfile): QualityBand =>
  getQualityBand(profile.lutQuality?.score);

/**
 * Facet options come back ordered by count, which scrambles the bands ("Excellent, Not
 * applicable, Poor, Fair, Good"). Reading order is the point here, so put them back in rank.
 */
export const sortByQualityBand = <T extends { value: string }>(options: T[]): T[] => {
  const order = [...QUALITY_BANDS.map((band) => band.label as string), NO_QUALITY_BAND];
  return [...options].sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
};

/** MUI palette colour per band, for chips and the grid cell. */
export const QUALITY_BAND_COLORS: Record<QualityBand, "success" | "info" | "warning" | "error" | "default"> = {
  Excellent: "success",
  Good: "info",
  Fair: "warning",
  Poor: "error",
  "Not applicable": "default",
};
