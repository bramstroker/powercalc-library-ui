import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LibraryData } from "../queries/library.query";
import type { Author, ContributorSummary, Manufacturer, PowerProfile } from "../types/PowerProfile";
import { slugifyPathSegment } from "../utils/urlSlugs.mjs";

import { Contributors } from "./Contributors";

const NOW = new Date("2026-08-22T12:00:00Z");
const manufacturer: Manufacturer = { dirName: "acme", fullName: "Acme", aliases: [] };

const author = (name: string, githubUsername: string): Author => ({ name, githubUsername });

const profile = (
  contributor: Author,
  modelId: string,
  createdAt: string,
  extraAuthors: Author[] = [],
) =>
  ({
    manufacturer,
    modelId,
    name: `Device ${modelId}`,
    deviceType: "light",
    createdAt: new Date(createdAt),
    authors: [contributor, ...extraAuthors],
    usageStats: { installationCount: 0, deviceCount: 0, percentage: 0 },
  }) as PowerProfile;

const summary = (contributor: Author, profiles: PowerProfile[]): ContributorSummary => {
  const sorted = [...profiles].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return {
    author: contributor,
    profileCount: profiles.length,
    manufacturerCount: new Set(profiles.map((item) => item.manufacturer.dirName)).size,
    deviceTypes: [...new Set(profiles.map((item) => item.deviceType))],
    firstContributionAt: sorted[0]?.createdAt ?? null,
    latestContributionAt: sorted.at(-1)?.createdAt ?? null,
    latestProfile: sorted.at(-1) ?? null,
  };
};

let libraryData: LibraryData;

vi.mock("../context/LibraryContext", () => ({
  useLibrary: () => libraryData,
}));

const setLibrary = (entries: Array<{ contributor: Author; profiles: PowerProfile[] }>) => {
  const profilesByAuthorSlug = new Map<string, PowerProfile[]>();
  for (const entry of entries) {
    profilesByAuthorSlug.set(slugifyPathSegment(entry.contributor.githubUsername), entry.profiles);
  }

  const powerProfiles = [...new Set(entries.flatMap((entry) => entry.profiles))];
  libraryData = {
    powerProfiles,
    total: powerProfiles.length,
    contributorSummaries: entries.map((entry) => summary(entry.contributor, entry.profiles)),
    profilesByAuthorSlug,
  } as LibraryData;
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <Contributors now={NOW} />
    </MemoryRouter>,
  );

const directoryNames = () =>
  within(screen.getByTestId("contributor-directory"))
    .getAllByRole("link")
    .map((link) => link.textContent);

describe("Contributors", () => {
  beforeEach(() => {
    const ada = author("Ada Lovelace", "ada");
    const bob = author("Bob Builder", "bob");
    const charlie = author("Charlie", "charlie-handle");
    const shared = profile(ada, "NEW-1", "2026-08-20T10:00:00Z", [bob]);

    setLibrary([
      {
        contributor: ada,
        profiles: [shared, profile(ada, "NEW-2", "2026-07-01T10:00:00Z")],
      },
      {
        contributor: bob,
        profiles: [shared, profile(bob, "NEW-3", "2026-08-21T10:00:00Z")],
      },
      {
        contributor: charlie,
        profiles: [profile(charlie, "OLD-1", "2025-01-01T10:00:00Z")],
      },
    ]);
  });

  afterEach(cleanup);

  it("leads with deduplicated recent activity and community actions", () => {
    renderPage();

    expect(screen.getByLabelText("3 profiles added")).toBeInTheDocument();
    expect(screen.getByLabelText("2 active contributors")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contribute a profile" })).toHaveAttribute(
      "href",
      "https://docs.powercalc.nl/contributing/",
    );
    expect(screen.getByRole("link", { name: "View top contributors" })).toHaveAttribute(
      "href",
      "/statistics/top-contributors",
    );
    expect(within(screen.getByTestId("recent-contributor-list")).getAllByRole("link")).toHaveLength(
      2,
    );
  });

  it("orders the directory by latest contribution by default", () => {
    renderPage();

    expect(directoryNames()).toEqual([
      expect.stringContaining("Bob Builder"),
      expect.stringContaining("Ada Lovelace"),
      expect.stringContaining("Charlie"),
    ]);
  });

  it("searches display names and GitHub handles", () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Search contributors"), {
      target: { value: "charlie-handle" },
    });

    expect(screen.getByText("1 contributor")).toBeInTheDocument();
    expect(directoryNames()).toEqual([expect.stringContaining("Charlie")]);
  });

  it("sorts by profile count", () => {
    renderPage();

    fireEvent.mouseDown(screen.getByLabelText("Sort by"));
    fireEvent.click(screen.getByRole("option", { name: "Most profiles" }));

    expect(directoryNames()[0]).toEqual(expect.stringContaining("Ada Lovelace"));
  });

  it("shows 24 directory cards at a time", () => {
    const entries = Array.from({ length: 25 }, (_, index) => {
      const contributor = author(`Contributor ${String(index).padStart(2, "0")}`, `user-${index}`);
      return {
        contributor,
        profiles: [profile(contributor, `MODEL-${index}`, `2026-08-${String(index + 1).padStart(2, "0")}T10:00:00Z`)],
      };
    });
    setLibrary(entries);
    renderPage();

    expect(within(screen.getByTestId("contributor-directory")).getAllByRole("link")).toHaveLength(
      24,
    );

    fireEvent.click(screen.getByRole("button", { name: "Load more contributors" }));

    expect(within(screen.getByTestId("contributor-directory")).getAllByRole("link")).toHaveLength(
      25,
    );
  });

  it("shows an empty state when no contributor matches", () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Search contributors"), {
      target: { value: "nobody" },
    });

    expect(screen.getByText("No contributors found")).toBeInTheDocument();
    expect(screen.queryByTestId("contributor-directory")).not.toBeInTheDocument();
  });
});
