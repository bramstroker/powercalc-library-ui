export const humanizeIdentifier = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) =>
      part.toUpperCase() === "IOT"
        ? "IoT"
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
