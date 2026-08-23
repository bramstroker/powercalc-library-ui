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

const relativeTime = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/** Human-friendly age for client-rendered freshness labels. */
export const formatRelativeDate = (date: Date, now: Date = new Date()) => {
  const seconds = (date.getTime() - now.getTime()) / 1000;
  const absoluteSeconds = Math.abs(seconds);

  if (absoluteSeconds < 60) return "just now";
  if (absoluteSeconds < 60 * 60) return relativeTime.format(Math.round(seconds / 60), "minute");
  if (absoluteSeconds < 60 * 60 * 24)
    return relativeTime.format(Math.round(seconds / (60 * 60)), "hour");
  if (absoluteSeconds < 60 * 60 * 24 * 30)
    return relativeTime.format(Math.round(seconds / (60 * 60 * 24)), "day");
  if (absoluteSeconds < 60 * 60 * 24 * 365)
    return relativeTime.format(Math.round(seconds / (60 * 60 * 24 * 30)), "month");

  return relativeTime.format(Math.round(seconds / (60 * 60 * 24 * 365)), "year");
};
