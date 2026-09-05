import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DeviceType } from "../../types/DeviceType";

import { DeviceTypeIcon, getDeviceTypeIcon } from "./DeviceTypeIcon";

describe("DeviceTypeIcon", () => {
  it("renders the set-top box icon", () => {
    render(<DeviceTypeIcon deviceType={DeviceType.SET_TOP_BOX} />);

    expect(screen.getByTestId("DvrIcon")).toBeInTheDocument();
  });

  it("has an icon for every known device type", () => {
    for (const deviceType of Object.values(DeviceType)) {
      expect(getDeviceTypeIcon(deviceType), deviceType).toBeDefined();
    }
  });

  it.each([
    [DeviceType.AIR_CONDITIONER, "AcUnitIcon"],
    [DeviceType.AIR_PURIFIER, "BlurOnIcon"],
    [DeviceType.HUMIDIFIER, "WaterDropIcon"],
    [DeviceType.WATER_HEATER, "HeatPumpIcon"],
  ])("renders the %s icon", (deviceType, testId) => {
    render(<DeviceTypeIcon deviceType={deviceType} />);

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
