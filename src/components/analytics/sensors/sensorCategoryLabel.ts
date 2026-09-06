import { humanizeIdentifier } from "../../../utils/profilePresentation";

const CATEGORY_LABELS: Record<string, string> = {
  gui: "User interface",
  yaml: "YAML",
  library_builtin: "Built-in library",
  library_custom: "Custom library",
};

export const sensorCategoryLabel = (key: string) =>
  Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, key)
    ? CATEGORY_LABELS[key]
    : humanizeIdentifier(key);
