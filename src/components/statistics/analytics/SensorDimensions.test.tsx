import { useSuspenseQuery } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SensorStats } from "../../../api/analytics.api";

import { SensorDimensions } from "./SensorDimensions";

vi.mock("@tanstack/react-query", () => ({
  queryOptions: (options: unknown) => options,
  useSuspenseQuery: vi.fn(),
}));

vi.mock("@mui/x-charts/PieChart", () => ({
  PieChart: () => <div data-testid="pie-chart" />,
  pieClasses: { arcLabel: "arc-label" },
}));

vi.mock("./AnalyticsHeader", () => ({
  AnalyticsHeader: ({ filterSection }: { filterSection?: React.ReactNode }) => filterSection,
}));

vi.mock("./MetricsSelect", () => ({
  MetricsSelect: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: "percentage") => void;
  }) => (
    <div>
      <span data-testid="overview-metric">{value}</span>
      <button type="button" onClick={() => onChange("percentage")}>
        Select percentage
      </button>
    </div>
  ),
}));

vi.mock("./SensorDimensionDetailView", () => ({
  SensorDimensionDetailView: ({
    metric,
    onMetricChange,
  }: {
    metric: string;
    onMetricChange: (value: "percentage") => void;
  }) => (
    <div>
      <span data-testid="detail-metric">{metric}</span>
      <button type="button" onClick={() => onMetricChange("percentage")}>
        Select detail percentage
      </button>
    </div>
  ),
}));

const sensorData: SensorStats[] = [
  {
    dimension: "device_type",
    key_name: "light",
    count: 10,
    installation_count: 8,
    percentage: 80,
  },
];

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}`}</span>;
};

const renderPage = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/analytics/sensor-dimensions/:dimension?"
          element={
            <>
              <SensorDimensions />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("SensorDimensions", () => {
  afterEach(cleanup);

  it("falls back from an invalid URL metric and preserves other query parameters", () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({ data: sensorData } as never);
    renderPage("/analytics/sensor-dimensions?metric=unknown&source=test");

    expect(screen.getByTestId("overview-metric")).toHaveTextContent("installation_count");

    fireEvent.click(screen.getByRole("button", { name: "Select percentage" }));

    expect(screen.getByTestId("overview-metric")).toHaveTextContent("percentage");
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/analytics/sensor-dimensions?metric=percentage&source=test",
    );
  });

  it("lets the controlled detail view update the metric in the URL", () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({ data: sensorData } as never);
    renderPage("/analytics/sensor-dimensions/device_type?metric=count&source=test");

    expect(screen.getByTestId("detail-metric")).toHaveTextContent("count");

    fireEvent.click(screen.getByRole("button", { name: "Select detail percentage" }));

    expect(screen.getByTestId("detail-metric")).toHaveTextContent("percentage");
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/analytics/sensor-dimensions/device_type?metric=percentage&source=test",
    );
  });
});
