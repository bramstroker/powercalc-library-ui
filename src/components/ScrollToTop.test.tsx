import { act, render } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ScrollToTop } from "./ScrollToTop";

let navigate: ReturnType<typeof useNavigate>;

const NavigationFixture = () => {
  navigate = useNavigate();
  return <ScrollToTop />;
};

describe("ScrollToTop", () => {
  afterEach(() => vi.restoreAllMocks());

  it("scrolls to the top when the pathname changes", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    render(
      <MemoryRouter initialEntries={["/manufacturers/signify"]}>
        <NavigationFixture />
      </MemoryRouter>,
    );
    scrollTo.mockClear();

    act(() => void navigate("/contributors/example"));

    expect(scrollTo).toHaveBeenCalledOnce();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("keeps the scroll position when only search parameters change", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    render(
      <MemoryRouter initialEntries={["/?manufacturer=Signify"]}>
        <NavigationFixture />
      </MemoryRouter>,
    );
    scrollTo.mockClear();

    act(() => void navigate("/?manufacturer=IKEA"));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
