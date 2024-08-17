import Grid from "@mui/material/Grid";
import { PowerProfile } from "../types/PowerProfile";
import { ColorMode } from "../types/ColorMode";
import { Alert, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import FactoryIcon from "@mui/icons-material/Factory";
import HistoryIcon from "@mui/icons-material/History";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonIcon from "@mui/icons-material/Person";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import BoltIcon from "@mui/icons-material/Bolt";
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
import MoreIcon from "@mui/icons-material/More";
import PermDeviceInformationIcon from "@mui/icons-material/PermDeviceInformation";
import MediationIcon from "@mui/icons-material/Mediation";
import Plot from "./Plot";

interface DetailPanelProps {
  profile: PowerProfile;
}

const API_ENDPOINT_PROFILE = "https://api.powercalc.nl/profile";
const API_ENDPOINT_DOWNLOAD = "https://api.powercalc.nl/download";

type FullPowerProfile = PowerProfile & {
  createdAt: string;
  measureDevice: string;
  measureMethod: string;
  measureDescription: string;
  calculationStrategy: string;
  standbyPower: number;
  author?: string;
  plots: PlotLink[];
};

export interface PlotLink {
  url: string;
  colorMode: ColorMode;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ profile }) => {
  const {
    data: fullProfile,
    isLoading,
    isError,
  } = useFetchPowerProfile(profile);

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Error Loading Profile</Alert>;

  const properties = [
    { label: "Manufacturer", value: profile.manufacturer, icon: FactoryIcon },
    {
      label: "Model ID",
      value: profile.modelId,
      icon: PermDeviceInformationIcon,
    },
    { label: "Device type", value: profile.deviceType, icon: TypeSpecimenIcon },
    { label: "Name", value: profile.name, icon: MoreIcon },
    { label: "Created", value: fullProfile?.createdAt, icon: HistoryIcon },
    { label: "Updated", value: profile.updatedAt, icon: HistoryIcon },
    { label: "Author", value: fullProfile?.author, icon: PersonIcon },
    {
      label: "Color modes",
      value: profile.colorModes.join(", "),
      icon: PaletteIcon,
    },
    { label: "Aliases", value: profile.aliases, icon: MediationIcon },
    {
      label: "Measure device",
      value: fullProfile?.measureDevice,
      icon: ElectricMeterIcon,
    },
    {
      label: "Measure method",
      value: fullProfile?.measureMethod,
      icon: ElectricMeterIcon,
    },
    {
      label: "Measure description",
      value: fullProfile?.measureDescription,
      icon: ElectricMeterIcon,
    },
    {
      label: "Standby power",
      value: fullProfile?.standbyPower,
      icon: BoltIcon,
    },
  ];

  const filteredProperties = properties.filter(
    (property) => property.value != null && property.value !== "",
  );
  const chunkedProperties = [];
  for (let i = 0; i < filteredProperties.length; i += 4) {
    chunkedProperties.push(filteredProperties.slice(i, i + 4));
  }

  return (
    <>
      <Grid container spacing={1} sx={{ width: "100%" }}>
        {chunkedProperties.map((chunk, columnIndex) => (
          <Grid item xs={12} sm={6} md={4} key={columnIndex}>
            {chunk.map((property, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>
                    <property.icon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={property.label}
                  secondary={property.value}
                />
              </ListItem>
            ))}
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={1} sx={{ width: "100%" }}>
        {fullProfile?.plots.map((plot, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Plot link={plot}></Plot>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const useFetchPowerProfile = (profile: PowerProfile) => {
  return useQuery<FullPowerProfile>({
    staleTime: 60 * 1000,
    queryKey: [profile.manufacturer, profile.modelId],
    queryFn: async () => {
      const url = `${API_ENDPOINT_PROFILE}/${profile.manufacturer}/${profile.modelId}`;
      const profile_response = await fetch(url);
      const model_json = await profile_response.json();

      const download_response = await fetch(
        `${API_ENDPOINT_DOWNLOAD}/${profile.manufacturer}/${profile.modelId}?includePlots=1`,
      );
      const download_links = await download_response.json();

      const plots: PlotLink[] = download_links
        .filter((link: any): boolean => link.url.endsWith(".png"))
        .map(
          (link: any): PlotLink => ({
            url: link.url,
            colorMode: mapFileNameToColorMode(link.path),
          }),
        );
      return {
        createdAt: model_json["created_at"],
        measureDevice: model_json["measure_device"],
        measureMethod: model_json["measure_method"],
        measureDescription: model_json["measure_description"],
        calculationStrategy: model_json["calculation_strategy"],
        standbyPower: model_json["standby_power"],
        author: model_json["author"],
        plots: plots,
      } as FullPowerProfile;
    },
  });
};

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

export default DetailPanel;
