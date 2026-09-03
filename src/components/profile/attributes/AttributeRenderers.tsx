import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useState } from "react";

import { formatTimestampUtc } from "../../../utils/dateFormat";

import type { ProfileAttributeValue } from "./types";

const MEASURE_DESCRIPTION_COLLAPSED_LINES = 4;
const MEASURE_DESCRIPTION_TOGGLE_THRESHOLD = 300;

export const watts = (value: ProfileAttributeValue) => `${String(value)} W`;
export const volts = (value: ProfileAttributeValue) => `${String(value)} V`;

export const MeasureDescription = ({ description }: { description: string }) => {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = description.length > MEASURE_DESCRIPTION_TOGGLE_THRESHOLD;

  return (
    <>
      <Typography
        component="div"
        variant="body2"
        sx={
          canCollapse && !expanded
            ? {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: MEASURE_DESCRIPTION_COLLAPSED_LINES,
                overflow: "hidden",
              }
            : undefined
        }
      >
        {description}
      </Typography>
      {canCollapse && (
        <Button
          size="small"
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          aria-expanded={expanded}
          sx={{ mt: 0.5, px: 0, minWidth: 0 }}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </>
  );
};

export const Timestamp = ({ date }: { date: Date }) => (
  <Box component="time" dateTime={date.toISOString()}>
    {formatTimestampUtc(date)}
  </Box>
);
