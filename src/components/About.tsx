import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import { Box, Button, Link, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";

import { API_ENDPOINTS } from "../config/api";
import { DATASET_LICENSE_URL, POWERCALC_PROJECT_URL } from "../seo/dataset";

import { PageBreadcrumbs } from "./PageBreadcrumbs";

const PROFILE_LIBRARY_SOURCE_URL = `${POWERCALC_PROJECT_URL}/tree/master/profile_library`;
const ANALYTICS_DOCUMENTATION_URL = "https://docs.powercalc.nl/misc/analytics/";
const VIEWER_SOURCE_URL = "https://github.com/bramstroker/powercalc-library-ui";

type InformationCardProps = {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

const InformationCard = ({ id, icon, title, children }: InformationCardProps) => (
  <Paper
    component="section"
    aria-labelledby={id}
    variant="outlined"
    sx={{ p: { xs: 2.5, sm: 3 }, height: "100%" }}
  >
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1.5 }}>
      <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      <Typography id={id} component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Paper>
);

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </Link>
);

export const About = () => (
  <>
    <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />

    <Box sx={{ maxWidth: 880, mb: { xs: 4, sm: 5 } }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
        About the profile data
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7, maxWidth: 800 }}>
        The Powercalc profile library is a public, community-maintained catalog of measured device
        power data. Powercalc uses these profiles to estimate consumption for devices that do not
        report their own power use.
      </Typography>
    </Box>

    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <InformationCard
          id="maintainers-heading"
          title="Who maintains it"
          icon={<GroupsOutlinedIcon />}
        >
          <Typography color="text.secondary">
            Community members measure devices and submit their results publicly. Powercalc
            maintainers review and integrate those contributions, while this site makes the library
            easier to search and inspect.
          </Typography>
          <Button component={RouterLink} to="/contributors" variant="text" sx={{ mt: 1.5 }}>
            Meet the contributors
          </Button>
        </InformationCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <InformationCard
          id="provenance-heading"
          title="Data provenance"
          icon={<SourceOutlinedIcon />}
        >
          <Typography color="text.secondary">
            The source of truth is the public <code>profile_library</code> directory. Each model has
            a <code>model.json</code> file describing its identity, measurement method and
            calculation strategy, with measured CSV data where the strategy needs it.
          </Typography>
          <Button
            href={PROFILE_LIBRARY_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<LaunchIcon />}
            sx={{ mt: 1.5 }}
          >
            Browse the source data
          </Button>
        </InformationCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <InformationCard
          id="refresh-heading"
          title="Refresh frequency"
          icon={<UpdateOutlinedIcon />}
        >
          <Typography color="text.secondary">
            In production, the site refreshes its prerendered library and analytics content every
            hour. Accepted changes become visible after the source data and public API have updated
            and the next refresh has completed.
          </Typography>
        </InformationCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <InformationCard
          id="privacy-heading"
          title="Analytics and privacy"
          icon={<PrivacyTipOutlinedIcon />}
        >
          <Typography color="text.secondary">
            Powercalc analytics is optional, aggregated and disabled by default. It can report
            counts such as profile, device-type and strategy usage, but not device names, Home
            Assistant credentials, power readings, IP addresses or precise locations.
          </Typography>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", mt: 1.5 }}>
            <Link component={RouterLink} to="/analytics">
              View aggregated insights
            </Link>
            <ExternalLink href={ANALYTICS_DOCUMENTATION_URL}>Read the privacy details</ExternalLink>
          </Stack>
        </InformationCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <InformationCard id="api-heading" title="API and source" icon={<CodeOutlinedIcon />}>
          <Typography color="text.secondary">
            The viewer reads the public Powercalc API. The complete library is also available as raw
            JSON, and both the Powercalc project and this viewer are developed in public.
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1.5, alignItems: "flex-start" }}>
            <ExternalLink href={API_ENDPOINTS.LIBRARY}>Download the full library JSON</ExternalLink>
            <ExternalLink href={POWERCALC_PROJECT_URL}>View the Powercalc source</ExternalLink>
            <ExternalLink href={VIEWER_SOURCE_URL}>View this site’s source</ExternalLink>
          </Stack>
        </InformationCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <InformationCard id="license-heading" title="License" icon={<PolicyOutlinedIcon />}>
          <Typography color="text.secondary">
            The Powercalc project and profile dataset are available under the permissive MIT
            License. You may use, copy, modify and redistribute the data subject to the license
            notice and conditions.
          </Typography>
          <Button
            href={DATASET_LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<LaunchIcon />}
            sx={{ mt: 1.5 }}
          >
            Read the MIT License
          </Button>
        </InformationCard>
      </Grid>
    </Grid>
  </>
);
