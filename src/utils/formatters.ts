export const numberFormat = new Intl.NumberFormat("en-US");

export const compactNumberFormat = new Intl.NumberFormat("en", { notation: "compact" });

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Turns a country code into readable text, while preserving unknown analytics values. */
export const formatCountryName = (code: string): string => {
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};
