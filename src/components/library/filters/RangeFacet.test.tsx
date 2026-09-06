import BoltIcon from "@mui/icons-material/Bolt";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";

import type { Range } from "../../../types/LibraryFilters";

import { RangeFacet } from "./RangeFacet";

afterEach(cleanup);

const Harness = () => {
  const [value, setValue] = useState<Range>();
  return (
    <RangeFacet
      title="Max power"
      icon={BoltIcon}
      unit="W"
      bounds={[0, 3000]}
      value={value}
      onChange={setValue}
      expanded
      onToggleExpanded={() => {}}
    />
  );
};

it("names the slider ends and accepts precise input with ordered, bounded values", () => {
  render(<Harness />);
  const minimum = screen.getByRole("spinbutton", { name: "Minimum max power (W)" });
  const maximum = screen.getByRole("spinbutton", { name: "Maximum max power (W)" });
  expect(screen.getByRole("slider", { name: "Minimum max power" })).toHaveAttribute(
    "aria-valuetext",
    "0 W",
  );
  expect(screen.getByRole("slider", { name: "Maximum max power" })).toHaveAttribute(
    "aria-valuetext",
    "3000 W",
  );
  fireEvent.change(maximum, { target: { value: "0.5" } });
  fireEvent.blur(maximum);
  expect(maximum).toHaveValue(0.5);
  expect(screen.getByRole("slider", { name: "Maximum max power" })).toHaveAttribute(
    "aria-valuetext",
    "0.5 W",
  );
  fireEvent.change(minimum, { target: { value: "20" } });
  fireEvent.blur(minimum);
  expect(minimum).toHaveValue(0.5);
  fireEvent.change(maximum, { target: { value: "4000" } });
  fireEvent.blur(maximum);
  expect(maximum).toHaveValue(3000);
  fireEvent.change(minimum, { target: { value: "" } });
  fireEvent.blur(minimum);
  expect(minimum).toHaveValue(0.5);
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(minimum).toHaveValue(0);
  expect(maximum).toHaveValue(3000);
  expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
});
