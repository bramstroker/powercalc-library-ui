import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Badge, Box, Chip, Tooltip } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import type { ReactElement } from "react";

import {
  CONTRIBUTOR_TIER_COLORS,
  type ContributorTierDefinition,
  contributorTierRange,
  getContributorTier,
} from "../utils/contributorTier";

const tierDescription = (definition: ContributorTierDefinition) =>
  `${definition.tier} contributor · ${contributorTierRange(definition.tier)}`;

export type ContributorTierChipProps = {
  profileCount: number;
};

/**
 * The full tier chip, for the author page where there is room to name the rank. Renders nothing
 * for contributors below the first threshold.
 */
export const ContributorTierChip = ({ profileCount }: ContributorTierChipProps) => {
  const definition = getContributorTier(profileCount);
  if (!definition) {
    return null;
  }
  const { light, dark } = CONTRIBUTOR_TIER_COLORS[definition.medal];

  return (
    <Tooltip title={contributorTierRange(definition.tier)} arrow placement="top">
      <Chip
        size="small"
        variant="outlined"
        icon={<WorkspacePremiumIcon />}
        label={`${definition.tier} contributor`}
        sx={[
          {
            fontWeight: 700,
            color: light,
            borderColor: light,
            bgcolor: `color-mix(in srgb, ${light} 12%, transparent)`,
            "& .MuiChip-icon": { color: "inherit" },
          },
          (theme) =>
            theme.applyStyles("dark", {
              color: dark,
              borderColor: dark,
              bgcolor: `color-mix(in srgb, ${dark} 16%, transparent)`,
            }),
        ]}
      />
    </Tooltip>
  );
};

export type ContributorTierAvatarProps = {
  profileCount: number;
  /** Diameter of the medal overlay in pixels — scale it with the avatar it sits on. */
  size?: number;
  children: ReactElement;
};

/**
 * Wraps an avatar with a medal overlay. Used on the contributor cards, where a full chip would
 * cost a row of vertical space that the dense grid does not have to spare. Untiered contributors
 * get their avatar back unchanged.
 */
export const ContributorTierAvatar = ({
  profileCount,
  size = 20,
  children,
}: ContributorTierAvatarProps) => {
  const definition = getContributorTier(profileCount);
  if (!definition) {
    return children;
  }
  const { light, dark } = CONTRIBUTOR_TIER_COLORS[definition.medal];

  return (
    <>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <Tooltip title={tierDescription(definition)} arrow placement="top">
            <Box
              sx={[
                {
                  width: size,
                  height: size,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: 2,
                  borderColor: "background.paper",
                  bgcolor: light,
                  color: "#fff",
                },
                (theme) =>
                  theme.applyStyles("dark", {
                    bgcolor: dark,
                    color: "rgba(0, 0, 0, 0.82)",
                  }),
              ]}
            >
              <WorkspacePremiumIcon sx={{ fontSize: size * 0.68 }} />
            </Box>
          </Tooltip>
        }
      >
        {children}
      </Badge>
      {/* Badge marks its own content aria-hidden, so the tier reaches assistive tech from here. */}
      <Box component="span" sx={visuallyHidden}>
        {tierDescription(definition)}
      </Box>
    </>
  );
};
