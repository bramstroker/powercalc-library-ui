import type {
  SelectChangeEvent,
  FormControlProps,
  SelectProps} from "@mui/material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import React from "react";

export type MetricKey = "installation_count" | "count" | "percentage";

export interface MetricOption {
  label: string;
  value: MetricKey;
}

export const DEFAULT_METRIC_OPTIONS: ReadonlyArray<MetricOption> = [
  { label: "Total Count", value: "count" },
  { label: "Installation Count", value: "installation_count" },
  { label: "Percentage", value: "percentage" },
];

export interface MetricsSelectProps {
  value: MetricKey;
  onChange: (value: MetricKey) => void;
  options?: ReadonlyArray<MetricOption>;
  formControlProps?: FormControlProps;
  selectProps?: Omit<SelectProps<MetricKey>, "value" | "onChange" | "label" | "labelId">;
  label?: string;
}

export const MetricsSelect = ({
  value,
  onChange,
  options = DEFAULT_METRIC_OPTIONS,
  formControlProps = { sx: { minWidth: 200 } },
  selectProps,
  label = "Metric",
}: MetricsSelectProps) => {
  const labelId = "metric-select-label";

  const handleChange = (event: SelectChangeEvent<MetricKey>) => {
    onChange(event.target.value as MetricKey);
  };

  return (
    <FormControl {...formControlProps}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select<MetricKey>
        labelId={labelId}
        value={value}
        label={label}
        onChange={handleChange}
        {...selectProps}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

