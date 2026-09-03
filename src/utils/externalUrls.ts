type SafeHttpsUrlOptions = {
  allowedHosts?: readonly string[];
  pathPattern?: RegExp;
};

/**
 * Accepts only absolute, credential-free HTTPS URLs. API response types are compile-time only, so
 * every external URL must cross this runtime boundary before it reaches `fetch`, `href`, or `src`.
 */
export const safeHttpsUrl = (
  value: unknown,
  { allowedHosts, pathPattern }: SafeHttpsUrlOptions = {},
): string | null => {
  if (typeof value !== "string") return null;

  const candidate = value.trim();
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;

    const normalizedHosts = allowedHosts?.map((host) => host.toLowerCase());
    if (normalizedHosts && !normalizedHosts.includes(parsed.hostname.toLowerCase())) return null;
    if (pathPattern && !pathPattern.test(parsed.pathname)) return null;

    return candidate;
  } catch {
    return null;
  }
};

export const safeGithubPullRequestUrl = (value: unknown): string | null =>
  safeHttpsUrl(value, {
    allowedHosts: ["github.com"],
    pathPattern: /^\/bramstroker\/homeassistant-powercalc\/pull\/\d+\/?$/u,
  });

export const safeProfileResourceUrl = (value: unknown): string | null =>
  safeHttpsUrl(value, {
    allowedHosts: ["raw.githubusercontent.com"],
    pathPattern: /^\/bramstroker\/homeassistant-powercalc\//u,
  });
