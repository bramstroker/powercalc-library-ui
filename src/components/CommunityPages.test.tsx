import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { About } from "./About";
import { Contribute } from "./Contribute";

describe("community information pages", () => {
  it("makes measuring the primary contribution path and requests a fallback", () => {
    render(
      <MemoryRouter>
        <Contribute />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Contribute or request a device" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start measuring" })).toHaveAttribute(
      "href",
      "https://docs.powercalc.nl/contributing/measure/",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Cannot measure it yourself?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/exact same physical model/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a light profile" })).toHaveAttribute(
      "href",
      expect.stringContaining("request-light-models"),
    );
  });

  it("explains provenance, freshness, privacy, access and licensing", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "About the profile data" }),
    ).toBeInTheDocument();
    for (const heading of [
      "Who maintains it",
      "Data provenance",
      "Refresh frequency",
      "Analytics and privacy",
      "API and source",
      "License",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
    }

    expect(screen.getByText(/every hour/)).toBeInTheDocument();
    expect(screen.getByText(/disabled by default/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download the full library JSON" })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/library\/full$/),
    );
    expect(screen.getByRole("link", { name: "Read the MIT License" })).toHaveAttribute(
      "href",
      "https://opensource.org/license/mit",
    );
  });
});
