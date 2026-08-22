import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { createEmptyFilters } from "../types/LibraryFilters";

import type { UseLibraryFilters } from "./useLibraryFilters";
import { parseFilters, serializeFilters, useLibraryFilters } from "./useLibraryFilters";

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

  it("parses the created-after bound", () => {
    expect(parse("createdAfter=2025-01-01").createdAfter).toBe("2025-01-01");
  });

  it("parses LUT quality bands, whose labels can carry a space", () => {
    expect(parse("qualityBand=Poor,Not+applicable").facets.qualityBand).toEqual([
      "Poor",
      "Not applicable",
    ]);
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
    filters.facets.qualityBand = ["Not applicable"];
    filters.ranges.maxPower = [0, 50];
    filters.createdAfter = "2025-01-01";

    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
});

describe("useLibraryFilters", () => {
  afterEach(cleanup);

  /**
   * Regression test for a race that only showed up on slower machines: two toggles dispatched
   * before the first navigation commits both read the pre-click query string, so the second one
   * dropped the first. Calling them inside a single `act` guarantees no re-render in between,
   * which is the situation two quick clicks produce.
   */
  const Harness = ({ onReady }: { onReady: (api: UseLibraryFilters) => void }) => {
    const api = useLibraryFilters();
    onReady(api);
    return <span data-testid="query">{serializeFilters(api.filters).toString()}</span>;
  };

  const renderHarness = (initialEntry = "/") => {
    let api: UseLibraryFilters | undefined;
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Harness
          onReady={(next) => {
            api = next;
          }}
        />
      </MemoryRouter>,
    );
    return {
      get api() {
        if (!api) throw new Error("harness not ready");
        return api;
      },
      query: () => screen.getByTestId("query").textContent,
    };
  };

  it("compounds toggles dispatched before the navigation commits", () => {
    const harness = renderHarness();

    act(() => {
      harness.api.toggleFacetValue("deviceType", "light");
      harness.api.toggleFacetValue("deviceType", "smart_switch");
    });

    expect(harness.query()).toBe("deviceType=light%2Csmart_switch");
  });

  it("compounds updates across different facets in the same tick", () => {
    const harness = renderHarness();

    act(() => {
      harness.api.toggleFacetValue("deviceType", "light");
      harness.api.setSearch("hue");
      harness.api.setFacet("manufacturer", ["Signify"]);
    });

    expect(harness.query()).toBe("deviceType=light&manufacturer=Signify&q=hue");
  });

  it("untoggles a value that was only just added", () => {
    const harness = renderHarness();

    act(() => {
      harness.api.toggleFacetValue("deviceType", "light");
      harness.api.toggleFacetValue("deviceType", "light");
    });

    expect(harness.query()).toBe("");
  });

  it("builds on filters that arrived from the URL", () => {
    const harness = renderHarness("/?manufacturer=IKEA");

    act(() => {
      harness.api.toggleFacetValue("deviceType", "light");
    });

    expect(harness.query()).toBe("deviceType=light&manufacturer=IKEA");
  });

  it("drops everything on clearAll", () => {
    const harness = renderHarness("/?manufacturer=IKEA&deviceType=light");

    act(() => {
      harness.api.clearAll();
    });

    expect(harness.query()).toBe("");
  });
});
