/**
 * Annotated with JSDoc for the same reason `urlSlugs.mjs` is: this module is imported both by the
 * TypeScript application and by `scripts/generate-sitemap.mjs`, which runs under plain Node, so it
 * has to stay `.mjs`. Without the annotations every consumer saw `any` and the type-aware lint rules
 * had nothing to check `dimensionInfo.description` against.
 *
 * @typedef {{ title: string; description: string }} SensorDimension
 */

/** @type {Record<string, SensorDimension>} */
export const SENSOR_DIMENSIONS = {
  by_config_type: {
    title: "Config type",
    description: "How the Powercalc sensor is configured",
  },
  by_device_type: {
    title: "Device type",
    description: "The device type of power profile used",
  },
  by_entity_type: {
    title: "Entity type",
    description: "The type of Powercalc entity (power, energy, utility meter)",
  },
  by_group_type: { title: "Group type", description: "The type of group" },
  by_power_profile_source: {
    title: "Power profile source",
    description: "How the virtual power sensor is configured",
  },
  by_sensor_type: { title: "Sensor type", description: "The type of Powercalc sensor" },
  by_source_domain: {
    title: "Source domain",
    description: "The domain of the source entity",
  },
  by_strategy: {
    title: "Calculation strategy",
    description: "The strategy used to calculate power",
  },
};

/**
 * @param {string} dimension
 * @returns {SensorDimension | undefined}
 */
export const getSensorDimension = (dimension) =>
  Object.prototype.hasOwnProperty.call(SENSOR_DIMENSIONS, dimension)
    ? SENSOR_DIMENSIONS[dimension]
    : undefined;

/**
 * @param {string} dimension
 * @returns {string}
 */
export const sensorDimensionTitle = (dimension) =>
  getSensorDimension(dimension)?.title ??
  dimension
    .replace(/^by_/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
