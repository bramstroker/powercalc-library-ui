import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import type { ElementType } from "react";

export type ExploreNavigationItem = {
  label: string;
  path: string;
  icon: ElementType;
};

export type ExploreNavigationSection = {
  label: string;
  description?: string;
  items: ExploreNavigationItem[];
};

export const EXPLORE_NAVIGATION: ExploreNavigationSection[] = [
  {
    label: "Find a device",
    items: [
      { label: "Browse profiles", path: "/", icon: LibraryBooksOutlinedIcon },
      { label: "Manufacturers", path: "/manufacturers", icon: FactoryOutlinedIcon },
      { label: "Device types", path: "/device-types", icon: CategoryOutlinedIcon },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Measurement quality", path: "/measurement-quality", icon: VerifiedOutlinedIcon },
      { label: "About", path: "/about", icon: InfoOutlinedIcon },
    ],
  },
  {
    label: "Community & data",
    items: [
      { label: "Contributors", path: "/contributors", icon: GroupOutlinedIcon },
      { label: "Contribute", path: "/contribute", icon: LibraryAddOutlinedIcon },
      { label: "What's new", path: "/whats-new", icon: NewReleasesOutlinedIcon },
      { label: "Library statistics", path: "/statistics", icon: BarChartIcon },
      { label: "Usage analytics", path: "/analytics", icon: AnalyticsOutlinedIcon },
    ],
  },
];
