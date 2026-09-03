import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Manufacturer } from "../../../types/PowerProfile";

import { hasManufacturerLogo, ManufacturerLogo, manufacturerLogoSlug } from "./ManufacturerLogo";

const manufacturer = (overrides: Partial<Manufacturer> = {}): Manufacturer => ({
  dirName: "signify",
  fullName: "Signify",
  aliases: [],
  ...overrides,
});

/**
 * A directory name no logo will ever be collected for. Naming a real manufacturer here makes the
 * monogram tests fail the day someone adds its logo, which is exactly what happened to Lumiman.
 */
const NO_LOGO = "no such manufacturer";

describe("manufacturerLogoSlug", () => {
  it("collapses spaces and punctuation into single dashes", () => {
    expect(manufacturerLogoSlug("paulmann licht")).toBe("paulmann-licht");
    expect(manufacturerLogoSlug("bang olufsen")).toBe("bang-olufsen");
    expect(manufacturerLogoSlug("Neo-CoolCam")).toBe("neo-coolcam");
    expect(manufacturerLogoSlug("3A Smart Home!")).toBe("3a-smart-home");
  });
});

describe("hasManufacturerLogo", () => {
  it("resolves a bundled logo by directory name", () => {
    expect(hasManufacturerLogo("paulmann licht")).toBe(true);
    expect(hasManufacturerLogo("bang olufsen")).toBe(true);
  });

  it("is false for a manufacturer no logo has been collected for", () => {
    expect(hasManufacturerLogo(NO_LOGO)).toBe(false);
  });
});

describe("ManufacturerLogo", () => {
  afterEach(cleanup);

  it("renders full-colour artwork as an image", async () => {
    render(
      <ManufacturerLogo manufacturer={manufacturer({ dirName: "velux", fullName: "Velux" })} />,
    );

    const img = await screen.findByRole("img", { name: "Velux logo" });
    expect(img).toHaveAttribute("src", expect.stringContaining("data:image/svg+xml"));
  });

  it("inlines a monochrome mark so it can inherit a colour", async () => {
    const { container } = render(
      <ManufacturerLogo manufacturer={manufacturer({ dirName: "osram", fullName: "Osram" })} />,
    );

    expect(await screen.findByRole("img", { name: "Osram logo" })).toBeInTheDocument();
    // Inlined rather than referenced, and stripped of its own colour.
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.outerHTML).toContain("currentColor");
  });

  it("uses the cropped mark for the square variant and the lockup for the wide one", async () => {
    const bo = manufacturer({ dirName: "bang olufsen", fullName: "Bang & Olufsen" });

    const { container: square } = render(<ManufacturerLogo manufacturer={bo} />);
    await waitFor(() => expect(square.querySelector("svg")).not.toBeNull());
    const squareViewBox = square.querySelector("svg")?.getAttribute("viewBox");
    cleanup();

    const { container: wide } = render(<ManufacturerLogo manufacturer={bo} variant="wide" />);
    await waitFor(() => expect(wide.querySelector("svg")).not.toBeNull());
    const wideViewBox = wide.querySelector("svg")?.getAttribute("viewBox");

    expect(squareViewBox).toBeTruthy();
    expect(wideViewBox).toBeTruthy();
    expect(squareViewBox).not.toBe(wideViewBox);
  });

  it("falls back to the square mark when a manufacturer has no separate lockup", async () => {
    const osram = manufacturer({ dirName: "osram", fullName: "Osram" });

    const { container: square } = render(<ManufacturerLogo manufacturer={osram} />);
    await waitFor(() => expect(square.querySelector("svg")).not.toBeNull());
    const squareViewBox = square.querySelector("svg")?.getAttribute("viewBox");
    cleanup();

    const { container: wide } = render(<ManufacturerLogo manufacturer={osram} variant="wide" />);
    await waitFor(() => expect(wide.querySelector("svg")).not.toBeNull());

    expect(squareViewBox).toBeTruthy();
    expect(wide.querySelector("svg")?.getAttribute("viewBox")).toBe(squareViewBox);
  });

  it("falls back to a monogram of the first two words", () => {
    render(
      <ManufacturerLogo manufacturer={manufacturer({ dirName: NO_LOGO, fullName: "Lumi Man" })} />,
    );

    expect(screen.getByText("LM")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("uses a single letter for a one-word manufacturer", () => {
    render(
      <ManufacturerLogo manufacturer={manufacturer({ dirName: NO_LOGO, fullName: "Kauf" })} />,
    );

    expect(screen.getByText("K")).toBeInTheDocument();
  });
});
