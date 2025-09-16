import {LoaderFunctionArgs} from "react-router-dom";

import { queryClient } from "../queryClient";
import { fetchLibrary ,LibraryModel} from "../api/library.api";
import {FullPowerProfile, PlotLink} from "../types/PowerProfile";
import {ColorMode} from "../types/ColorMode";
import {DeviceType} from "../types/DeviceType";
import {API_ENDPOINTS} from "../config/api";

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
    updatedAt: modelJson['updated_at'],
    createdAt: modelJson['created_at'],
    description: modelJson['description'],
    measureDevice: modelJson['measure_device'],
    measureMethod: modelJson['measure_method'],
    measureDescription: modelJson['measure_description'],
    calculationStrategy: modelJson['calculation_strategy'],
    maxPower: libraryModel?.max_power,
    standbyPower: modelJson['standby_power'],
    standbyPowerOn: modelJson['standby_power_on'],
    author: modelJson['author'],
    plots,
  };
};
