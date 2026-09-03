import { describe, expect, it } from "vitest";

import {
  DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY,
  parseStoredColumnVisibility,
} from "./useLibraryGridColumnVisibility";

describe("parseStoredColumnVisibility", () => {
  it("uses the defaults when no valid preference is stored", () => {
    expect(parseStoredColumnVisibility(null)).toEqual(DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY);
    expect(parseStoredColumnVisibility("not json")).toEqual(DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY);
    expect(parseStoredColumnVisibility("[]")).toEqual(DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY);
  });

  it("keeps known boolean preferences and drops stale or invalid values", () => {
    expect(
      parseStoredColumnVisibility(
        JSON.stringify({
          authors: true,
          colorModes: false,
          removedColumn: true,
          maxPower: "visible",
        }),
      ),
    ).toEqual({
      ...DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY,
      authors: true,
      colorModes: false,
    });
  });
});
