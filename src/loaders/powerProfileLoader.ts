import type {LoaderFunctionArgs} from "react-router-dom";

import type {LibraryModel} from "../api/library.api";
import { fetchLibrary } from "../api/library.api";
import {API_ENDPOINTS} from "../config/api";
import { queryClient } from "../queryClient";
import type {ColorMode} from "../types/ColorMode";
import type {DeviceType} from "../types/DeviceType";
import type {FullPowerProfile, PlotLink, SubProfile} from "../types/PowerProfile";

interface DownloadLink {
  url: string;
  path: string;
}

// Loader function
export const powerProfileLoader = async ({params}: LoaderFunctionArgs): Promise<FullPowerProfile> => {
  const {manufacturer, model} = params;

  if (!manufacturer || !model) {
    throw new Error('Missing manufacturer or modelId in URL parameters.');
  }

  // Fetch manufacturer data
  const manufacturerUrl = `${API_ENDPOINTS.MANUFACTURER}/${manufacturer}`;
  const manufacturerResponse = await fetch(manufacturerUrl);
  if (!manufacturerResponse.ok) {
    throw new Error(`Failed to fetch manufacturer data for ${manufacturer}`);
  }
  const manufacturerJson = await manufacturerResponse.json();

  // Fetch model data
  const profileUrl = `${API_ENDPOINTS.PROFILE}/${manufacturer}/${model}`;
  const profileResponse = await fetch(profileUrl);
  if (!profileResponse.ok) {
    throw new Error(`Failed to fetch profile data for ${manufacturer}/${model}`);
  }
  const modelJson = await profileResponse.json();

  // Fetch library data to get color_modes and max_power
  // Ensure the big library is in cache (fetches once per app lifecycle)
  const library = await queryClient.ensureQueryData({
    queryKey: ["library"],
    queryFn: fetchLibrary,
  });
  const mfr = library.manufacturers.find((m) => m.dir_name === manufacturer);
  const libraryModel = mfr?.models?.find((mdl: LibraryModel) => mdl.id === model);

  // Fetch download links
  const downloadUrl = `${API_ENDPOINTS.DOWNLOAD}/${manufacturer}/${model}?includePlots=1`;
  const downloadResponse = await fetch(downloadUrl);
  if (!downloadResponse.ok) {
    throw new Error(`Failed to fetch download links for ${manufacturer}/${model}`);
  }
  const downloadLinks = await downloadResponse.json();

  const plots: PlotLink[] = downloadLinks
      .filter((link: DownloadLink) => link.url.endsWith('.png'))
      .map((link: DownloadLink) => ({
        url: link.url,
        label: link.path.split(".")[0],
      }));

  // Filter and fetch subProfiles (all model.json files except the root one)
  const subProfileLinks = downloadLinks
      .filter((link: DownloadLink) => link.url.endsWith('model.json') && link.path !== "model.json");

  const subProfiles: SubProfile[] = await Promise.all(
    subProfileLinks.map(async (link: DownloadLink) => {
      const response = await fetch(link.url);
      if (!response.ok) {
        console.error(`Failed to fetch subProfile at ${link.url}`);
        return { name: link.path.split('/')[0], rawJson: {} };
      }
      const json = await response.json();
      return {
        name: link.path.split('/')[0], // Use the directory name as the subProfile name
        rawJson: json
      };
    })
  );

  return {
    rawJson: modelJson,
    manufacturer: {
      dirName: manufacturer,
      fullName: manufacturerJson['name'],
    },
    modelId: model,
    name: modelJson['name'],
    aliases: Array.isArray(modelJson['aliases']) ? modelJson['aliases'].join("|") : (modelJson['aliases'] || ""),
    deviceType: modelJson['device_type'] as DeviceType,
    colorModes: (libraryModel?.color_modes || []) as ColorMode[],
    updatedAt: libraryModel ? new Date(libraryModel.updated_at) : null,
    createdAt: new Date(modelJson['created_at']),
    description: modelJson['description'],
    measureDevice: modelJson['measure_device'],
    measureMethod: modelJson['measure_method'],
    measureDescription: modelJson['measure_description'],
    calculationStrategy: modelJson['calculation_strategy'],
    maxPower: libraryModel?.max_power !== undefined && libraryModel?.max_power > 0 ? libraryModel.max_power : null,
    standbyPower: modelJson['standby_power'],
    standbyPowerOn: modelJson['standby_power_on'],
    author: modelJson['author'],
    plots: plots,
    subProfiles: subProfiles,
    subProfileCount: libraryModel?.sub_profile_count || 0,
    minVersion: modelJson['min_version'] || null,
    compatibleIntegrations: modelJson['compatible_integrations'] || [],
  };
};
