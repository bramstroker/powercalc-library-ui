import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AliasChips } from "./AliasChips";

describe("AliasChips", () => {
  afterEach(cleanup);

  it("renders nothing when there are no aliases", () => {
    const { container } = render(<AliasChips aliases={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a chip per alias when they all fit", () => {
    render(<AliasChips aliases={["LWB010", "LWB014"]} maxVisible={2} />);

    expect(screen.getByText("LWB010")).toBeInTheDocument();
    expect(screen.getByText("LWB014")).toBeInTheDocument();
    expect(screen.queryByText(/more$/)).not.toBeInTheDocument();
  });

  it("collapses the overflowing aliases into a '+N more' chip", () => {
    render(<AliasChips aliases={["LWB010", "LWB014", "LWB006"]} maxVisible={1} />);

    expect(screen.getByText("LWB010")).toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
    expect(screen.queryByText("LWB014")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View all 3 aliases" }));

    expect(screen.getByText("Aliases (3)")).toBeInTheDocument();
    expect(screen.getByText("LWB014")).toBeInTheDocument();
    expect(screen.getByText("LWB006")).toBeInTheDocument();
  });
});
