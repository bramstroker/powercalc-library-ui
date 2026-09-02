import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { QueryRobotsMeta } from "./root";

describe("site-wide query metadata", () => {
  it("keeps clean URLs indexable", () => {
    render(
      <MemoryRouter initialEntries={["/manufacturers"]}>
        <QueryRobotsMeta />
      </MemoryRouter>,
    );

    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("marks every URL with query parameters as noindex", () => {
    render(
      <MemoryRouter initialEntries={["/?manufacturer=Signify&colorMode=hs&unknown=value"]}>
        <QueryRobotsMeta />
      </MemoryRouter>,
    );

    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
  });
});
