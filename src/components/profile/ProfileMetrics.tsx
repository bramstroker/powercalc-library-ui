import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Card, CardContent, Divider, Stack, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import type { Summary } from "../../api/analytics.api";
import type { PowerProfile } from "../../types/PowerProfile";
import { numberFormat } from "../../utils/formatters";
import { SupportPowercalcPrompt } from "../shared/SupportPowercalc";

export const ProfileMetrics = ({
  profile,
  summary,
}: {
  profile: PowerProfile;
  summary: Summary;
}) => {
  const hasReportedUsage = profile.usageStats.installationCount > 0;
  const installationCount = numberFormat.format(profile.usageStats.installationCount);
  const sampledInstallations = numberFormat.format(summary.sampled_installations);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        backgroundImage: "var(--mui-overlays-6)",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Community usage
          </Typography>

          <Typography component="div" variant="subtitle2" sx={{ fontWeight: 700 }}>
            {hasReportedUsage
              ? `${installationCount} opted-in ${profile.usageStats.installationCount === 1 ? "installation" : "installations"}`
              : "No opted-in usage yet"}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {hasReportedUsage
              ? `${profile.usageStats.percentage}% of ${sampledInstallations} reporting installations`
              : `Based on ${sampledInstallations} reporting installations`}
            <Tooltip
              title="These are active installations whose users opted in to analytics."
              arrow
              describeChild
            >
              <Box
                component="span"
                role="img"
                tabIndex={0}
                aria-label="About installation analytics"
                sx={{ display: "inline-flex", ml: 0.5, verticalAlign: "text-bottom" }}
              >
                <InfoOutlinedIcon aria-hidden="true" sx={{ fontSize: 16 }} />
              </Box>
            </Tooltip>
          </Typography>

          <Link
            variant="caption"
            href="https://docs.powercalc.nl/misc/analytics/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ alignSelf: "flex-start", mt: 0.25, fontWeight: 700 }}
          >
            Opt in to analytics
          </Link>

          <Divider sx={{ my: 0.75 }} />
          <SupportPowercalcPrompt />
        </Stack>
      </CardContent>
    </Card>
  );
};
