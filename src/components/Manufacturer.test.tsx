import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { LibraryData } from "../queries/library.query";
import type { Manufacturer as ManufacturerType, PowerProfile } from "../types/PowerProfile";

import { Manufacturer } from "./Manufacturer";

const linkind: ManufacturerType = {
  dirName: "linkind",
  fullName: "Linkind",
  aliases: ["lk", "Leedarson"],
};
const signify: ManufacturerType = { dirName: "signify", fullName: "Signify", aliases: [] };

const profile = (manufacturer: ManufacturerType, modelId: string, deviceType: string) =>
  ({
    manufacturer,
    modelId,
    deviceType,
    name: `${modelId} display name`,
    usageStats: { installationCount: 7, deviceCount: 7, percentage: 1 },
  }) as PowerProfile;

const libraryData = {
  powerProfiles: [
    profile(linkind, "ZS1100400", "smart_switch"),
    profile(linkind, "BR30", "light"),
    profile(linkind, "A19", "light"),
    profile(signify, "LCA001", "light"),
  ],
  manufacturers: { linkind, signify },
} as unknown as LibraryData;

vi.mock("../context/LibraryContext", () => ({
  useLibrary: () => libraryData,
}));

const renderPage = (dirName: string) =>
  render(
    <MemoryRouter initialEntries={[`/manufacturer/${encodeURIComponent(dirName)}`]}>
      <Routes>
        <Route path="/manufacturer/:manufacturerName" element={<Manufacturer />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Manufacturer", () => {
  afterEach(cleanup);

  it("shows the manufacturer with its aliases and profile count", () => {
    renderPage("linkind");

    expect(screen.getByRole("heading", { level: 1, name: "Linkind" })).toBeInTheDocument();
    expect(screen.getByText("Also known as: lk, Leedarson")).toBeInTheDocument();
    expect(screen.getByText("3 profiles")).toBeInTheDocument();
  });

  it("omits the alias line for a manufacturer without aliases", () => {
    renderPage("signify");

    expect(screen.queryByText(/Also known as/)).not.toBeInTheDocument();
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
      "/profiles/linkind/BR30",
    );
    expect(screen.queryByText("LCA001")).not.toBeInTheDocument();
  });

  it("links to the filtered library grid by full name", () => {
    renderPage("linkind");

    expect(
      screen.getByRole("link", { name: "View all profiles by this manufacturer" }),
    ).toHaveAttribute("href", "/?manufacturer=Linkind");
  });

  it("shows a not-found message for an unknown manufacturer", () => {
    renderPage("nope");

    expect(screen.getByText("Manufacturer not found")).toBeInTheDocument();
  });
});
