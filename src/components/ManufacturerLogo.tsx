import { Box } from "@mui/material";
import { useEffect, useState } from "react";

import type { Manufacturer } from "../types/PowerProfile";

/**
 * Filename a manufacturer's logo is expected under in `src/assets/manufacturer-logos`. Directory
 * names carry spaces and punctuation ("paulmann licht", "bang olufsen"), none of which belong in a
 * bundled asset name.
 */
export const manufacturerLogoSlug = (dirName: string) =>
  dirName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Enumerated at build time rather than by pointing an `<img>` at a conventional URL: only half of
 * the 121 manufacturers have a logo, and the index page would otherwise fire a 404 for every one
 * that does not. The glob is deliberately *not* eager — bundling all 68 files inline costs ~75kB
 * gzipped, which the profile page would pay to show a single mark. Each logo is its own chunk,
 * fetched when something actually renders it.
 *
 * Source rather than URL because monochrome marks are inlined so they can inherit a colour.
 */
const logoLoaders = import.meta.glob<string>("../assets/manufacturer-logos/*.svg", {
  query: "?raw",
  import: "default",
});

/** Surfaces the logos sit on, needed to judge whether a brand colour stays legible. */
const PAPER = { light: "#ffffff", dark: "#121212" } as const;

/**
 * Solid marks read at a lower contrast than text does, but below roughly 2:1 a logo starts to
 * dissolve into its background — Sony's white and Sonos' black each vanish on one of the themes.
 */
const MIN_CONTRAST = 2.2;

