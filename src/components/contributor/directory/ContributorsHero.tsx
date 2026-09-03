import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link as RouterLink } from "react-router";

import { plural } from "../../../utils/plural";

export const ContributorsHero = ({
  contributorCount,
  contributedProfileCount,
}: {
  contributorCount: number;
  contributedProfileCount: number;
}) => (
  <Paper
    component="section"
    elevation={0}
    sx={{
      p: { xs: 2, sm: 4 },
      mb: { xs: 3, sm: 4 },
      border: 1,
      borderColor: "divider",
      background: (theme) =>
        `linear-gradient(135deg, ${theme.palette.action.hover}, transparent 70%)`,
    }}
  >
    <Grid container spacing={3} sx={{ alignItems: "center" }}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 800, fontSize: { xs: "2.25rem", sm: "3rem" } }}
        >
          Contributors
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
          Powercalc grows through community measurements. Meet the people expanding the device
          library and see who has contributed recently.
        </Typography>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", mt: 3 }}>
          <Button
            component={RouterLink}
            to="/contribute"
            variant="contained"
            startIcon={<LibraryAddOutlinedIcon />}
          >
            Contribute a profile
          </Button>
          <Button component={RouterLink} to="/statistics/top-contributors" variant="outlined">
            View top contributors
          </Button>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip icon={<GroupOutlinedIcon />} label={plural(contributorCount, "contributor")} />
          <Chip
            icon={<LibraryAddOutlinedIcon />}
            label={plural(contributedProfileCount, "profile")}
          />
        </Stack>
      </Grid>
    </Grid>
  </Paper>
);
