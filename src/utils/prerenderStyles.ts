/**
 * Suspense can render a later sibling first. Emotion then emits a shared rule at that sibling,
 * after an earlier element that needs it. Preserve the original tags for hydration, but provide
 * only these late rules in the head so incremental HTML parsing never paints unstyled content.
 */
export const provideEarlyStyles = (html: string): string => {
  const firstUse = new Map<string, number>();
  for (const match of html.matchAll(/\bclass="([^"]*)"/gu)) {
    for (const name of match[1].split(/\s+/u)) {
      if (!firstUse.has(name)) firstUse.set(name, match.index);
    }
  }
  const earlyRules: string[] = [];
  for (const match of html.matchAll(
    /<style\b[^>]*data-emotion="([^"]+)"[^>]*>([\s\S]*?)<\/style>/gu,
  )) {
    const [key, ...ids] = match[1].split(" ");
    if (ids.some((id) => (firstUse.get(`${key}-${id}`) ?? Infinity) < match.index)) {
      earlyRules.push(match[2]);
    }
  }
  return earlyRules.length
    ? html.replace(
        "</head>",
        `<style data-prerender-early-styles="">${earlyRules.join("")}</style></head>`,
      )
    : html;
};
