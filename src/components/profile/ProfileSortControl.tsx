import SortIcon from "@mui/icons-material/Sort";
import { Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";

import { PROFILE_SORT_OPTIONS, type ProfileSort } from "../../utils/profileSort";

export const ProfileSortControl = ({
  value,
  onChange,
  label,
}: {
  value: ProfileSort;
  onChange: (value: ProfileSort) => void;
  label: string;
}) => (
  <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
    <SortIcon fontSize="small" sx={{ color: "text.secondary" }} />
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      aria-label={label}
      onChange={(_event, next: ProfileSort | null) => {
        if (next) onChange(next);
      }}
    >
      {PROFILE_SORT_OPTIONS.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Stack>
);
