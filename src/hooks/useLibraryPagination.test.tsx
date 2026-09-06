import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { useLibraryFilters } from "./useLibraryFilters";
import { useLibraryPagination } from "./useLibraryPagination";

const setup = (entry: string, count = 130) => {
  let current: ReturnType<typeof useLibraryPagination>;
  let filters: ReturnType<typeof useLibraryFilters>;
  let navigate: ReturnType<typeof useNavigate>;
  const Harness = () => {
    current = useLibraryPagination(count);
    filters = useLibraryFilters();
    navigate = useNavigate();
    const location = useLocation();
    return <span data-testid="url">{location.pathname + location.search}</span>;
  };
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Harness />
    </MemoryRouter>,
  );
  return {
    get pagination() {
      return current;
    },
    get filters() {
      return filters;
    },
    navigate: (path: string) => navigate(path),
    url: () => screen.getByTestId("url").textContent,
  };
};

describe("library result position", () => {
  afterEach(cleanup);

  it("restores the page and size when returning from a profile", () => {
    const harness = setup("/?q=hue");
    act(() => harness.pagination.setPagination({ page: 0, pageSize: 50 }));
    act(() => harness.pagination.setPagination({ page: 1, pageSize: 50 }));
    const returnPath = harness.url()!;
    expect(returnPath).toBe("/?q=hue&pageSize=50&page=2");
    act(() => {
      void harness.navigate("/profiles/signify/LCA001");
    });
    act(() => {
      void harness.navigate(returnPath);
    });
    expect(harness.pagination).toMatchObject({ page: 1, pageSize: 50 });
  });

  it.each(["page=-3", "page=Infinity", "page=1.5", "page=abc&pageSize=3"])(
    "falls back safely for %s",
    (query) => {
      const harness = setup(`/?${query}`);
      expect(harness.pagination).toMatchObject({ page: 0, pageSize: 25 });
    },
  );

  it("clamps pages beyond the remaining results", () => {
    expect(setup("/?page=999", 30).pagination.page).toBe(1);
  });

  it("restarts at the first page when changing page size", () => {
    const harness = setup("/?page=3");
    act(() => harness.pagination.setPagination({ page: 2, pageSize: 50 }));
    expect(harness.url()).toBe("/?pageSize=50");
  });

  it("restarts pagination on filter changes and clear, preserving size and ordering", () => {
    const harness = setup("/?page=2&pageSize=50&sort=modelId&direction=desc");
    act(() => harness.filters.setSearch("hue"));
    expect(harness.url()).toBe("/?q=hue&pageSize=50&sort=modelId&direction=desc");
    act(() => harness.filters.clearAll());
    expect(harness.url()).toBe("/?pageSize=50&sort=modelId&direction=desc");
  });
});
