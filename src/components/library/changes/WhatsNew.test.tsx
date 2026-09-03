import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import type { LibraryChangesPage } from "../../../api/library.api";
import { libraryQuery, type LibraryData } from "../../../queries/library.query";
import { queryClient } from "../../../queryClient";
import type { PowerProfile } from "../../../types/PowerProfile";

import { WhatsNew } from "./WhatsNew";

const page: LibraryChangesPage = {
  items: [
    {
      id: "github-pr:42",
      occurred_at: "2026-09-02T10:00:00Z",
      summary: "Update two profiles",
      changes: [
        {
          type: "profile_added",
          profile: {
            manufacturer: { dir_name: "signify", full_name: "Signify" },
            id: "LCA001",
            name: "Hue White and Color Ambiance A60",
            device_type: "light",
          },
          changed_fields: ["model.json"],
        },
        {
          type: "measurement_updated",
          profile: {
            manufacturer: { dir_name: "ikea", full_name: "IKEA" },
            id: "LED1836G9",
          },
          changed_fields: ["lut.csv"],
        },
        {
          type: "profile_corrected",
          profile: {
            manufacturer: { dir_name: "sonoff", full_name: "Sonoff" },
            id: "S31",
            name: "Smart Plug",
            device_type: "smart_switch",
          },
          changed_fields: ["model.json"],
        },
        {
          type: "profile_added",
          profile: {
            manufacturer: { dir_name: "dreame", full_name: "dreame" },
            id: "x50-ultra",
          },
          changed_fields: ["model.json"],
        },
      ],
      authors: [{ name: "Contributor", github: "contributor" }],
      source: {
        repository: "bramstroker/homeassistant-powercalc",
        branch: "master",
        pull_request_number: 42,
        pull_request_url: "https://github.com/bramstroker/homeassistant-powercalc/pull/42",
      },
    },
  ],
  next_cursor: "older-page",
};

describe("WhatsNew", () => {
  afterEach(() => queryClient.clear());

  it("shows only supported profile change types", () => {
    const currentProfile = {
      manufacturer: { dirName: "dreame", fullName: "Dreame", aliases: [] },
      modelId: "RLX85CE-5",
      legacyIds: ["x50-ultra"],
      name: "X50 Ultra Complete",
      deviceType: "vacuum_robot",
    } as unknown as PowerProfile;
    queryClient.setQueryData(libraryQuery().queryKey, {
      powerProfilesBySlugKey: new Map([
        ["dreame/rlx85ce-5", currentProfile],
        ["dreame/x50-ultra", currentProfile],
      ]),
    } as LibraryData);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WhatsNew initialPage={page} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByText("New profile")).toHaveLength(2);
    expect(screen.getByText("Measurements updated")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Signify LCA001" })).toHaveAttribute(
      "href",
      "/profiles/signify/lca001",
    );
    expect(screen.queryByText("Sonoff S31")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Pull request #42/ })).toHaveAttribute(
      "href",
      "https://github.com/bramstroker/homeassistant-powercalc/pull/42",
    );
    expect(screen.getByRole("link", { name: "Contributor" })).toHaveAttribute(
      "href",
      "/contributors/contributor",
    );
    expect(screen.getByRole("link", { name: "Dreame RLX85CE-5" })).toHaveAttribute(
      "href",
      "/profiles/dreame/rlx85ce-5",
    );
    expect(screen.getByText("X50 Ultra Complete · Vacuum Robot")).toBeInTheDocument();
    expect(screen.queryByText(/x50-ultra/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load older changes" })).toBeVisible();
  });
});
