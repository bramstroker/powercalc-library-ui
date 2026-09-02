import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { MeasurementQuality } from "./MeasurementQuality";

describe("MeasurementQuality", () => {
  it("explains how to assess profiles without presenting smoothness as accuracy", () => {
    render(
      <MemoryRouter>
        <MeasurementQuality />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Measurement quality" }),
    ).toBeInTheDocument();
    for (const heading of [
      "Methodology",
      "LUT quality bands",
      "Supported meters",
      "Voltage caveats",
      "Estimated values",
      "Before using a profile",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
    }

    expect(screen.getByText("Excellent: 95–100")).toBeInTheDocument();
    expect(screen.getByText("Good: 85–<95")).toBeInTheDocument();
    expect(screen.getByText("Fair: 70–<85")).toBeInTheDocument();
    expect(screen.getByText("Poor: 0–<70")).toBeInTheDocument();
    expect(screen.getByText(/The score describes/)).toHaveTextContent(
      "It does not validate meter accuracy",
    );
    expect(
      screen.getByText(/Software support is not an accuracy certification/),
    ).toBeInTheDocument();
    expect(screen.getByText(/estimated, not measured/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Improve the library" })).toHaveAttribute(
      "href",
      "/contribute",
    );
  });
});
