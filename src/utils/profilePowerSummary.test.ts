import { describe, expect, it } from "vitest";

import type { PowerProfile } from "../types/PowerProfile";

import { profilePowerSummary } from "./profilePowerSummary";

const profile = {
  manufacturer: { fullName: "Shelly" },
  name: "Plus Plug S",
  modelId: "SNPL-00112EU",
  standbyPower: 0.74,
  standbyPowerOn: 1.01,
  maxPower: 1.01,
  onlySelfUsage: true,
  measureDevice: "GW Instek GPM-8310",
  mainsVoltage: 230,
  measureDescription: "Manually measured with LEDs off.",
} as PowerProfile;

describe("profilePowerSummary", () => {
  it("includes consumption, scope and measurement context in the metadata summary", () => {
    const summary = profilePowerSummary(profile);
    for (const text of [
      "Shelly SNPL-00112EU",
      "0.74 W in standby",
      "1.01 W standby with the switch on",
      "excluding connected appliances",
      "GW Instek GPM-8310",
      "230 V",
    ]) {
      expect(summary).toContain(text);
    }
  });

  it("preserves zero values and identifies estimates without claiming a measurement", () => {
    const text = profilePowerSummary({
      ...profile,
      standbyPower: 0,
      standbyPowerEstimated: true,
      standbyPowerOn: undefined,
      maxPower: 0,
      measureDevice: "",
      mainsVoltage: null,
    });
    expect(text).toContain("0 W in standby (estimated, not measured)");
    expect(text).toContain("a maximum of 0 W");
    expect(text).not.toContain("Measurement equipment");
    expect(text).not.toContain("voltage");
  });

  it("omits missing values and does not invent measurement conditions", () => {
    const incomplete = {
      ...profile,
      name: "",
      standbyPower: null,
      standbyPowerOn: undefined,
      maxPower: null,
      onlySelfUsage: false,
      measureDevice: "",
      mainsVoltage: null,
      measureDescription: null,
    };
    const summary = profilePowerSummary(incomplete);
    expect(summary).toContain("Shelly SNPL-00112EU");
    for (const text of [
      "null",
      "undefined",
      "0 W",
      "Measurement notes",
      "excluding connected appliances",
      "LED",
      "voltage",
    ])
      expect(summary).not.toContain(text);
  });
});
