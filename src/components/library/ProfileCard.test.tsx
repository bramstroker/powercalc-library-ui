import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { DeviceType } from "../../types/DeviceType";
import type { PowerProfile } from "../../types/PowerProfile";

import { ProfileCard } from "./ProfileCard";

const createProfile = (overrides: Partial<PowerProfile> = {}): PowerProfile => ({
  manufacturer: { dirName: "eufy", fullName: "Eufy", aliases: [] },
  modelId: "T8410",
  name: "Indoor Cam Pan&Tilt",
  aliases: [],
  deviceType: DeviceType.CAMERA,
  colorModes: [],
  createdAt: new Date("2023-08-01T00:00:00Z"),
  updatedAt: null,
  description: "",
  measureDevice: "",
  measureMethod: "",
  measureDescription: "",
  calculationStrategy: "fixed",
  standbyPower: null,
  maxPower: null,
  authors: [],
  subProfileCount: 0,
  compatibleIntegrations: [],
  usageStats: { installationCount: 3, deviceCount: 3, percentage: 0 },
  ...overrides,
});

const renderCard = (profile: PowerProfile) =>
  render(
    <MemoryRouter>
      <ProfileCard profile={profile} />
    </MemoryRouter>,
  );

describe("ProfileCard", () => {
  it("omits the power chip when no power figure is known", () => {
    renderCard(createProfile());

    expect(screen.queryByText(/undefined|null| W (max|standby)/i)).not.toBeInTheDocument();
  });

  it("prefers max power and otherwise shows standby power", () => {
    const { rerender } = renderCard(createProfile({ standbyPower: 0.4 }));
    expect(screen.getByText("0.4 W standby")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ProfileCard profile={createProfile({ maxPower: 6.41, standbyPower: 0.4 })} />
      </MemoryRouter>,
    );
    expect(screen.getByText("6.41 W max")).toBeInTheDocument();
    expect(screen.queryByText("0.4 W standby")).not.toBeInTheDocument();
  });
});
