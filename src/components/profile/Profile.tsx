import BedtimeIcon from "@mui/icons-material/Bedtime";
import BoltIcon from "@mui/icons-material/Bolt";
import GithubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import TypeSpecimenIcon from "@mui/icons-material/TypeSpecimen";
import { Button, Stack, Tab, Tabs } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { lazy, Suspense, type ElementType, type ReactNode, type SyntheticEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import type { Summary } from "../../api/analytics.api";
import { useUrlSearchParams } from "../../hooks/useUrlSearchParams";
import type { BreadcrumbItem } from "../../seo/breadcrumbs";
import { CalculationStrategy } from "../../types/CalculationStrategy";
import type { PowerProfile } from "../../types/PowerProfile";
import { humanizeIdentifier } from "../../utils/profilePresentation";
import { manufacturerPath } from "../../utils/urlSlugs.mjs";
import { ManufacturerLogo } from "../manufacturer/logo/ManufacturerLogo";
import { PageBreadcrumbs } from "../shared/PageBreadcrumbs";

import { getDeviceTypeIcon } from "./DeviceTypeIcon";
import profileStyles from "./Profile.css?inline";
import { ProfileAttributesTab } from "./ProfileAttributesTab";
const ProfileJsonTab = lazy(() =>
  import("./ProfileDetailTabs").then((module) => ({ default: module.ProfileJsonTab })),
);
const ProfilePlotsTab = lazy(() =>
  import("./ProfileDetailTabs").then((module) => ({ default: module.ProfilePlotsTab })),
);
const ProfileSubProfilesTab = lazy(() =>
  import("./ProfileDetailTabs").then((module) => ({ default: module.ProfileSubProfilesTab })),
);
import { ProfileMetrics } from "./ProfileMetrics";
import { ProfileSetup } from "./ProfileSetup";

type ProfileTab = {
  key: string;
  label: string;
  content: ReactNode;
};

const profileTabs = (profile: PowerProfile): ProfileTab[] => [
  {
    key: "attributes",
    label: "Info",
    content: <ProfileAttributesTab profile={profile} />,
  },
  { key: "json", label: "JSON", content: <ProfileJsonTab profile={profile} /> },
  ...(profile.subProfileCount > 0
    ? [
        {
          key: "sub-profiles",
          label: "Sub Profiles",
          content: <ProfileSubProfilesTab profile={profile} />,
        },
      ]
    : []),
  ...([CalculationStrategy.LUT, CalculationStrategy.LINEAR, CalculationStrategy.COMPOSITE].includes(
    profile.calculationStrategy,
  )
    ? [
        {
          key: "graphs",
          label: "Graphs",
          content: <ProfilePlotsTab profile={profile} />,
        },
      ]
    : []),
];

const tabAccessibilityProps = (index: number) => ({
  id: `simple-tab-${index}`,
  "aria-controls": `simple-tabpanel-${index}`,
});

const ProfileTabPanel = ({
  children,
  index,
  selectedIndex,
}: {
  children: ReactNode;
  index: number;
  selectedIndex: number;
}) => (
  <div
    role="tabpanel"
    hidden={selectedIndex !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
  >
    {selectedIndex === index && <Box sx={{ px: { xs: 0, sm: 3 }, py: 3 }}>{children}</Box>}
  </div>
);

const HeadlineFact = ({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  icon: ElementType;
  note?: string;
}) => (
  <div className="profile-fact">
    <Icon className="profile-factIcon" />
    <div className="profile-factContent">
      <span className="profile-factCaption">{label}</span>
      <div className="profile-factValue">{value}</div>
      {note && <span className="profile-factCaption">{note}</span>}
    </div>
  </div>
);

export const Profile = ({ profile, summary }: { profile: PowerProfile; summary: Summary }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const tabs = profileTabs(profile);
  const libraryPath =
    typeof location.state?.libraryPath === "string" &&
    location.state.libraryPath.startsWith("/") &&
    !location.state.libraryPath.startsWith("//")
      ? location.state.libraryPath
      : "/";

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", to: "/" },
    { label: "Manufacturers", to: "/manufacturers" },
    {
      label: profile.manufacturer.fullName,
      to: manufacturerPath(profile.manufacturer.dirName),
    },
    { label: profile.modelId },
  ];

  /** Unknown or inapplicable tab keys fall back to Info. */
  const selectedTabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === searchParams.get("tab")),
  );

  const handleTabChange = (_event: SyntheticEvent, newIndex: number) => {
    updateSearchParams({ tab: newIndex === 0 ? null : tabs[newIndex].key });
  };

  return (
    <>
      {/* Keep these small, static rules in the HTML: an external sheet delays the first paint. */}
      <style>{profileStyles}</style>
      <PageBreadcrumbs items={breadcrumbItems} includeStructuredData={false} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2, gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => void navigate(libraryPath)}
              startIcon={<HomeIcon />}
            >
              {libraryPath === "/" ? "Back to library" : "Back to results"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              href={`https://github.com/bramstroker/homeassistant-powercalc/tree/master/profile_library/${profile.manufacturer.dirName}/${profile.modelId}`}
              startIcon={<GithubIcon />}
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </Button>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", minWidth: 0 }}>
            <ManufacturerLogo manufacturer={profile.manufacturer} size={44} plate />

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" component="h1" sx={{ overflowWrap: "anywhere" }}>
                <Link
                  component={RouterLink}
                  to={manufacturerPath(profile.manufacturer.dirName)}
                  color="inherit"
                  underline="hover"
                >
                  {profile.manufacturer.fullName}
                </Link>{" "}
                {profile.modelId}
              </Typography>
              {profile.name && (
                <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
                  {profile.name}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 2 }}>
            <HeadlineFact
              label="Device type"
              value={humanizeIdentifier(profile.deviceType)}
              icon={getDeviceTypeIcon(profile.deviceType) ?? TypeSpecimenIcon}
            />
            {profile.maxPower != null && (
              <HeadlineFact label="Max power" value={`${profile.maxPower} W`} icon={BoltIcon} />
            )}
            {profile.standbyPower != null && (
              <HeadlineFact
                label="Standby power"
                value={`${profile.standbyPower} W`}
                icon={BedtimeIcon}
                note={profile.standbyPowerEstimated ? "estimated, not measured" : undefined}
              />
            )}
            {profile.subProfileCount > 0 && (
              <HeadlineFact
                label="Sub profiles"
                value={String(profile.subProfileCount)}
                icon={LayersIcon}
              />
            )}
          </Stack>

          {profile.onlySelfUsage && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Device's own consumption only; excludes connected appliances.
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            <ProfileSetup profile={profile} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <ProfileMetrics profile={profile} summary={summary} />
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.key} label={tab.label} {...tabAccessibilityProps(index)} />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <ProfileTabPanel key={tab.key} selectedIndex={selectedTabIndex} index={index}>
          {/* Keep the initial attributes inline in prerendered HTML. Only lazy detail tabs need
              a Suspense boundary; wrapping attributes emits a streamed fallback and hidden HTML. */}
          {tab.key === "attributes" ? (
            tab.content
          ) : (
            <Suspense fallback={<Typography role="status">Loading profile details…</Typography>}>
              {tab.content}
            </Suspense>
          )}
        </ProfileTabPanel>
      ))}
    </>
  );
};
