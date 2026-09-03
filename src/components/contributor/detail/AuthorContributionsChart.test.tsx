import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { PowerProfile } from "../../../types/PowerProfile";

import { AuthorContributionsChart } from "./AuthorContributionsChart";

const profile = (createdAt: string) => ({ createdAt: new Date(createdAt) }) as PowerProfile;

describe("AuthorContributionsChart", () => {
  afterEach(cleanup);

  it("renders a bar per month between the first and last contribution", () => {
    const { container } = render(
      <AuthorContributionsChart
        profiles={[profile("2025-01-15"), profile("2025-01-20"), profile("2025-04-02")]}
      />,
    );

    expect(screen.getByText("Contribution activity")).toBeInTheDocument();
    // January through April, including the two months without contributions
    expect(container.querySelectorAll("rect.MuiBarChart-element")).toHaveLength(4);
  });

  it("shows a useful milestone when all contributions fall in a single month", () => {
    render(<AuthorContributionsChart profiles={[profile("2025-01-15"), profile("2025-01-20")]} />);

    expect(screen.getByText("First contribution in January 2025")).toBeInTheDocument();
    expect(screen.getByText("2 profiles contributed that month")).toBeInTheDocument();
  });

  it("hides itself without any contribution", () => {
    const { container } = render(<AuthorContributionsChart profiles={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
