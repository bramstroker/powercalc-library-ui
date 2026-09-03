import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalculationStrategy } from "../../../types/CalculationStrategy";
import type {
  Author as AuthorDetails,
  Manufacturer,
  PowerProfile,
} from "../../../types/PowerProfile";

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
    calculationStrategy:
      deviceType === "light" ? CalculationStrategy.LUT : CalculationStrategy.FIXED,
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

vi.mock("../../../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}));

let currentSearch = "";

const LocationProbe = () => {
  currentSearch = useLocation().search;
  return null;
};

const renderPage = (path = "/contributors/alice", profiles = aliceProfiles) => {
  currentSearch = "";
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/contributors/:authorName"
          element={
            <>
              <Author
                authorDetails={path.endsWith("/unknown") ? undefined : alice}
                authorProfiles={path.endsWith("/unknown") ? [] : profiles}
                authorRank={path.endsWith("/unknown") ? null : { rank: 1, total: 2 }}
              />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
};

const profileModels = () =>
  within(screen.getByTestId("author-profile-list"))
    .getAllByRole("link")
    .map((link) => link.textContent);

describe("Author", () => {
  afterEach(cleanup);

  it("renders contributor identity, impact, breakdowns and human-readable labels", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Alice Example", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "73 known devices", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("@alice · Powercalc Library Contributor")).toBeInTheDocument();
    expect(screen.getByText("Contributing since 2022")).toBeInTheDocument();
    expect(screen.getByText("73 known devices")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("known profile installations")).toBeInTheDocument();
    expect(screen.getAllByText("Smart Switch").length).toBeGreaterThan(0);
    expect(screen.getByText("3 profiles across 2 manufacturers")).toBeInTheDocument();
    expect(screen.getByText("#1 of 2 contributors")).toBeInTheDocument();
    expect(screen.getByLabelText("3 profiles")).toBeInTheDocument();
    expect(screen.getByLabelText("2 manufacturers")).toBeInTheDocument();
    expect(screen.getByLabelText("2 device types")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open in library" })).toHaveAttribute(
      "href",
      "/?author=alice",
    );

    expect(screen.getByRole("progressbar", { name: "Light contribution share" })).toHaveAttribute(
      "aria-valuetext",
      "2 of 3 contributed profiles",
    );
    expect(
      screen.getByRole("progressbar", {
        name: "Signify contribution share",
      }),
    ).toHaveAttribute("aria-valuetext", "2 of 3 contributed profiles");
    expect(screen.queryByRole("heading", { name: "75" })).not.toBeInTheDocument();
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

  it("keeps the profile sort in the URL", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Newest" }));
    expect(currentSearch).toContain("sort=newest");

    fireEvent.click(screen.getByRole("button", { name: "Popular" }));
    expect(currentSearch).not.toContain("sort=");
  });

  it("restores the profile sort from the URL", () => {
    renderPage("/contributors/alice?sort=name");

    expect(profileModels()).toEqual([
      expect.stringContaining("P3"),
      expect.stringContaining("P1"),
      expect.stringContaining("P2"),
    ]);
  });

  it("drops the distribution panels, sort and rank for a single contribution", () => {
    renderPage("/contributors/alice", [aliceProfiles[0]]);

    // "1 profiles across 1 manufacturers" was the old wording.
    expect(screen.getByText("1 profile across 1 manufacturer")).toBeInTheDocument();

    // One profile has no distribution: both breakdowns would be a single bar at 100%.
    expect(screen.queryByRole("heading", { name: "Device mix" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Top manufacturers" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Sort contributed profiles")).not.toBeInTheDocument();
    // Rank is a mass tie among everyone holding a single profile.
    expect(screen.queryByText(/of 2 contributors/)).not.toBeInTheDocument();
  });

  it("shows a proper not-found state for an unknown contributor", () => {
    renderPage("/contributors/unknown");

    expect(screen.getByRole("heading", { name: "Author not found" })).toBeInTheDocument();
    expect(screen.queryByTestId("author-profile-list")).not.toBeInTheDocument();
  });
});
