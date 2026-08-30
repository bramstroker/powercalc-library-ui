import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConnectivityIcons } from "./ConnectivityIcons";

describe("ConnectivityIcons", () => {
  it("renders a labelled icon for every known protocol", () => {
    render(<ConnectivityIcons connectivity={["zigbee", "wifi", "bluetooth"]} />);

    expect(screen.getByLabelText("Zigbee")).toBeInTheDocument();
    expect(screen.getByLabelText("Wi-Fi")).toBeInTheDocument();
    expect(screen.getByLabelText("Bluetooth")).toBeInTheDocument();
  });

  it("renders nothing without connectivity information", () => {
    const { container } = render(<ConnectivityIcons connectivity={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
