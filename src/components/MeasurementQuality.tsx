import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import LaunchIcon from "@mui/icons-material/Launch";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  List,
  ListItem,
  ListItemIcon,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";

import { QUALITY_BAND_COLORS, QUALITY_BANDS } from "../utils/lutQuality";

import { PageBreadcrumbs } from "./PageBreadcrumbs";

const MEASURE_GUIDE_URL = "https://docs.powercalc.nl/contributing/measure/";
const METER_SETUP_URL = "https://docs.powercalc.nl/contributing/measure/setup/";
const LOW_POWER_GUIDE_URL =
  "https://docs.powercalc.nl/contributing/measure/low-power-measurements/";

type QualitySectionProps = {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

const QualitySection = ({ id, icon, title, children }: QualitySectionProps) => (
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

const qualityRange = (index: number) => {
  const band = QUALITY_BANDS[index];
  const previous = QUALITY_BANDS[index - 1];
  return previous ? band.min + "–<" + previous.min : band.min + "–100";
};

const CHECKS = [
  "The manufacturer and exact model ID match your device",
  "The measurement device, method and firmware are recorded",
  "The measured or nominal voltage fits your region",
  "The calculation strategy and available power range suit your use case",
  "Any value marked estimated is acceptable for your needs",
] as const;

export const MeasurementQuality = () => (
  <>
    <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "Measurement quality" }]} />

    <Box sx={{ maxWidth: 880, mb: { xs: 4, sm: 5 } }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
        Measurement quality
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7, maxWidth: 800 }}>
        Powercalc profiles are built from community measurements. This page explains how those
        measurements become a profile, what the quality indicators mean, and which limitations to
        consider before using one.
      </Typography>
    </Box>

    <Alert severity="info" sx={{ mb: 3, maxWidth: 1100 }}>
      A profile estimates a device&apos;s power use from its state. It is not a replacement for a
      calibrated meter when billing-grade or safety-critical accuracy is required.
    </Alert>

    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <QualitySection id="methodology-heading" title="Methodology" icon={<ScienceOutlinedIcon />}>
          <Typography color="text.secondary">
            Contributors use the Powercalc measure tool to control a physical device, wait for each
            state to settle and sample a compatible power meter. The resulting readings are stored
            as a fixed value, a linear model or a lookup table (LUT), depending on how the device
            behaves.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            Profiles can record the meter, method, firmware, settings and measurement notes. These
            details help you judge provenance; their absence does not prove that a measurement is
            poor, but leaves less information to verify it.
          </Typography>
          <Button
            href={MEASURE_GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<LaunchIcon />}
            sx={{ mt: 1.5 }}
          >
            Read the measurement guide
          </Button>
        </QualitySection>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <QualitySection
          id="quality-bands-heading"
          title="LUT quality bands"
          icon={<AutoGraphIcon />}
        >
          <Typography color="text.secondary">
            LUT profiles receive a 0–100 smoothness score. The profile score is the lowest score
            across its LUT files, including subprofiles. This site groups that number into these
            bands:
          </Typography>
          <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1, mt: 2 }}>
            {QUALITY_BANDS.map((band, index) => (
              <Chip
                key={band.label}
                variant="outlined"
                color={QUALITY_BAND_COLORS[band.label]}
                label={band.label + ": " + qualityRange(index)}
              />
            ))}
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            The score describes how smooth and consistent the measured curve is. It does{" "}
            <strong>not</strong> validate meter accuracy. Fixed, linear and playbook profiles have
            no LUT curve and therefore no score.
          </Typography>
        </QualitySection>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <QualitySection id="meters-heading" title="Supported meters" icon={<ElectricMeterIcon />}>
          <Typography color="text.secondary">
            The measure tool can read a Home Assistant power sensor that reports watts. Direct and
            alternative inputs currently include Shelly, Tasmota, Tuya, TP-Link Kasa, myStrom,
            manual entry and OCR; availability differs between the guided Home Assistant app and the
            CLI.
          </Typography>
          <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
            Software support is not an accuracy certification. Resolution, update frequency and
            low-load accuracy still depend on the particular meter and setup.
          </Alert>
          <Button
            href={METER_SETUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<LaunchIcon />}
            sx={{ mt: 1.5 }}
          >
            Check meter setup options
          </Button>
        </QualitySection>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <QualitySection
          id="voltage-heading"
          title="Voltage caveats"
          icon={<ElectricalServicesIcon />}
        >
          <Typography color="text.secondary">
            The same device can draw different power at different mains voltages. When available, a
            profile shows the observed voltage range and a nominal mains voltage. Compare these
            values with your local supply, especially when reusing a profile measured in another
            region.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            A missing voltage means it was not recorded—not that the result is universal. The 120 V
            and 230 V library filters are broad context bands, not guarantees of compatibility.
            Dummy-load calibration for very low power also requires voltage readings.
          </Typography>
          <Button
            href={LOW_POWER_GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<LaunchIcon />}
            sx={{ mt: 1.5 }}
          >
            Read the low-power guidance
          </Button>
        </QualitySection>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <QualitySection id="estimated-heading" title="Estimated values" icon={<BoltOutlinedIcon />}>
          <Typography color="text.secondary">
            Powercalc ultimately estimates consumption from device state, but most profile models
            are based on real measurements. When a profile explicitly marks standby power as an
            assumption, the profile page labels it <strong>estimated, not measured</strong>.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            Very small loads are difficult for consumer meters to resolve. A documented estimate can
            be more honest than a rounded zero, but a direct measurement with suitable hardware is
            preferred. No estimate label should be read as a precision guarantee for every other
            value.
          </Typography>
        </QualitySection>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <QualitySection
          id="assessment-heading"
          title="Before using a profile"
          icon={<CheckCircleOutlineIcon />}
        >
          <List dense disablePadding aria-label="Profile quality checklist">
            {CHECKS.map((check) => (
              <ListItem key={check} disableGutters sx={{ alignItems: "flex-start" }}>
                <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                  <CheckCircleOutlineIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <Typography color="text.secondary">{check}</Typography>
              </ListItem>
            ))}
          </List>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", mt: 1.5 }}>
            <Link component={RouterLink} to="/">
              Browse profiles
            </Link>
            <Link component={RouterLink} to="/contribute">
              Improve the library
            </Link>
          </Stack>
        </QualitySection>
      </Grid>
    </Grid>
  </>
);
