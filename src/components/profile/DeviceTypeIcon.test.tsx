import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DeviceType } from "../../types/DeviceType";

import { DeviceTypeIcon } from "./DeviceTypeIcon";

describe("DeviceTypeIcon", () => {
  it("renders the set-top box icon", () => {
    render(<DeviceTypeIcon deviceType={DeviceType.SET_TOP_BOX} />);

    expect(screen.getByTestId("DvrIcon")).toBeInTheDocument();
  });
});
