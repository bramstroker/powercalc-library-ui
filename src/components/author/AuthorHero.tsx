import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import FactoryIcon from "@mui/icons-material/Factory";
import GitHubIcon from "@mui/icons-material/GitHub";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import { plural } from "../../utils/plural";
import { ContributorTierChip } from "../ContributorTierBadge";
import { GithubAvatar } from "../GithubAvatar";
import { InlineHeroStat } from "../InlineHeroStat";

export type AuthorHeroProps = {
  achievements: string[];
  authorName: string;
  authorRank: { rank: number; total: number } | null;
  contributionCount: number;
  contributorSince: number | null;
  deviceTypeCount: number;
  githubUsername: string;
  hasContributorTier: boolean;
  manufacturerCount: number;
};

export const AuthorHero = ({
  achievements,
  authorName,
  authorRank,
  contributionCount,
  contributorSince,
  deviceTypeCount,
  githubUsername,
  hasContributorTier,
  manufacturerCount,
}: AuthorHeroProps) => (
  <Paper
    component="section"
    elevation={0}
    sx={[
      {
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 3.5 },
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
    <Box
      sx={{
        display: "grid",
        alignItems: "center",
        columnGap: { xs: 2, sm: 2.5 },
        rowGap: { xs: 1.75, sm: 0.75 },
        gridTemplateColumns: {
          xs: "auto minmax(0, 1fr)",
          sm: "auto minmax(0, 1fr) auto",
        },
        gridTemplateAreas: {
          xs: `"avatar identity" "meta meta" "actions actions"`,
          sm: `"avatar identity actions" "avatar meta actions"`,
        },
      }}
    >
      <GithubAvatar
        username={githubUsername}
        name={authorName}
        resolution={192}
        sx={{
          gridArea: "avatar",
          width: { xs: 72, sm: 96 },
          height: { xs: 72, sm: 96 },
          border: 3,
          borderColor: "primary.main",
          boxShadow: 3,
        }}
      />

      <Box sx={{ gridArea: "identity", minWidth: 0 }}>
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
          {authorName}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          @{githubUsername} · Powercalc Library Contributor
        </Typography>
      </Box>

      <Box sx={{ gridArea: "meta", minWidth: 0 }}>
        {contributorSince && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Contributing since {contributorSince}
          </Typography>
        )}
        <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
          <ContributorTierChip profileCount={contributionCount} />
          {achievements.map((achievement) => (
            <Chip key={achievement} size="small" variant="outlined" label={achievement} />
          ))}
          {authorRank && hasContributorTier && (
            <Chip
              size="small"
              variant="outlined"
              label={`#${authorRank.rank} of ${plural(authorRank.total, "contributor")}`}
            />
          )}
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "row", sm: "column" }}
        sx={{ gridArea: "actions", width: { xs: "100%", sm: "auto" }, gap: 1 }}
      >
        <Button
          variant="contained"
          component={RouterLink}
          to={`/?author=${encodeURIComponent(githubUsername)}`}
          sx={{ flex: { xs: 1, sm: "initial" }, whiteSpace: "nowrap" }}
        >
          Open in library
        </Button>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          href={`https://github.com/${githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flex: { xs: 1, sm: "initial" }, whiteSpace: "nowrap" }}
        >
          GitHub
        </Button>
      </Stack>
    </Box>

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
        value={contributionCount}
        label="Profiles"
      />
      <InlineHeroStat
        icon={<FactoryIcon fontSize="small" />}
        value={manufacturerCount}
        label="Manufacturers"
      />
      <InlineHeroStat
        icon={<DevicesOtherIcon fontSize="small" />}
        value={deviceTypeCount}
        label="Device types"
      />
    </Stack>
  </Paper>
);
