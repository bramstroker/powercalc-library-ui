/** Visually hides content while keeping it available to assistive technology. */
export const visuallyHiddenSx = {
  border: 0,
  clip: "rect(0 0 0 0)",
  display: "block",
  height: "1px",
  left: 0,
  margin: -1,
  maxWidth: "1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} as const;
