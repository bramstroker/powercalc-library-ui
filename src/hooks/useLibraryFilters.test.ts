import { describe, expect, it } from "vitest";

import { createEmptyFilters } from "../types/LibraryFilters";

import { parseFilters, serializeFilters } from "./useLibraryFilters";

const parse = (query: string) => parseFilters(new URLSearchParams(query));

describe("parseFilters", () => {
  it("returns empty filters for an empty query string", () => {
    expect(parse("")).toEqual(createEmptyFilters());
  });

  it("keeps single-value deep links working", () => {
    expect(parse("manufacturer=IKEA").facets.manufacturer).toEqual(["IKEA"]);
    expect(parse("deviceType=smart_switch").facets.deviceType).toEqual(["smart_switch"]);
  });

  it("splits comma separated multi-values", () => {
    expect(parse("deviceType=light,smart_switch").facets.deviceType).toEqual([
      "light",
      "smart_switch",
    ]);
  });

  it("trims whitespace and drops empty entries", () => {
    expect(parse("deviceType=light, ,fan,").facets.deviceType).toEqual(["light", "fan"]);
  });

  it("parses the search term", () => {
    expect(parse("q=tradfri").search).toBe("tradfri");
  });

  it("parses ranges and ignores malformed ones", () => {
    expect(parse("standbyPower=0.5-2").ranges.standbyPower).toEqual([0.5, 2]);
    expect(parse("standbyPower=abc").ranges.standbyPower).toBeUndefined();
    expect(parse("standbyPower=5-1").ranges.standbyPower).toBeUndefined();
  });

  it("parses the date bounds", () => {
    const filters = parse("createdAfter=2025-01-01&updatedAfter=2025-02-01");

    expect(filters.createdAfter).toBe("2025-01-01");
    expect(filters.updatedAfter).toBe("2025-02-01");
  });
});

describe("serializeFilters", () => {
  it("omits empty facets", () => {
    expect(serializeFilters(createEmptyFilters()).toString()).toBe("");
  });

  it("writes params in a stable alphabetical order", () => {
    const filters = createEmptyFilters();
    filters.search = "hue";
    filters.facets.manufacturer = ["Signify"];
    filters.facets.deviceType = ["light", "fan"];

    expect(serializeFilters(filters).toString()).toBe(
      "deviceType=light%2Cfan&manufacturer=Signify&q=hue",
    );
  });

  it("round-trips through parse", () => {
    const filters = createEmptyFilters();
    filters.search = "plug";
    filters.facets.deviceType = ["light", "smart_switch"];
    filters.facets.author = ["Bram"];
    filters.ranges.maxPower = [0, 50];
    filters.createdAfter = "2025-01-01";

    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
});
