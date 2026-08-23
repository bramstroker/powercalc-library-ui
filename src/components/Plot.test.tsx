import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Plot } from "./Plot";

describe("Plot", () => {
  afterEach(cleanup);

  it("names a colour mode the way the plot titles itself", () => {
    render(<Plot link={{ label: "hs", url: "https://example.test/hs.svg" }} />);

    // "Hs" is what the generic humaniser would produce, and it reads worse than the raw key.
    expect(screen.getByText("Hue and saturation")).toBeInTheDocument();
    expect(screen.getByAltText("Hue and saturation power measurements")).toHaveAttribute(
      "src",
      "https://example.test/hs.svg",
    );
  });

  it("falls back to the raw label for an unmapped mode", () => {
    render(<Plot link={{ label: "rgb_ww", url: "https://example.test/rgb.svg" }} />);

    expect(screen.getByText("Rgb Ww")).toBeInTheDocument();
  });
});
