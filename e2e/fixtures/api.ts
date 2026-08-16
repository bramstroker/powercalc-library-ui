import type { Page } from "@playwright/test";

/**
 * Deterministic stand-in for the powercalc API responses. Keeping the dataset tiny
 * makes assertions on counts and ordering meaningful.
 */
export const library = {
  manufacturers: [
    {
      full_name: "Signify",
      dir_name: "signify",
      models: [
        {
          id: "LCA001",
          name: "Hue White and Color Ambiance A60",
          device_type: "light",
          color_modes: ["brightness", "color_temp", "hs"],
          aliases: ["LWB010", "LWB014"],
          author_info: { name: "Bram Gerritsen", github: "bramstroker" },
          updated_at: "2025-01-02T03:04:05Z",
          created_at: "2024-01-02T03:04:05Z",
          description: "Hue color bulb",
          measure_device: "Shelly Plug S",
          measure_method: "script",
          measure_description: "Measured with the powercalc measure tool",
          calculation_strategy: "lut",
          max_power: 9,
          standby_power: 0.4,
          standby_power_on: 0.5,
          sub_profile_count: 0,
          min_version: "1.16.0",
          compatible_integrations: ["hue"],
          measure_settings: { SAMPLE_COUNT: 2, SLEEP_TIME: 3 },
          measure_device_firmware: "ESPHome 2026.4.2",
          discovery_by: "device",
          linked_profile: "ikea/LED1836G9",
          lut_quality: { score: 96.1, brightness: 97.9, color_temp: 96.1 },
          voltage_range: { min: 224.2, max: 229.3 },
        },
        {
          id: "LCT010",
          name: "Hue Color Spot",
          device_type: "light",
          color_modes: ["brightness"],
          author_info: { name: "Bram Gerritsen", github: "bramstroker" },
          updated_at: "2025-02-02T03:04:05Z",
          created_at: "2024-02-02T03:04:05Z",
          description: "",
          measure_device: "Shelly Plug S",
          measure_method: "script",
          measure_description: "",
          calculation_strategy: "lut",
          standby_power: 0.3,
          sub_profile_count: 0,
          lut_quality: { score: 62.4, brightness: 62.4 },
        },
      ],
    },
    {
      full_name: "IKEA",
      dir_name: "ikea",
      models: [
        {
          id: "LED1836G9",
          name: "TRADFRI bulb E27 WW 806lm",
          device_type: "light",
          color_modes: ["brightness"],
          author_info: { name: "Contributor Two", github: "contributor-two" },
          updated_at: "2025-03-02T03:04:05Z",
          created_at: "2024-03-02T03:04:05Z",
          description: "",
          measure_device: "Zhurui PR10",
          measure_method: "manual",
          measure_description: "",
          calculation_strategy: "lut",
          standby_power: 0.2,
          sub_profile_count: 0,
          lut_quality: { score: 88, brightness: 88 },
        },
      ],
    },
    {
      full_name: "Sonoff",
      dir_name: "sonoff",
      models: [
        {
          id: "S31",
          name: "Smart Plug",
          device_type: "smart_switch",
          author_info: { name: "Contributor Two", github: "contributor-two" },
          updated_at: "2025-04-02T03:04:05Z",
          created_at: "2024-04-02T03:04:05Z",
          description: "",
          measure_device: "Zhurui PR10",
          measure_method: "manual",
          measure_description: "",
          calculation_strategy: "fixed",
          standby_power: 0.9,
          sub_profile_count: 0,
        },
      ],
    },
  ],
};

export const profileStats = [
  {
    manufacturer: "signify",
    model: "LCA001",
    count: 1200,
    installation_count: 480,
    percentage: 12.5,
  },
];

export const summary = {
  sampled_installations: 3840,
  snapshots: 52,
  hacs_installs: 9100,
  github_stars: 1450,
  total_sensors: 128000,
  contributors: 210,
};

const sensorEntry = (dimension: string, key_name: string, installation_count: number) => ({
  dimension,
  key_name,
  count: installation_count * 3,
  installation_count,
  percentage: installation_count / 40,
});

export const sensors = [
  ...["gui", "yaml"].map((k, i) => sensorEntry("by_config_type", k, 900 - i * 300)),
  ...[
    "light",
    "switch",
    "media_player",
    "binary_sensor",
    "sensor",
    "fan",
    "climate",
    "vacuum",
    "water_heater",
    "humidifier",
  ].map((k, i) => sensorEntry("by_source_domain", k, 900 - i * 70)),
];

export const modelJson = {
  name: "Hue White and Color Ambiance A60",
  measure_description: "Measured with the powercalc measure tool",
  calculation_strategy: "lut",
};

const json = (body: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(body),
});

/**
 * Serves every powercalc API call from the fixtures above and blocks Sentry ingest,
 * so the suite is deterministic and makes no outbound network calls.
 */
export const mockApi = async (page: Page): Promise<void> => {
  await page.route("**/*.sentry.io/**", (route) => route.abort());

  await page.route("https://api.powercalc.nl/**", async (route) => {
    const { pathname } = new URL(route.request().url());

    if (pathname === "/library") {
      return route.fulfill(json(library));
    }
    if (pathname === "/analytics/profiles") {
      return route.fulfill(json(profileStats));
    }
    if (pathname === "/analytics/summary") {
      return route.fulfill(json(summary));
    }
    if (pathname === "/analytics/sensors") {
      return route.fulfill(json(sensors));
    }
    if (pathname.startsWith("/profile/")) {
      return route.fulfill(json(modelJson));
    }
    if (pathname.startsWith("/download/")) {
      return route.fulfill(json([]));
    }

    return route.fulfill(json([]));
  });
};
