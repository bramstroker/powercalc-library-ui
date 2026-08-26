import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { fetchSummary, fetchTimeseries } from "../../../api/analytics.api";

import { TimeSeries } from "./TimeSeries";

vi.mock("../../../api/analytics.api", () => ({
  fetchSummary: vi.fn(),
  fetchTimeseries: vi.fn(),
}));

describe("TimeSeries", () => {
  it("shows an empty state after an empty response has loaded", async () => {
    vi.mocked(fetchSummary).mockResolvedValue({
      sampled_installations: 1,
      snapshots: 1,
      hacs_installs: 1,
      github_stars: 1,
      total_sensors: 1,
      contributors: 1,
    });
    vi.mocked(fetchTimeseries).mockResolvedValue({
      query: {
        metric: "install_date",
        bucket: "day",
        timezone: "UTC",
        from: new Date("2026-01-01T00:00:00Z"),
        to: new Date("2026-01-02T00:00:00Z"),
      },
      series: [],
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <Suspense fallback={<div>Loading data...</div>}>
            <TimeSeries />
          </Suspense>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "No data available for the selected period.",
    );
    expect(screen.queryByText("Loading data...")).not.toBeInTheDocument();
  });
});
