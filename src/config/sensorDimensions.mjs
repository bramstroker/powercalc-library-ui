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

export const getSensorDimension = (dimension) =>
  Object.prototype.hasOwnProperty.call(SENSOR_DIMENSIONS, dimension)
    ? SENSOR_DIMENSIONS[dimension]
    : undefined;

export const sensorDimensionTitle = (dimension) =>
  getSensorDimension(dimension)?.title ??
  dimension
    .replace(/^by_/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
