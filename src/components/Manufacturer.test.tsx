import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

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

const profile = (manufacturer: ManufacturerType, modelId: string, deviceType: string) =>
  ({
    manufacturer,
    modelId,
    deviceType,
    name: `${modelId} display name`,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    calculationStrategy: "fixed",
    standbyPower: 0.5,
    maxPower: null,
    usageStats: { installationCount: 7, deviceCount: 7, percentage: 1 },
  }) as PowerProfile;

const profiles = [
  profile(linkind, "ZS1100400", "smart_switch"),
  profile(linkind, "BR30", "light"),
  profile(linkind, "A19", "light"),
  profile(signify, "LCA001", "light"),
];

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

  it("shows the manufacturer with its aliases and profile count", () => {
    renderPage("linkind");

    expect(screen.getByRole("heading", { level: 1, name: "Linkind" })).toBeInTheDocument();
    expect(screen.getByText("Also known as: lk, Leedarson")).toBeInTheDocument();
    expect(screen.getByLabelText("3 profiles")).toBeInTheDocument();
    expect(screen.getByLabelText("21 known installs")).toBeInTheDocument();
    expect(screen.getByLabelText("2 device types")).toBeInTheDocument();
  });

  it("omits the alias line for a manufacturer without aliases", () => {
    renderPage("signify");

    expect(screen.queryByText(/Also known as/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("1 profile")).toBeInTheDocument();
    expect(screen.getByText("1 profile")).toBeInTheDocument();
  });

  it("groups profiles by device type, largest group first", () => {
    renderPage("linkind");

    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "light",
      "smart_switch",
    ]);
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
    expect(screen.getAllByText("7 installs")).toHaveLength(3);
    expect(screen.getByTestId("manufacturer-profile-list-light")).toBeInTheDocument();
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
