import { numberFormat } from "./formatters";

/**
 * Formats a count with the right form of its noun: `plural(1, "profile")` is "1 profile", not
 * "1 profiles". Pass `pluralForm` for nouns that do not simply take an "s".
 */
export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${numberFormat.format(count)} ${count === 1 ? singular : pluralForm}`;
