import {ColorMode} from "../types/ColorMode";
import {LoaderFunctionArgs} from "react-router-dom";
import {FullPowerProfile, PlotLink} from "../types/PowerProfile";
import {API_ENDPOINTS} from "../config/api";

const mapFileNameToColorMode = (fileName: string): ColorMode => {
  const baseName = fileName.split(".")[0];

  switch (baseName) {
    case ColorMode.HS:
      return ColorMode.HS;
    case ColorMode.COLOR_TEMP:
      return ColorMode.COLOR_TEMP;
    case ColorMode.BRIGHTNESS:
      return ColorMode.BRIGHTNESS;
    default:
      throw new Error(`Unknown color mode: ${baseName}`);
  }
};

// Loader function
export const powerProfileLoader = async ({params}: LoaderFunctionArgs): Promise<FullPowerProfile> => {
  const {manufacturer, model} = params;

  if (!manufacturer || !model) {
    throw new Error('Missing manufacturer or modelId in URL parameters.');
  }

  const profileUrl = `${API_ENDPOINTS.PROFILE}/${manufacturer}/${model}`;
  console.log(profileUrl)
  const profileResponse = await fetch(profileUrl);

  if (!profileResponse.ok) {
    throw new Error(`Failed to fetch profile data for ${manufacturer}/${model}`);
  }

  const modelJson = await profileResponse.json();

  const downloadUrl = `${API_ENDPOINTS.DOWNLOAD}/${manufacturer}/${model}?includePlots=1`;
  const downloadResponse = await fetch(downloadUrl);

  if (!downloadResponse.ok) {
    throw new Error(`Failed to fetch download links for ${manufacturer}/${model}`);
  }

  const downloadLinks = await downloadResponse.json();

  const plots: PlotLink[] = downloadLinks
      .filter((link: any) => link.url.endsWith('.png'))
      .map((link: any) => ({
        url: link.url,
        colorMode: mapFileNameToColorMode(link.path),
      }));

  return {
    rawJson: modelJson,
    manufacturer: manufacturer,
    modelId: model,
    name: modelJson['name'],
    aliases: modelJson['aliases'],
    deviceType: modelJson['device_type'],
    colorModes: modelJson['color_modes'],
    updatedAt: modelJson['updated_at'],
    createdAt: modelJson['created_at'],
    description: modelJson['description'],
    measureDevice: modelJson['measure_device'],
    measureMethod: modelJson['measure_method'],
    measureDescription: modelJson['measure_description'],
    calculationStrategy: modelJson['calculation_strategy'],
    standbyPower: modelJson['standby_power'],
    author: modelJson['author'],
    plots,
  };
};