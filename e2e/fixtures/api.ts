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
      aliases: ["Philips"],
      website: "https://www.signify.com",
      country: "NL",
      description: "Dutch lighting manufacturer, formerly Philips Lighting.",
      models: [
        {
          id: "LCA001",
          name: "Hue White and Color Ambiance A60",
          device_type: "light",
          color_modes: ["brightness", "color_temp", "hs"],
          aliases: ["LWB010", "LWB014"],
          legacy_ids: ["Hue LCA 001"],
          authors: [{ name: "Bram Gerritsen", github: "bramstroker" }],
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
          power_range: { min: 0.72, max: 9 },
          measurement_updated_at: "2024-05-03T09:11:32Z",
          standby_power_estimated: true,
          device_specs: { socket: "E27", form_factor: "bulb", lumens: 806, rated_power: 9.5 },
          connectivity: ["zigbee"],
          product_url: "https://www.philips-hue.com/en-us/p/hue-white-and-color-ambiance-a60",
          ean: ["8719514291218"],
        },
        {
          id: "LCT010",
          name: "Hue Color Spot",
          device_type: "light",
          color_modes: ["brightness"],
          authors: [{ name: "Bram Gerritsen", github: "bramstroker" }],
          updated_at: "2025-02-02T03:04:05Z",
          created_at: "2024-02-02T03:04:05Z",
          description: "",
          measure_device: "Shelly Plug S",
          measure_method: "script",
          measure_description: "",
          calculation_strategy: "lut",
          standby_power: 0.3,
          sub_profile_count: 0,
          discovery_by: "manual",
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
          authors: [{ name: "Contributor Two", github: "contributor-two" }],
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
          authors: [{ name: "Contributor Two", github: "contributor-two" }],
          updated_at: "2025-04-02T03:04:05Z",
          created_at: "2024-04-02T03:04:05Z",
          description: "",
          measure_device: "Zhurui PR10",
          measure_method: "manual",
          measure_description: "",
          calculation_strategy: "fixed",
          standby_power: 0.9,
          sub_profile_count: 0,
          discovery_by: "entity",
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

export const timeseries = {
  query: {
    metric: "install_date",
    bucket: "day",
    timezone: "UTC",
    from: "2026-05-22",
    to: "2026-08-22",
  },
  series: [
    {
      name: "install_date",
      points: [
        { ts: "2026-08-20", value: 12 },
        { ts: "2026-08-21", value: 15 },
      ],
    },
  ],
};

export const modelJson = {
  name: "Hue White and Color Ambiance A60",
  measure_description: "Measured with the powercalc measure tool",
  calculation_strategy: "lut",
};

export const E2E_API_BASE_URL = "http://127.0.0.1:3101";

/**
 * Serves every powercalc API call from the fixtures above and blocks Sentry ingest,
 * so the suite is deterministic and makes no outbound network calls.
 */
export const mockApi = async (page: Page): Promise<void> => {
  const goto = page.goto.bind(page);
  page.goto = (async (...args: Parameters<Page["goto"]>) => {
    const response = await goto(...args);
    await page.waitForFunction(
      () => document.documentElement.dataset.hydrated === "true",
      undefined,
      { timeout: 15_000 },
    );
    return response;
  }) as Page["goto"];

  await page.route("**/*.sentry.io/**", (route) => route.abort());
};
