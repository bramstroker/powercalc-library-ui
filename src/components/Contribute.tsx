import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";

import { PageBreadcrumbs } from "./PageBreadcrumbs";

const MEASURE_GUIDE_URL = "https://docs.powercalc.nl/contributing/measure/";
const CONTRIBUTING_GUIDE_URL = "https://docs.powercalc.nl/contributing/";
const LIGHT_REQUEST_URL =
  "https://github.com/bramstroker/homeassistant-powercalc/discussions/categories/request-light-models";

type StepProps = {
  icon: ReactNode;
  number: number;
  title: string;
  children: ReactNode;
};

const ContributionStep = ({ icon, number, title, children }: StepProps) => (
  <Box
    component="li"
    sx={{
      display: "grid",
      gridTemplateColumns: "40px minmax(0, 1fr)",
      columnGap: 2,
      listStyle: "none",
    }}
  >
    <Box
      aria-hidden="true"
      sx={{
        width: 40,
        height: 40,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        color: "primary.main",
        bgcolor: "action.hover",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography component="h3" variant="h6" sx={{ fontWeight: 700 }}>
        {number}. {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
        {children}
      </Typography>
    </Box>
  </Box>
);

export const Contribute = () => (
  <>
    <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contribute" }]} />

    <Box sx={{ maxWidth: 840, mb: { xs: 4, sm: 5 } }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
        Contribute or request a device
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7, maxWidth: 760 }}>
        The most useful way to add a missing device is to measure the exact physical model you own.
        Your results become a reusable Powercalc profile for the whole community.
      </Typography>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          href={MEASURE_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<LaunchIcon />}
        >
          Start measuring
        </Button>
        <Button component={RouterLink} to="/" variant="outlined" size="large">
          Check the library first
        </Button>
      </Stack>
    </Box>

    <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          component="section"
          aria-labelledby="contribution-steps-heading"
          variant="outlined"
          sx={{ p: { xs: 2.5, sm: 4 } }}
        >
          <Typography
            id="contribution-steps-heading"
            component="h2"
            variant="h5"
            sx={{ fontWeight: 750 }}
          >
            Measure and contribute a profile
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            The Powercalc measure tool controls the device, reads a compatible power meter and
            prepares the files needed for a contribution.
          </Typography>

          <Stack component="ol" spacing={3} sx={{ p: 0, m: 0 }}>
            <ContributionStep number={1} title="Confirm the identity" icon={<SearchOutlinedIcon />}>
              Search by manufacturer, exact model ID, aliases and barcode. A shared profile needs a
              unique model identifier; generic identifiers can represent different hardware.
            </ContributionStep>
            <ContributionStep number={2} title="Measure the device" icon={<BoltOutlinedIcon />}>
              Use an accurate meter and let readings settle. The guided Home Assistant app is
              recommended on Home Assistant OS; the CLI supports additional setups and meters.
            </ContributionStep>
            <ContributionStep
              number={3}
              title="Review and submit"
              icon={<UploadFileOutlinedIcon />}
            >
              Check the generated model and measurements, then submit them for review through the
              documented pull-request workflow.
            </ContributionStep>
          </Stack>

          <Alert severity="warning" sx={{ mt: 3 }}>
            Measuring mains-powered equipment can be dangerous. Follow the safety guidance and do
            not use equipment you are not qualified to operate.
          </Alert>

          <Button
            href={CONTRIBUTING_GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<LaunchIcon />}
            sx={{ mt: 2 }}
          >
            View all contribution guidance
          </Button>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={3}>
          <Paper
            component="section"
            aria-labelledby="request-heading"
            variant="outlined"
            sx={{ p: { xs: 2.5, sm: 3 } }}
          >
            <ForumOutlinedIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
            <Typography id="request-heading" component="h2" variant="h6" sx={{ fontWeight: 700 }}>
              Cannot measure it yourself?
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              You can ask the community, but a request can only be fulfilled by someone who owns the
              exact same physical model and can measure it. Include the full manufacturer, model ID
              and product name.
            </Typography>
            <Button
              variant="outlined"
              href={LIGHT_REQUEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<LaunchIcon />}
              sx={{ mt: 2 }}
            >
              Request a light profile
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              The dedicated request area currently covers light profiles.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <CheckCircleOutlineIcon color="primary" />
              <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
                Before submitting
              </Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Search the library first. Existing profiles may already list your model as an alias
              under the original manufacturer.
            </Typography>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  </>
);
