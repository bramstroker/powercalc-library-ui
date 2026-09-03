import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
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
    label: "Library",
    items: [
      { label: "Browse profiles", path: "/", icon: LibraryBooksOutlinedIcon },
      { label: "Manufacturers", path: "/manufacturers", icon: FactoryOutlinedIcon },
      { label: "Contributors", path: "/contributors", icon: GroupOutlinedIcon },
      { label: "Contribute", path: "/contribute", icon: LibraryAddOutlinedIcon },
      { label: "What's new", path: "/whats-new", icon: NewReleasesOutlinedIcon },
    ],
  },
  {
    label: "Statistics",
    description: "Library rankings and contribution trends.",
    items: [{ label: "View statistics", path: "/statistics", icon: BarChartIcon }],
  },
  {
    label: "Usage analytics",
    description: "Opt-in installation and profile usage data.",
    items: [{ label: "View analytics", path: "/analytics", icon: AnalyticsOutlinedIcon }],
  },
];
