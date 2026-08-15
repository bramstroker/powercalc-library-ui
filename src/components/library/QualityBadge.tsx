import { Chip, Tooltip } from "@mui/material";

import { QUALITY_BAND_COLORS, getQualityBand } from "../../utils/lutQuality";

export type QualityBadgeProps = {
  score: number | null | undefined;
  /** Shows the band name next to the number. Used on the profile page, not in the dense grid. */
  showBand?: boolean;
};

/**
 * The LUT smoothness score as a coloured chip. Renders nothing without a score — profiles using
 * a fixed or linear strategy have no curve to judge, and an empty cell says that better than a
 * "n/a" chip repeated down the column.
 */
export const QualityBadge = ({ score, showBand = false }: QualityBadgeProps) => {
  if (score == null) {
    return null;
  }

  const band = getQualityBand(score);

  return (
    <Tooltip
      title="How smooth the measured power curve is, from 0 to 100. It says nothing about how accurate the measurements are."
      arrow
      placement="top"
    >
      <Chip
        size="small"
        variant="outlined"
        color={QUALITY_BAND_COLORS[band]}
        label={showBand ? `${String(score)} · ${band}` : score}
      />
    </Tooltip>
  );
};
