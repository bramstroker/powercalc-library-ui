import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { CalculationStrategy } from "../types/CalculationStrategy";
import type { Manufacturer as ManufacturerType, PowerProfile } from "../types/PowerProfile";

import { Manufacturer } from "./Manufacturer";

const linkind: ManufacturerType = {
  dirName: "linkind",
  fullName: "Linkind",
  aliases: ["lk", "Leedarson"],
};
const signify: ManufacturerType = {
  dirName: "signify",
  fullName: "Signify",
  aliases: [],
};

const profile = (
  manufacturer: ManufacturerType,
  modelId: string,
  deviceType: string,
  { installationCount = 7, createdAt = "2024-01-01T00:00:00Z" } = {},
) =>
  ({
    manufacturer,
    modelId,
    deviceType,
    name: `${modelId} display name`,
    aliases: [] as string[],
    createdAt: new Date(createdAt),
    calculationStrategy: CalculationStrategy.FIXED,
    standbyPower: 0.5,
    maxPower: null,
    usageStats: { installationCount, deviceCount: installationCount, percentage: 1 },
  }) as PowerProfile;

const profiles = [
  profile(linkind, "ZS1100400", "smart_switch", { installationCount: 7 }),
  profile(linkind, "BR30", "light", { installationCount: 30, createdAt: "2023-01-01T00:00:00Z" }),
  profile(linkind, "A19", "light", { installationCount: 12, createdAt: "2025-06-01T00:00:00Z" }),
  profile(signify, "LCA001", "light"),
];

const profileNames = () =>
  within(screen.getByTestId("manufacturer-profile-list"))
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);

const renderPage = (dirName: string) =>
  render(
    <MemoryRouter initialEntries={[`/manufacturers/${encodeURIComponent(dirName)}`]}>
      <Routes>
        <Route
          path="/manufacturers/:manufacturerName"
          element={
            <Manufacturer
              manufacturer={
                dirName === "linkind" ? linkind : dirName === "signify" ? signify : undefined
              }
              profiles={profiles.filter((entry) => entry.manufacturer.dirName === dirName)}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("Manufacturer", () => {
  afterEach(cleanup);

  it("keeps discovery aliases in a compact popover", () => {
    renderPage("linkind");

    expect(screen.getByRole("heading", { level: 1, name: "Linkind" })).toBeInTheDocument();
    expect(screen.queryByText("lk")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Discovery aliases (2)" }));
    expect(screen.getByText("lk")).toBeInTheDocument();
    expect(screen.getByText("Leedarson")).toBeInTheDocument();
    expect(
      screen.getByText("Alternate manufacturer names used when matching devices to profiles."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("3 profiles")).toBeInTheDocument();
    expect(screen.getByLabelText("49 known installs")).toBeInTheDocument();
    expect(screen.getByLabelText("2 device types")).toBeInTheDocument();
  });

  it("omits the alias control for a manufacturer without aliases", () => {
    renderPage("signify");

    expect(screen.queryByRole("button", { name: /Discovery aliases/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText("1 profile")).toBeInTheDocument();
    expect(screen.getByText("1 profile across 1 device type")).toBeInTheDocument();
  });

  it("sorts profiles by installations first, and re-sorts on demand", () => {
    renderPage("linkind");

    expect(profileNames()).toEqual(["BR30", "A19", "ZS1100400"]);

    fireEvent.click(screen.getByRole("button", { name: "Newest" }));
    expect(profileNames()).toEqual(["A19", "ZS1100400", "BR30"]);

    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(profileNames()).toEqual(["A19", "BR30", "ZS1100400"]);
  });

  it("filters the profiles by device type, and clears the filter on a second click", () => {
    renderPage("linkind");

    const filter = screen.getByTestId("manufacturer-device-type-filter");
    expect(
      within(filter)
        .getAllByRole("button")
        .map((chip) => chip.textContent),
    ).toEqual(["All (3)", "Light (2)", "Smart Switch (1)"]);

    fireEvent.click(within(filter).getByRole("button", { name: "Light (2)" }));

    expect(profileNames()).toEqual(["BR30", "A19"]);
    expect(screen.getByText("Showing 2 of 3 profiles")).toBeInTheDocument();

    fireEvent.click(within(filter).getByRole("button", { name: "Light (2)" }));

    expect(profileNames()).toHaveLength(3);
  });

  it("omits the device type filter for a manufacturer with a single device type", () => {
    renderPage("signify");

    expect(screen.queryByTestId("manufacturer-device-type-filter")).not.toBeInTheDocument();
  });

  it("lists only that manufacturer's profiles, linking each to its profile page", () => {
    renderPage("linkind");

    expect(screen.getByRole("link", { name: /BR30/ })).toHaveAttribute(
      "href",
      "/profiles/linkind/br30",
    );
    expect(screen.queryByText("LCA001")).not.toBeInTheDocument();
  });

  it("uses the detailed profile cards", () => {
    renderPage("linkind");

    expect(screen.getAllByText("Fixed")).toHaveLength(3);
    expect(screen.getAllByText("0.5 W standby")).toHaveLength(3);
    expect(screen.getByText("30 installs")).toBeInTheDocument();
    expect(screen.getByTestId("manufacturer-profile-list")).toBeInTheDocument();
  });

  it("links to the filtered library grid by full name", () => {
    renderPage("linkind");

    expect(screen.getByRole("link", { name: "Browse profiles" })).toHaveAttribute(
      "href",
      "/?manufacturer=Linkind",
    );
  });

  it("shows a not-found message for an unknown manufacturer", () => {
    renderPage("nope");

    expect(screen.getByText("Manufacturer not found")).toBeInTheDocument();
  });
});
