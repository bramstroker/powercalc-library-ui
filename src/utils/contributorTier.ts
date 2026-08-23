export type ContributorTier = "Watt" | "Kilowatt" | "Megawatt";

export type ContributorTierDefinition = {
  tier: ContributorTier;
  /** Minimum profile count to reach the tier. */
  min: number;
  /** Medal the tier is coloured after. */
  medal: "bronze" | "silver" | "gold";
};

/**
 * The three recognition tiers, best first.
 *
 * Contributions are heavily skewed — the median is two profiles and only a handful of people
 * reach double digits — so the ladder starts above the median rather than at one profile. Below
 * the Watt threshold a contributor carries no medal at all: a badge everybody holds signals
 * nothing, and the first one should read as something earned.
 *
 * Tiers are cumulative over a contributor's whole history, so nobody ever drops a rank. Recency
 * is a separate axis, covered by the active-contributor window on the contributors page.
 */
export const CONTRIBUTOR_TIERS: ContributorTierDefinition[] = [
  { tier: "Megawatt", min: 15, medal: "gold" },
  { tier: "Kilowatt", min: 8, medal: "silver" },
  { tier: "Watt", min: 3, medal: "bronze" },
];

/** Null below the lowest threshold — those contributors are untiered, not bottom-tiered. */
export const getContributorTier = (
  profileCount: number,
): ContributorTierDefinition | null =>
  CONTRIBUTOR_TIERS.find((definition) => profileCount >= definition.min) ?? null;

/** Human-readable range, for tooltips: "8–14 profiles", "15+ profiles". */
export const contributorTierRange = (tier: ContributorTier): string => {
  const index = CONTRIBUTOR_TIERS.findIndex((definition) => definition.tier === tier);
  const definition = CONTRIBUTOR_TIERS[index];
  const next = CONTRIBUTOR_TIERS[index - 1];
  if (!next) {
    return `${definition.min}+ profiles`;
  }
  return `${definition.min}–${next.min - 1} profiles`;
};

/**
 * Metallic hues, per colour mode. The literal metals (#CD7F32, #C0C0C0, #FFD700) are unreadable
 * on a light background, so each medal carries a darkened light-mode value and a lifted dark-mode
 * one instead of a single shared colour.
 */
export const CONTRIBUTOR_TIER_COLORS: Record<
  ContributorTierDefinition["medal"],
  { light: string; dark: string }
> = {
  bronze: { light: "#A05A2C", dark: "#D08B54" },
  silver: { light: "#6E7A86", dark: "#C5CDD6" },
  gold: { light: "#B8860B", dark: "#F0C14B" },
};
