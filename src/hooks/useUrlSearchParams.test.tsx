import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import type { SearchParamChanges } from "./useUrlSearchParams";
import { useUrlSearchParams } from "./useUrlSearchParams";

type UpdateSearchParams = (changes: SearchParamChanges) => void;

const Harness = ({ onReady }: { onReady: (update: UpdateSearchParams) => void }) => {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  onReady(updateSearchParams);
  return <span data-testid="query">{searchParams.toString()}</span>;
};

const renderHarness = (initialEntry = "/") => {
  let update: UpdateSearchParams | undefined;
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Harness
        onReady={(next) => {
          update = next;
        }}
      />
    </MemoryRouter>,
  );
  return {
    update: (changes: SearchParamChanges) => {
      if (!update) throw new Error("harness not ready");
      update(changes);
    },
    query: () => screen.getByTestId("query").textContent,
  };
};

describe("useUrlSearchParams", () => {
  afterEach(cleanup);

  it("preserves unrelated parameters and deletes null values", () => {
    const harness = renderHarness("/?page=2&sort=name");

    act(() => harness.update({ sort: null, q: "hue" }));

    expect(harness.query()).toBe("page=2&q=hue");
  });

  it("compounds updates issued before the navigation commits", () => {
    const harness = renderHarness();

    act(() => {
      harness.update({ q: "hue" });
      harness.update({ sort: "newest" });
    });

    expect(harness.query()).toBe("q=hue&sort=newest");
  });
});