const relativeLuminance = (hex: string) => {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

type Hsl = [number, number, number];

const hexToHsl = (hex: string): Hsl => {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
};

const hslToHex = ([h, s, l]: Hsl) => {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * Darkens or lightens a brand colour until it stands out from the page, keeping its hue. Snapping
 * straight to the text colour instead reads as the wrong logo — TP-Link's cyan turning black on
 * the light theme looks like a mistake, where a deeper cyan still looks like TP-Link.
 */
const legibleOn = (brand: string, paper: string) => {
  if (contrast(brand, paper) >= MIN_CONTRAST) return brand;

  const [h, s, l] = hexToHsl(brand);
  const towardsDark = relativeLuminance(paper) > 0.5;
  for (let step = 1; step <= 100; step++) {
    const shifted = towardsDark ? l - step / 100 : l + step / 100;
    if (shifted < 0 || shifted > 1) break;
    const candidate = hslToHex([h, s, shifted]);
    if (contrast(candidate, paper) >= MIN_CONTRAST) return candidate;
  }
  return towardsDark ? "#000000" : "#ffffff";
};

type LogoAsset = {
  /** Inline-able source for monochrome marks; undefined for full-colour artwork. */
  inlineSvg?: string;
  /** `<img>` source for full-colour artwork; undefined for monochrome marks. */
  imageSrc?: string;
  /** Colour to paint a monochrome mark in, per colour scheme. */
  color?: { light: string; dark: string };
};

const buildAsset = (svg: string): LogoAsset => {
  // The build step flattens single-ink artwork to `currentColor` and records the brand ink, so a
  // mark that would disappear against one of the themes can fall back to the text colour.
  const isMonochrome = svg.includes("currentColor");
  if (!isMonochrome) {
    return { imageSrc: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
  }

  const brand = /data-brand="(#[0-9a-fA-F]{6})"/.exec(svg)?.[1];
  /**
   * Whether the brand colour is worth preserving at all. A black or white mark has no hue, and one
   * pinned to either end of the lightness range — Denon's near-black #0B131A — carries so little of
   * it that shifting the colour only yields a muddy grey. The theme's text colour is crisper.
   */
  const carriesHue = (() => {
    if (!brand) return false;
    const [, saturation, lightness] = hexToHsl(brand);
    return saturation >= 0.1 && lightness > 0.12 && lightness < 0.88;
  })();

  const inkFor = (scheme: keyof typeof PAPER) =>
    brand && carriesHue ? legibleOn(brand, PAPER[scheme]) : "text.primary";

  return {
    // The wrapper carries the accessible name, so the mark itself must not announce a second one.
    inlineSvg: svg.replace("<svg", '<svg aria-hidden="true" focusable="false"'),
    color: { light: inkFor("light"), dark: inkFor("dark") },
  };
};

/**
 * A manufacturer ships `<slug>.svg` and, where its lockup carries a separable mark that is worth
 * showing on its own, also `<slug>.wide.svg` holding the full lockup.
 */
type LogoLoader = () => Promise<string>;
type LogoEntry = { square?: LogoLoader; wide?: LogoLoader };

const loadersBySlug = new Map<string, LogoEntry>();
for (const [path, load] of Object.entries(logoLoaders)) {
  const file = path.slice(path.lastIndexOf("/") + 1, -".svg".length);
  const isWide = file.endsWith(".wide");
  const slug = isWide ? file.slice(0, -".wide".length) : file;
  const entry = loadersBySlug.get(slug) ?? {};
  entry[isWide ? "wide" : "square"] = load;
  loadersBySlug.set(slug, entry);
}

export const hasManufacturerLogo = (dirName: string): boolean =>
  loadersBySlug.has(manufacturerLogoSlug(dirName));

/** Parsed assets and in-flight fetches, so a logo is only ever fetched and parsed once. */
const assetCache = new Map<string, LogoAsset>();
const inFlight = new Map<string, Promise<LogoAsset>>();

const loadAsset = (key: string, load: LogoLoader): Promise<LogoAsset> => {
  const pending = inFlight.get(key);
  if (pending) return pending;
  const promise = load().then((svg) => {
    const asset = buildAsset(svg);
    assetCache.set(key, asset);
    inFlight.delete(key);
    return asset;
  });
  inFlight.set(key, promise);
  return promise;
};

/** First letters of the first two words, e.g. "Bang & Olufsen" -> "BO", "Signify" -> "S". */
const monogram = (fullName: string) =>
  fullName
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

export type ManufacturerLogoVariant = "square" | "wide";

export type ManufacturerLogoProps = {
  manufacturer: Manufacturer;
  /** Height of the logo slot in pixels. */
  size?: number;
  /**
   * `square` — a `size`×`size` slot. Use it in lists and grids, where a row of logos should read
   * as one column rather than a ragged mix of marks and wordmarks.
   * `wide` — the same height with the width free up to `MAX_ASPECT`, and the full lockup where a
   * manufacturer has one. Use it where a single logo stands alone and has room.
   */
  variant?: ManufacturerLogoVariant;
};

/** Lockups run to 6:1, so the wide slot has to cap the width somewhere to stay predictable. */
const MAX_ASPECT = 2.5;

/**
 * The manufacturer's mark, or a monogram tile when no logo has been collected yet. Every variant
 * occupies the same slot so rows and cards keep their rhythm whichever one a manufacturer gets.
 */
export const ManufacturerLogo = ({
  manufacturer,
  size = 40,
  variant = "square",
}: ManufacturerLogoProps) => {
  const slug = manufacturerLogoSlug(manufacturer.dirName);
  const entry = loadersBySlug.get(slug);
  // Most manufacturers have no separate lockup, so the wide slot falls back to the square mark.
  const load = variant === "wide" ? (entry?.wide ?? entry?.square) : entry?.square;
  const cacheKey = `${slug}:${load === entry?.wide ? "wide" : "square"}`;

  const [asset, setAsset] = useState<LogoAsset | undefined>(() => assetCache.get(cacheKey));

  useEffect(() => {
    if (!load || assetCache.has(cacheKey)) {
      setAsset(assetCache.get(cacheKey));
      return;
    }
    let live = true;
    void loadAsset(cacheKey, load).then((resolved) => {
      if (live) setAsset(resolved);
    });
    return () => {
      live = false;
    };
  }, [cacheKey, load]);

  const maxWidth = variant === "wide" ? size * MAX_ASPECT : size;
  const slot = {
    height: size,
    width: maxWidth,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as const;

  if (!asset) {
    // A logo that exists but has not arrived yet holds its slot empty; swapping a monogram in and
    // straight back out again would flicker.
    if (load) {
      return <Box sx={slot} aria-hidden />;
    }
    return (
      <Box sx={slot}>
        <Box
          aria-hidden
          sx={{
            width: size,
            height: size,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
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
          sx={{ maxHeight: size, maxWidth, objectFit: "contain" }}
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
        { "& svg": { height: size, maxWidth, width: "auto", display: "block" } },
      ]}
      // Build-time assets from this repository, never user input.
      dangerouslySetInnerHTML={{ __html: asset.inlineSvg ?? "" }}
    />
  );
};
