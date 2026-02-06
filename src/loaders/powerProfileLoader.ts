import type { LoaderFunctionArgs } from "react-router-dom";

import { API_ENDPOINTS } from "../config/api";
import {libraryQuery} from "../queries/library.query";
import { queryClient } from "../queryClient";
import type { FullPowerProfile, PlotLink, SubProfile } from "../types/PowerProfile";

interface DownloadLink {
  url: string;
  path: string;
}

type ModelJson = { measure_description?: string; };

const requireParams = (params: LoaderFunctionArgs["params"]) => {
  const manufacturer = params.manufacturer;
  const model = params.model;
  if (!manufacturer || !model) {
    throw new Error("Missing manufacturer or model in URL parameters.");
  }
  return { manufacturer, model };
}

const fetchJson = async <T>(url: string, errorMessage: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${errorMessage} (HTTP ${res.status})`);
  return res.json() as Promise<T>;
}

const toPlots = (downloadLinks: DownloadLink[]): PlotLink[] => {
  return downloadLinks
      .filter((l) => l.url.endsWith(".png"))
      .map((l) => ({
        url: l.url,
        label: l.path.split(".")[0],
      }));
}

const toSubProfiles = async (downloadLinks: DownloadLink[]): Promise<SubProfile[]> => {
  const subProfileLinks = downloadLinks.filter(
      (l) => l.url.endsWith("model.json") && l.path !== "model.json"
  );

  return Promise.all(
      subProfileLinks.map(async (l) => {
        const rawJson = await fetchJson<Record<string, unknown>>(l.url, `Failed to fetch subProfile at ${l.url}`);
        return { name: l.path.split("/")[0], rawJson };
      })
  );
}

export const powerProfileLoader = async ({ params }: LoaderFunctionArgs): Promise<FullPowerProfile> => {
  const { manufacturer, model } = requireParams(params);

  const derived = await queryClient.ensureQueryData(libraryQuery());

  const powerProfile = derived.powerProfilesByKey.get(`${manufacturer}/${model}`);
  if (!powerProfile) throw new Error(`Unknown profile ${manufacturer}/${model}`);

  const profileUrl = `${API_ENDPOINTS.PROFILE}/${manufacturer}/${model}`;
  const downloadUrl = `${API_ENDPOINTS.DOWNLOAD}/${manufacturer}/${model}?includePlots=1`;

  const modelPromise = fetchJson<ModelJson>(
      profileUrl,
      `Failed to fetch profile data for ${manufacturer}/${model}`
  );

  const downloadPromise = fetchJson<DownloadLink[]>(
      downloadUrl,
      `Failed to fetch download links for ${manufacturer}/${model}`
  );

  const [modelJson, downloadLinks] = await Promise.all([
    modelPromise,
    downloadPromise,
  ]);

  const plots = toPlots(downloadLinks);
  const subProfiles = await toSubProfiles(downloadLinks);

  return {
    ...powerProfile,
    measureDescription: modelJson.measure_description || '',
    rawJson: modelJson,
    plots,
    subProfiles,
  };
};
