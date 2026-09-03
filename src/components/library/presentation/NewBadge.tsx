import { Chip, Tooltip } from "@mui/material";

import { NEW_PROFILE_DAYS } from "../../../utils/recency";

/** Marks a profile added within the last `NEW_PROFILE_DAYS` days. */
export const NewBadge = () => (
  <Tooltip title={`Added in the last ${NEW_PROFILE_DAYS} days`} describeChild>
    <Chip
      label="New"
      size="small"
      color="secondary"
      variant="outlined"
      sx={[
        { height: 18, fontSize: "0.6875rem" },
        (theme) =>
          theme.applyStyles("dark", {
            color: "secondary.light",
            borderColor: "secondary.light",
          }),
      ]}
    />
  </Tooltip>
);
