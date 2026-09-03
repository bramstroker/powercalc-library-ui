import { API_ENDPOINTS } from "../config/api";
import type { PlotLink, PowerProfile, SubProfile } from "../types/PowerProfile";
import { safeProfileResourceUrl } from "../utils/externalUrls";

export interface DownloadLink {
  url: string;
  path: string;
}

const encodedProfilePath = (profile: PowerProfile) =>
  `${encodeURIComponent(profile.manufacturer.dirName)}/${encodeURIComponent(profile.modelId)}`;

export const profileJsonUrl = (profile: PowerProfile) =>
  `${API_ENDPOINTS.PROFILE}/${encodedProfilePath(profile)}`;

const fetchJson = async <T>(url: string, errorMessage: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${errorMessage} (HTTP ${response.status})`);
  }
  return response.json() as Promise<T>;
};

export const fetchProfileJson = (profile: PowerProfile) =>
  fetchJson<Record<string, unknown>>(
    profileJsonUrl(profile),
    `Failed to fetch profile JSON for ${profile.manufacturer.dirName}/${profile.modelId}`,
  );

const safeDownloadLinks = (downloadLinks: unknown): DownloadLink[] =>
  Array.isArray(downloadLinks)
    ? downloadLinks.flatMap((link: unknown) => {
        if (!link || typeof link !== "object") return [];

        const { path, url: candidateUrl } = link as Partial<DownloadLink>;
        const url = safeProfileResourceUrl(candidateUrl);
        return url && typeof path === "string" ? [{ path, url }] : [];
      })
    : [];

export const fetchDownloadLinks = async (profile: PowerProfile, includePlots = false) =>
  safeDownloadLinks(
    await fetchJson<DownloadLink[]>(
      `${API_ENDPOINTS.DOWNLOAD}/${encodedProfilePath(profile)}${includePlots ? "?includePlots=1" : ""}`,
      `Failed to fetch profile files for ${profile.manufacturer.dirName}/${profile.modelId}`,
    ),
  );

export const subProfileLinks = (downloadLinks: DownloadLink[]) =>
  safeDownloadLinks(downloadLinks).filter(
    (link) => link.url.endsWith("model.json") && link.path !== "model.json",
  );

export const fetchSubProfiles = async (profile: PowerProfile): Promise<SubProfile[]> => {
  const links = subProfileLinks(await fetchDownloadLinks(profile));

  return Promise.all(
    links.map(async (link) => ({
      name: link.path.split("/")[0],
      rawJson: await fetchJson<Record<string, unknown>>(
        link.url,
        `Failed to fetch sub profile at ${link.url}`,
      ),
    })),
  );
};

export const plotsFromDownloadLinks = (downloadLinks: DownloadLink[]): PlotLink[] => {
  // Prefer the vector version of a plot, falling back to the bitmap when needed.
  const byLabel = new Map<string, PlotLink & { isVector: boolean }>();

  for (const link of safeDownloadLinks(downloadLinks)) {
    const isVector = link.url.endsWith(".svg");
    if (!isVector && !link.url.endsWith(".png")) continue;

    const label = link.path.split(".")[0];
    const existing = byLabel.get(label);
    if (existing && (existing.isVector || !isVector)) continue;

    byLabel.set(label, { url: link.url, label, isVector });
  }

  return [...byLabel.values()].map(({ url, label }) => ({ url, label }));
};

export const fetchPlots = async (profile: PowerProfile): Promise<PlotLink[]> =>
  plotsFromDownloadLinks(await fetchDownloadLinks(profile, true));
