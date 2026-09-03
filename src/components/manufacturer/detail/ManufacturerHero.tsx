import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import GitHubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import LanguageIcon from "@mui/icons-material/Language";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { Box, Button, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { ReactCountryFlag } from "react-country-flag";
import { Link as RouterLink } from "react-router";

import type { Manufacturer } from "../../../types/PowerProfile";
import { formatCountryName } from "../../../utils/formatters";
import { InlineHeroStat } from "../../shared/InlineHeroStat";
import { ManufacturerLogo } from "../logo/ManufacturerLogo";

import { ManufacturerAliases } from "./ManufacturerAliases";

export type ManufacturerHeroProps = {
  deviceTypeCount: number;
  introduction: string;
  knownProfileInstallations: number;
  manufacturer: Manufacturer;
  profileCount: number;
};

export const ManufacturerHero = ({
  deviceTypeCount,
  introduction,
  knownProfileInstallations,
  manufacturer,
  profileCount,
}: ManufacturerHeroProps) => (
  <Paper
    component="section"
    elevation={0}
    sx={[
      {
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 3.5 },
        mb: { xs: 3, sm: 4 },
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        backgroundImage:
          "radial-gradient(circle at 90% 0%, rgba(121, 134, 203, 0.22), transparent 42%)",
      },
      (theme) =>
        theme.applyStyles("light", {
          backgroundImage:
            "radial-gradient(circle at 90% 0%, rgba(63, 81, 181, 0.13), transparent 42%)",
        }),
    ]}
  >
    <Stack
      direction={{ xs: "column", md: "row" }}
      sx={{ alignItems: "flex-start", gap: { xs: 2, sm: 2.5 } }}
    >
      <ManufacturerLogo manufacturer={manufacturer} size={64} variant="wide" plate />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontSize: { xs: "1.75rem", sm: "2.5rem" },
            fontWeight: 800,
            lineHeight: 1.1,
            wordBreak: "break-word",
          }}
        >
          {manufacturer.fullName}
        </Typography>
        {manufacturer.country && (
          <Stack
            direction="row"
            sx={{ mt: 0.5, alignItems: "center", gap: 0.75, color: "text.secondary" }}
          >
            <ReactCountryFlag
              countryCode={manufacturer.country}
              svg
              aria-hidden="true"
              style={{ fontSize: "1.1em", borderRadius: 2 }}
            />
            <Typography variant="body2">{formatCountryName(manufacturer.country)}</Typography>
          </Stack>
        )}
        {manufacturer.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: "70ch" }}>
            {manufacturer.description}
          </Typography>
        )}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: manufacturer.description ? 1.5 : 1, maxWidth: "70ch" }}
        >
          {introduction}
        </Typography>
        <ManufacturerAliases aliases={manufacturer.aliases} />
      </Box>

      <Stack
        direction={{ xs: "row", md: "column" }}
        sx={{ width: { xs: "100%", md: "auto" }, gap: 1 }}
      >
        <Button
          variant="contained"
          component={RouterLink}
          to={`/?manufacturer=${encodeURIComponent(manufacturer.fullName)}`}
          sx={{ flex: { xs: 1, md: "initial" } }}
        >
          Browse profiles
        </Button>
        {manufacturer.website && (
          <Button
            variant="outlined"
            startIcon={<LanguageIcon />}
            href={manufacturer.website}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ flex: { xs: 1, md: "initial" } }}
          >
            Brand website
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          href={`https://github.com/bramstroker/homeassistant-powercalc/tree/master/profile_library/${manufacturer.dirName}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flex: { xs: 1, md: "initial" } }}
        >
          Library source
        </Button>
      </Stack>
    </Stack>

    <Stack
      direction="row"
      useFlexGap
      sx={{
        flexWrap: "wrap",
        alignItems: "center",
        columnGap: { xs: 2, sm: 3 },
        rowGap: 1,
        mt: { xs: 2, sm: 2.5 },
        pt: { xs: 2, sm: 2.5 },
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <InlineHeroStat
        icon={<LibraryBooksIcon fontSize="small" />}
        value={profileCount}
        label="Profiles"
      />
      <Tooltip title="The same Home Assistant installation may report more than one profile." arrow>
        <Box>
          <InlineHeroStat
            icon={<HomeIcon fontSize="small" />}
            value={knownProfileInstallations}
            label="Known installs"
          />
        </Box>
      </Tooltip>
      <InlineHeroStat
        icon={<DevicesOtherIcon fontSize="small" />}
        value={deviceTypeCount}
        label="Device types"
      />
    </Stack>
  </Paper>
);
