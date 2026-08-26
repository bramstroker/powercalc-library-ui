import { API_ENDPOINTS } from "../config/api";
import type { PlotLink, PowerProfile, SubProfile } from "../types/PowerProfile";

import { fetchJson } from "./http";

export interface DownloadLink {
  url: string;
  path: string;
}

const encodedProfilePath = (profile: PowerProfile) =>
  `${encodeURIComponent(profile.manufacturer.dirName)}/${encodeURIComponent(profile.modelId)}`;

export const fetchProfileJson = (profile: PowerProfile, signal?: AbortSignal) =>
  fetchJson<Record<string, unknown>>(
    `${API_ENDPOINTS.PROFILE}/${encodedProfilePath(profile)}`,
    `Failed to fetch profile JSON for ${profile.manufacturer.dirName}/${profile.modelId}`,
    signal,
  );

export const fetchDownloadLinks = (
  profile: PowerProfile,
  includePlots = false,
  signal?: AbortSignal,
) =>
  fetchJson<DownloadLink[]>(
    `${API_ENDPOINTS.DOWNLOAD}/${encodedProfilePath(profile)}${includePlots ? "?includePlots=1" : ""}`,
    `Failed to fetch profile files for ${profile.manufacturer.dirName}/${profile.modelId}`,
    signal,
  );

export const subProfileLinks = (downloadLinks: DownloadLink[]) =>
  downloadLinks.filter((link) => link.url.endsWith("model.json") && link.path !== "model.json");

export const fetchSubProfiles = async (
  profile: PowerProfile,
  signal?: AbortSignal,
): Promise<SubProfile[]> => {
  const links = subProfileLinks(await fetchDownloadLinks(profile, false, signal));

  return Promise.all(
    links.map(async (link) => ({
      name: link.path.split("/")[0],
      rawJson: await fetchJson<Record<string, unknown>>(
        link.url,
        `Failed to fetch sub profile at ${link.url}`,
        signal,
      ),
    })),
  );
};

export const plotsFromDownloadLinks = (downloadLinks: DownloadLink[]): PlotLink[] => {
  // Prefer the vector version of a plot, falling back to the bitmap when needed.
  const byLabel = new Map<string, PlotLink & { isVector: boolean }>();

  for (const link of downloadLinks) {
    const isVector = link.url.endsWith(".svg");
    if (!isVector && !link.url.endsWith(".png")) continue;

    const label = link.path.split(".")[0];
    const existing = byLabel.get(label);
    if (existing && (existing.isVector || !isVector)) continue;

    byLabel.set(label, { url: link.url, label, isVector });
  }

  return [...byLabel.values()].map(({ url, label }) => ({ url, label }));
};

export const fetchPlots = async (
  profile: PowerProfile,
  signal?: AbortSignal,
): Promise<PlotLink[]> => plotsFromDownloadLinks(await fetchDownloadLinks(profile, true, signal));
