/**
 * Create stable, human-readable URL segments without losing non-Latin letters.
 * Diacritics are folded where possible and punctuation/whitespace becomes one dash.
 *
 * @param {string} value
 * @returns {string}
 */
export const slugifyPathSegment = (value) =>
  String(value)
    .normalize("NFKD")
    .replace(/\p{Mark}+/gu, "")
    .toLocaleLowerCase("en-US")
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

const encodeSlug = (value) => encodeURIComponent(slugifyPathSegment(value));

/** @param {string} author */
export const authorPath = (author) => `/contributors/${encodeSlug(author)}`;

/** @param {string} manufacturer */
export const manufacturerPath = (manufacturer) => `/manufacturers/${encodeSlug(manufacturer)}`;

/** @param {string} manufacturer @param {string} model */
export const profilePath = (manufacturer, model) =>
  `/profiles/${encodeSlug(manufacturer)}/${encodeSlug(model)}`;
