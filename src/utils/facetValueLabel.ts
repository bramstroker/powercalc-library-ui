import type { FacetKey } from "../types/LibraryFilters";

import { colorModeLabel, connectivityLabel, humanizeIdentifier } from "./profilePresentation";

/** Display labels never change the technical values used by filters and shared URLs. */
export const facetValueLabel = (key: FacetKey, value: string): string => {
  if (key === "colorMode") return colorModeLabel(value);
  if (key === "connectivity") return connectivityLabel(value);
  if (key === "calculationStrategy") {
    return (
      (
        { lut: "Lookup table (LUT)", fixed: "Fixed power", linear: "Linear" } as Record<
          string,
          string
        >
      )[value] ?? humanizeIdentifier(value)
    );
  }
  if (["deviceType", "formFactor", "measureMethod"].includes(key)) return humanizeIdentifier(value);
  return value;
};
