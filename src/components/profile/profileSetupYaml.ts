/** Opens the Powercalc config flow in the reader's own Home Assistant instance. */
export const MY_HA_CONFIG_FLOW_URL =
  "https://my.home-assistant.io/redirect/config_flow_start/?domain=powercalc";

/**
 * Builds the YAML a Home Assistant user pastes into configuration.yaml.
 * Sub-profiles are appended to the model with a slash, per the Powercalc docs.
 */
export const buildSensorYaml = ({
  manufacturerDir,
  modelId,
  subProfile,
  entityId,
}: {
  manufacturerDir: string;
  modelId: string;
  subProfile?: string;
  entityId: string;
}): string => {
  const model = subProfile ? `${modelId}/${subProfile}` : modelId;
  return [
    "powercalc:",
    "  sensors:",
    `    - entity_id: ${entityId}`,
    `      manufacturer: ${manufacturerDir}`,
    `      model: ${model}`,
  ].join("\n");
};
