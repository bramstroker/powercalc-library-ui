import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Summary } from "../../api/analytics.api";
import type { PowerProfile } from "../../types/PowerProfile";

import { ProfileMetrics } from "./ProfileMetrics";

describe("ProfileMetrics", () => {
  it("renders analytics in the server-generated markup", () => {
    const profile = {
      usageStats: {
        installationCount: 12,
        deviceCount: 14,
        percentage: 1.2,
      },
    } as PowerProfile;
    const summary = {
      sampled_installations: 1000,
      snapshots: 10,
      hacs_installs: 500,
      github_stars: 1200,
      total_sensors: 42000,
      contributors: 250,
    } satisfies Summary;

    const html = renderToStaticMarkup(<ProfileMetrics profile={profile} summary={summary} />);

    expect(html).toContain("Community usage");
    expect(html).toContain("12 opted-in installations");
    expect(html).toContain("1.2% of 1,000 reporting installations");
    expect(html).toContain("Opt in to analytics");
    expect(html).toContain("https://docs.powercalc.nl/misc/analytics/");
  });
});
