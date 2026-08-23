import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { LibraryData } from "../queries/library.query";
import type { Manufacturer, PowerProfile } from "../types/PowerProfile";

import { Manufacturers } from "./Manufacturers";

const signify: Manufacturer = { dirName: "signify", fullName: "Signify", aliases: [] };
const ikea: Manufacturer = { dirName: "ikea", fullName: "IKEA", aliases: [] };
const linkind: Manufacturer = { dirName: "linkind", fullName: "Linkind", aliases: ["Leedarson"] };

const profile = (manufacturer: Manufacturer, modelId: string, deviceType: string) =>
  ({ manufacturer, modelId, deviceType }) as PowerProfile;

const libraryData = {
  powerProfiles: [
    profile(signify, "LCA001", "light"),
    profile(signify, "LCT010", "light"),
    profile(signify, "SML001", "smart_switch"),
    profile(ikea, "LED1836G9", "light"),
    profile(linkind, "ZS1100400", "light"),
  ],
  manufacturers: { signify, ikea, linkind },
} as unknown as LibraryData;

vi.mock("../context/LibraryContext", () => ({
  useLibrary: () => libraryData,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <Manufacturers />
    </MemoryRouter>,
  );

const search = (text: string) => {
  fireEvent.change(screen.getByPlaceholderText("Search manufacturers"), {
    target: { value: text },
  });
};

const cardNames = () =>
  within(screen.getByTestId("manufacturer-list"))
    .getAllByRole("link")
    .map((link) => link.textContent);

describe("Manufacturers", () => {
  afterEach(cleanup);

  it("lists every manufacturer with its profile count", () => {
    renderPage();

    expect(screen.getByText("3 manufacturers, 5 profiles")).toBeInTheDocument();
    expect(screen.getByText("3 profiles")).toBeInTheDocument();
    expect(screen.getAllByText("1 profile")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 1, name: "Manufacturers" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });

  it("orders by profile count first, breaking ties by name", () => {
    renderPage();

    expect(cardNames()).toEqual([
      expect.stringContaining("Signify"),
      expect.stringContaining("IKEA"),
      expect.stringContaining("Linkind"),
    ]);
  });

  it("switches to alphabetical order", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Name" }));

    expect(cardNames()).toEqual([
      expect.stringContaining("IKEA"),
      expect.stringContaining("Linkind"),
      expect.stringContaining("Signify"),
    ]);
  });

  it("filters by name and by alias", () => {
    renderPage();

    search("leedarson");

    expect(cardNames()).toEqual([expect.stringContaining("Linkind")]);
  });

  it("reports when nothing matches", () => {
    renderPage();

    search("nope");

    expect(screen.getByText('No manufacturers match "nope"')).toBeInTheDocument();
    expect(screen.queryByTestId("manufacturer-list")).not.toBeInTheDocument();
  });

  it("links each card to the manufacturer page", () => {
    renderPage();

    expect(screen.getByRole("link", { name: /Signify/ })).toHaveAttribute(
      "href",
      "/manufacturers/signify",
    );
  });
});
