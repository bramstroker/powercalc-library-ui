import HomeIcon from "@mui/icons-material/Home";
import { Box, Paper, Stack, Tooltip, Typography } from "@mui/material";

import { numberFormat } from "../../utils/formatters";

export type AuthorImpactProps = {
  authorName: string;
  knownDevices: number;
  knownProfileInstallations: number;
};

export const AuthorImpact = ({
  authorName,
  knownDevices,
  knownProfileInstallations,
}: AuthorImpactProps) => (
  <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { sm: "center" }, gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
          Community impact
        </Typography>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
          {numberFormat.format(knownDevices)} known devices
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Powered by profiles contributed by {authorName}.
        </Typography>
      </Box>
      <Tooltip
        title="The same Home Assistant installation may report more than one contributed profile."
        arrow
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            minWidth: { sm: 210 },
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <HomeIcon color="primary" />
            <Box>
              <Typography component="p" variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {numberFormat.format(knownProfileInstallations)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                known profile installations
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Tooltip>
    </Stack>
  </Paper>
);
