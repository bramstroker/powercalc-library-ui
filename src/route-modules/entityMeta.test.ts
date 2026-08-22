import type { MetaDescriptor } from "react-router";
import { describe, expect, it } from "vitest";

import { SITE_URL } from "../config/site";
import type { Author, Manufacturer, PowerProfile } from "../types/PowerProfile";

import { meta as authorMeta } from "./author";
import { meta as manufacturerMeta } from "./manufacturer";

const alice: Author = { name: "Alice Example", githubUsername: "alice" };

const linkind: Manufacturer = {
  dirName: "Linkind",
  fullName: "Linkind",
  aliases: ["lk"],
};

const profile = (modelId: string, deviceType = "light"): PowerProfile =>
  ({
    manufacturer: linkind,
    modelId,
    name: `Linkind ${modelId}`,
    deviceType,
    authors: [alice],
    usageStats: { installationCount: 7, deviceCount: 7, percentage: 1 },
  }) as PowerProfile;

/** `meta` returns a flat descriptor list; pull out the pieces each assertion cares about. */
const read = (descriptors: MetaDescriptor[]) => {
  const find = <T extends MetaDescriptor>(predicate: (entry: MetaDescriptor) => boolean) =>
    descriptors.find(predicate) as T | undefined;

  return {
    title: find<{ title: string }>((entry) => "title" in entry)?.title,
    canonical: find<{ href: string }>((entry) => "rel" in entry && entry.rel === "canonical")?.href,
    robots: find<{ content: string }>((entry) => "name" in entry && entry.name === "robots")
      ?.content,
    graph: (
      find<{ "script:ld+json": { "@graph": Record<string, never>[] } }>(
        (entry) => "script:ld+json" in entry,
      )?.["script:ld+json"] as { "@graph": Record<string, string>[] } | undefined
    )?.["@graph"],
  };
};

// `meta` receives the full router argument object; these routes only read three of its fields.
const args = (loaderData: unknown, pathname = "/", error?: unknown) =>
  ({ loaderData, location: { pathname }, error }) as never;

describe("manufacturer meta", () => {
  const profiles = [profile("A19"), profile("BR30"), profile("ZS1100400", "smart_switch")];

  it("titles the page and points its canonical URL at the slugified path", () => {
    const { title, canonical, robots } = read(
      manufacturerMeta(args({ manufacturer: linkind, profiles })) as MetaDescriptor[],
    );

    expect(title).toBe("Linkind · Powercalc profile library");
    // The dir name is `Linkind`; the canonical URL must be the lowercase slug the loader redirects to.
    expect(canonical).toBe(`${SITE_URL}/manufacturer/linkind`);
    expect(robots).toBeUndefined();
  });

  it("emits breadcrumb and collection structured data covering every profile", () => {
    const { graph } = read(
      manufacturerMeta(args({ manufacturer: linkind, profiles })) as MetaDescriptor[],
    );

    expect(graph?.map((item) => item["@type"])).toEqual(["BreadcrumbList", "CollectionPage"]);
    expect(graph?.[1]).toMatchObject({
      mainEntity: { numberOfItems: 3 },
      about: { name: "Linkind", alternateName: ["lk"] },
    });
  });

  it("marks an unresolvable manufacturer as noindex", () => {
    const { title, robots } = read(
      manufacturerMeta(args(undefined, "/manufacturer/nope", new Error("boom"))) as MetaDescriptor[],
    );

    expect(title).toBe("Manufacturer not found · Powercalc profile library");
    expect(robots).toBe("noindex, follow");
  });
});

describe("author meta", () => {
  const loaderData = {
    authorDetails: alice,
    authorProfiles: [profile("A19"), profile("BR30"), profile("ZS1100400", "smart_switch")],
    authorRank: { rank: 1, total: 2 },
  };

  it("describes the contributor and their profiles", () => {
    const { title, canonical, graph } = read(authorMeta(args(loaderData)) as MetaDescriptor[]);

    expect(title).toBe("Alice Example · Powercalc profile library");
    expect(canonical).toBe(`${SITE_URL}/author/alice`);
    expect(graph?.map((item) => item["@type"])).toEqual(["BreadcrumbList", "ProfilePage"]);
    expect(graph?.[1]).toMatchObject({
      mainEntity: {
        "@type": "Person",
        name: "Alice Example",
        sameAs: "https://github.com/alice",
        knowsAbout: ["Linkind", "Light", "Smart Switch"],
      },
      hasPart: { numberOfItems: 3 },
    });
  });

  it("marks an unknown contributor as noindex", () => {
    const { title, robots } = read(
      authorMeta(args(undefined, "/author/nope", new Error("boom"))) as MetaDescriptor[],
    );

    expect(title).toBe("Author not found · Powercalc profile library");
    expect(robots).toBe("noindex, follow");
  });
});
