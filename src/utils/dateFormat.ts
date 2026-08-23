/**
 * Date formatting for prerendered pages.
 *
 * `toLocaleString`/`toLocaleDateString` follow the environment's locale and time zone when those
 * are not pinned. The build machine and the visitor's browser rarely agree, so the prerendered text
 * and the hydrated text differ, React reports a hydration mismatch and throws the static markup
 * away — the page is then client-rendered for exactly the visitors prerendering was meant to serve.
 *
 * Pinning both makes every render produce the same string everywhere. UTC also keeps a
 * "contributed in June 2023" style label from sliding a day either side of the date line.
 */
const LOCALE = "en-US";

export const formatTimestampUtc = (date: Date) =>
  `${date.toLocaleString(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;

export const formatDateUtc = (
  date: Date,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
) => date.toLocaleDateString(LOCALE, { ...options, timeZone: "UTC" });
