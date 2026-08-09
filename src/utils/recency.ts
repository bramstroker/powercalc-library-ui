import type { PowerProfile } from "../types/PowerProfile";

/**
 * How recently a profile has to have been added to count as new. Roughly 8 profiles land in a
 * month, so this keeps the badge meaningful rather than decorative.
 *
 * Note this deliberately uses `createdAt`, not `updatedAt`: nearly every profile in the library
 * carries a recent `updated_at` from bulk re-imports, so it says nothing about actual change.
 */
export const NEW_PROFILE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export const daysSince = (date: Date | null | undefined, now: Date = new Date()): number | null => {
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }
  return (now.getTime() - date.getTime()) / DAY_MS;
};

export const isRecentlyAdded = (
  profile: PowerProfile,
  now: Date = new Date(),
  withinDays: number = NEW_PROFILE_DAYS,
): boolean => {
  const age = daysSince(profile.createdAt, now);
  return age !== null && age >= 0 && age <= withinDays;
};

/** Newest first. */
export const recentlyAdded = (
  profiles: PowerProfile[],
  withinDays: number = NEW_PROFILE_DAYS,
  now: Date = new Date(),
): PowerProfile[] =>
  profiles
    .filter((profile) => isRecentlyAdded(profile, now, withinDays))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
