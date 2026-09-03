import type { ElementType, ReactNode } from "react";

export type ProfileAttributeValue =
  string | number | boolean | undefined | null | string[] | Record<string, unknown>;

export type ProfileAttributeGroup = "device" | "power" | "measurement" | "library";

export type ProfileAttribute = {
  label: string;
  value: ProfileAttributeValue;
  icon: ElementType;
  group: ProfileAttributeGroup;
  filterKey?: string;
  stackValues?: boolean;
  render?: (value: ProfileAttributeValue) => ReactNode;
  /** Converts a raw filter value into its human-readable label. */
  display?: (value: string) => string;
};

export const PROFILE_ATTRIBUTE_GROUPS: {
  key: ProfileAttributeGroup;
  label: string;
}[] = [
  { key: "device", label: "Device" },
  { key: "power", label: "Power" },
  { key: "measurement", label: "Measurement" },
  { key: "library", label: "Library" },
];

/** Already visible in the profile heading or headline facts. */
const SUMMARY_ATTRIBUTE_LABELS = new Set([
  "Model ID",
  "Device type",
  "Name",
  "Max power",
  "Standby power",
]);

export const isVisibleProfileAttribute = (attribute: ProfileAttribute) =>
  attribute.value != null &&
  attribute.value !== "" &&
  !(Array.isArray(attribute.value) && attribute.value.length === 0) &&
  !SUMMARY_ATTRIBUTE_LABELS.has(attribute.label);
