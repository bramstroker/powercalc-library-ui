import type { MetaDescriptor } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { SITE_URL } from "../config/site";
import { libraryQuery, type LibraryData } from "../queries/library.query";
import { queryClient } from "../queryClient";
import type { Manufacturer, PowerProfile } from "../types/PowerProfile";

import { meta as categoryIndexMeta } from "./profile-categories";
import { loader, meta as categoryMeta, profileCategoryStructuredData } from "./profile-category";

const signify: Manufacturer = { dirName: "signify", fullName: "Signify", aliases: [] };
const profile = {
  manufacturer: signify,
  modelId: "LCA001",
  name: "Hue White and Color Ambiance A60",
  deviceType: "light",
  colorModes: ["brightness", "color_temp", "hs"],
  authors: [],
  usageStats: { installationCount: 1, deviceCount: 1, percentage: 1 },
} as unknown as PowerProfile;

const read = (descriptors: MetaDescriptor[]) => ({
  title: (descriptors.find((entry) => "title" in entry) as { title?: string } | undefined)?.title,
  canonical: (
    descriptors.find((entry) => "rel" in entry && entry.rel === "canonical") as
      { href?: string } | undefined
  )?.href,
  robots: (
    descriptors.find((entry) => "name" in entry && entry.name === "robots") as
      { content?: string } | undefined
  )?.content,
});

describe("profile category metadata", () => {
  it("gives the category index a clean canonical", () => {
    const deviceTypes = read(
      categoryIndexMeta({ location: { pathname: "/device-types" } } as never) as MetaDescriptor[],
    );

    expect(deviceTypes).toMatchObject({
      title: "Device types · Powercalc profile library",
      canonical: `${SITE_URL}/device-types`,
    });
  });

  it("describes a category as an indexable collection of profiles", () => {
    const data = { value: "light", profiles: [profile] };
    const metadata = read(
      categoryMeta({
        loaderData: data,
        location: { pathname: "/device-types/light" },
      } as never) as MetaDescriptor[],
    );
    const graph = profileCategoryStructuredData(data);

    expect(metadata).toMatchObject({
      title: "Light power profiles · Powercalc profile library",
      canonical: `${SITE_URL}/device-types/light`,
      robots: undefined,
    });
    expect(graph.map((entry) => entry["@type"])).toEqual(["BreadcrumbList", "CollectionPage"]);
    expect(graph[1]).toMatchObject({ mainEntity: { numberOfItems: 1 } });
  });

  it("marks missing categories as noindex", () => {
    const metadata = read(
      categoryMeta({
        location: { pathname: "/device-types/nope" },
        error: new Error("missing"),
      } as never) as MetaDescriptor[],
    );

    expect(metadata.robots).toBe("noindex, follow");
  });
});

describe("profile category loader", () => {
  afterEach(() => queryClient.clear());

  it("does not redirect the generated data request for a canonical category", async () => {
    queryClient.setQueryData(libraryQuery().queryKey, {
      powerProfiles: [profile],
    } as LibraryData);

    await expect(
      loader({
        params: { categoryName: "light" },
        request: new Request("http://localhost/device-types/light.data"),
      } as never),
    ).resolves.toMatchObject({ value: "light", profiles: [profile] });
  });
});
