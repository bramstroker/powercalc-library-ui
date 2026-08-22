import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  Author as AuthorDetails,
  Manufacturer,
  PowerProfile,
} from "../types/PowerProfile";

import { Author } from "./Author";

const alice: AuthorDetails = { name: "Alice Example", githubUsername: "alice" };
const signify: Manufacturer = {
  dirName: "signify",
  fullName: "Signify",
  aliases: [],
};
const ikea: Manufacturer = { dirName: "ikea", fullName: "IKEA", aliases: [] };

const profile = ({
  manufacturer,
  modelId,
  name,
  deviceType,
  createdAt,
  installations,
  devices,
  author = alice,
}: {
  manufacturer: Manufacturer;
  modelId: string;
  name: string;
  deviceType: string;
  createdAt: string;
  installations: number;
  devices: number;
  author?: AuthorDetails;
}) =>
  ({
    manufacturer,
    modelId,
    name,
    deviceType,
    createdAt: new Date(createdAt),
    authors: [author],
    calculationStrategy: deviceType === "light" ? "lut" : "fixed",
    standbyPower: 0.4,
    maxPower: deviceType === "light" ? 9 : null,
    usageStats: {
      installationCount: installations,
      deviceCount: devices,
      percentage: 0,
    },
  }) as PowerProfile;

const aliceProfiles = [
  profile({
    manufacturer: signify,
    modelId: "P1",
    name: "Popular light",
    deviceType: "light",
    createdAt: "2022-01-10",
    installations: 50,
    devices: 25,
  }),
  profile({
    manufacturer: ikea,
    modelId: "P2",
    name: "Smart plug",
    deviceType: "smart_switch",
    createdAt: "2023-02-10",
    installations: 5,
    devices: 8,
  }),
  profile({
    manufacturer: signify,
    modelId: "P3",
    name: "Newest light",
    deviceType: "light",
    createdAt: "2024-03-10",
    installations: 20,
    devices: 40,
  }),
];

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}));

const renderPage = (path = "/contributors/alice") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/contributors/:authorName"
          element={
            <Author
              authorDetails={path.endsWith("/unknown") ? undefined : alice}
              authorProfiles={path.endsWith("/unknown") ? [] : aliceProfiles}
              authorRank={path.endsWith("/unknown") ? null : { rank: 1, total: 2 }}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );

const profileModels = () =>
  within(screen.getByTestId("author-profile-list"))
    .getAllByRole("link")
    .map((link) => link.textContent);

describe("Author", () => {
  afterEach(cleanup);

  it("renders contributor identity, impact, breakdowns and human-readable labels", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Alice Example", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("@alice · Powercalc Library Contributor"),
    ).toBeInTheDocument();
    expect(screen.getByText("Contributing since 2022")).toBeInTheDocument();
    expect(screen.getByText("73 known devices")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("known profile installations")).toBeInTheDocument();
    expect(screen.getAllByText("Smart Switch").length).toBeGreaterThan(0);
    expect(
      screen.getByText("3 profiles across 2 manufacturers"),
    ).toBeInTheDocument();
    expect(screen.getByText("#1 of 2 contributors")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open in library" }),
    ).toHaveAttribute("href", "/?author=alice");
  });

  it("sorts profile cards by popularity and newest date", () => {
    renderPage();

    expect(profileModels()).toEqual([
      expect.stringContaining("P1"),
      expect.stringContaining("P3"),
      expect.stringContaining("P2"),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Newest" }));

    expect(profileModels()).toEqual([
      expect.stringContaining("P3"),
      expect.stringContaining("P2"),
      expect.stringContaining("P1"),
    ]);
  });

  it("shows a proper not-found state for an unknown contributor", () => {
    renderPage("/contributors/unknown");

    expect(
      screen.getByRole("heading", { name: "Author not found" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("author-profile-list")).not.toBeInTheDocument();
  });
});
