import { Box } from "@mui/material";

import type { Manufacturer } from "../../../types/PowerProfile";

import { getManufacturerLogoSource, type ManufacturerLogoVariant } from "./manufacturerLogoAssets";
import { useManufacturerLogoAsset } from "./useManufacturerLogoAsset";

export { hasManufacturerLogo, manufacturerLogoSlug } from "./manufacturerLogoAssets";
export type { ManufacturerLogoVariant } from "./manufacturerLogoAssets";

export type ManufacturerLogoProps = {
  manufacturer: Manufacturer;
  /** Height budget for the artwork in pixels; the plate, where drawn, adds its padding on top. */
  size?: number;
  /**
   * `square` — a `size`×`size` slot. Use it in lists and grids, where a row of logos should read
   * as one column rather than a ragged mix of marks and wordmarks.
   * `wide` — the full lockup where a manufacturer has one, in a slot that shrink-wraps the artwork
   * up to `MAX_ASPECT`. Use it where a single logo stands alone and has room.
   */
  variant?: ManufacturerLogoVariant;
  /**
   * Draws the mark on a rounded plate. Wordmarks run to 8:1, so against bare page background they
   * render as a thin strip of ink with no edge to sit against — a plate gives them one, and makes
   * a collected logo and the monogram fallback read as the same component.
   *
   * The plate is deliberately a few percent off the page colour rather than its own surface: the
   * legibility maths above is calibrated against the page, so a plate dark enough to count as a
   * different background would invalidate the ink each monochrome mark was recoloured to.
   */
  plate?: boolean;
};

/** First letters of the first two words, e.g. "Bang & Olufsen" -> "BO", "Signify" -> "S". */
const monogram = (fullName: string) =>
  fullName
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Lockups run to 8:1, so the wide slot has to cap the width somewhere to stay predictable. The cap
 * doubles as the height a wordmark can reach: capped at 2.5 a wordmark spent its whole width budget
 * long before it filled the height it was given, and rendered as a sliver.
 */
const MAX_ASPECT = 4;

/**
 * The manufacturer's mark, or a monogram tile when no logo has been collected yet. Every variant
 * occupies the same slot so rows and cards keep their rhythm whichever one a manufacturer gets.
 */
export const ManufacturerLogo = ({
  manufacturer,
  size = 40,
  variant = "square",
  plate = false,
}: ManufacturerLogoProps) => {
  const source = getManufacturerLogoSource(manufacturer.dirName, variant);
  const asset = useManufacturerLogoAsset(source);
  const maxWidth = variant === "wide" ? size * MAX_ASPECT : size;
  const inset = plate ? Math.max(4, Math.round(size * 0.18)) : 0;

  /**
   * The wide variant stands alone, so its slot shrink-wraps the artwork on both axes — a fixed
   * `maxWidth` box would leave a 8:1 wordmark adrift in the empty half of its own plate. The
   * square variant keeps a rigid slot: in a grid, a logo that sets its own width drags the text
   * beside it out of line with every other row.
   */
  const shrinkWrap = variant === "wide";

  /**
   * The artwork's drawn box: as tall as the height budget allows, then shrunk to whatever height
   * still fits the width cap. Computed here rather than left to `max-width` so the box is exactly
   * the drawing, with no slack for the mark to sit adrift in.
   */
  const drawnHeight = asset?.aspect ? Math.min(size, maxWidth / asset.aspect) : size;
  const drawnWidth = asset?.aspect ? drawnHeight * asset.aspect : size;

  const slot = {
    boxSizing: "border-box",
    height: shrinkWrap ? drawnHeight + inset * 2 : size + inset * 2,
    width: shrinkWrap ? drawnWidth + inset * 2 : size + inset * 2,
    // The widths above are absolute pixels derived from the artwork, so on a narrow screen a long
    // lockup would otherwise push its container wider than the viewport.
    maxWidth: "100%",
    p: `${inset}px`,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...(plate && {
      borderRadius: 2,
      bgcolor: "action.hover",
    }),
  } as const;

  /** The artwork itself, pinned to its computed box. */
  const artwork = { height: drawnHeight, width: drawnWidth, maxWidth: "100%" } as const;

  if (!asset) {
    // A logo that exists but has not arrived yet holds its slot empty; swapping a monogram in and
    // straight back out again would flicker.
    if (source) {
      // A shrink-wrapping slot would collapse to its own padding while empty, so it holds the
      // artwork's height for the moment the fetch takes rather than popping open around it.
      return <Box sx={[slot, { height: size + inset * 2, width: size + inset * 2 }]} aria-hidden />;
    }
    return (
      <Box sx={[slot, { height: size + inset * 2, width: size + inset * 2 }]}>
        <Box
          aria-hidden
          sx={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // The plate already supplies the tile; drawing a second one inside it just prints a
            // darker square on a lighter square.
            ...(plate ? {} : { borderRadius: 1, bgcolor: "action.hover" }),
            color: "text.secondary",
            fontSize: Math.max(11, Math.round(size * 0.36)),
            fontWeight: 700,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {monogram(manufacturer.fullName)}
        </Box>
      </Box>
    );
  }

  if (asset.imageSrc) {
    return (
      <Box sx={slot}>
        <Box
          component="img"
          src={asset.imageSrc}
          alt={`${manufacturer.fullName} logo`}
          loading="lazy"
          // Logos come in every aspect ratio there is; the slot is the frame, not the artwork.
          // Sized off the height budget rather than capped by it, so a mark fills the space it was
          // given instead of settling at whatever intrinsic size its SVG happens to declare.
          sx={{ ...artwork, objectFit: "contain" }}
        />
      </Box>
    );
  }

  return (
    <Box
      role="img"
      aria-label={`${manufacturer.fullName} logo`}
      sx={[
        slot,
        // Brand ink where it survives the theme it is painted on, the text colour where it does not.
        { color: asset.color?.dark ?? "text.primary" },
        (theme) => theme.applyStyles("light", { color: asset.color?.light ?? "text.primary" }),
        { "& svg": { ...artwork, display: "block" } },
      ]}
      // Build-time assets from this repository, never user input.
      dangerouslySetInnerHTML={{ __html: asset.inlineSvg ?? "" }}
    />
  );
};
