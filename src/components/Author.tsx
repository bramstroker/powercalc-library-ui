import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import type { BreadcrumbItem } from "../seo/breadcrumbs";
import type { Author as AuthorDetails, PowerProfile } from "../types/PowerProfile";

import { AuthorBreakdowns } from "./author/AuthorBreakdowns";
import { AuthorHero } from "./author/AuthorHero";
import { AuthorImpact } from "./author/AuthorImpact";
import { AuthorProfiles } from "./author/AuthorProfiles";
import { useAuthorViewModel } from "./author/useAuthorViewModel";
import { LazyAuthorContributionsChart } from "./LazyAuthorContributionsChart";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

export type AuthorProps = {
  authorDetails?: AuthorDetails;
  authorProfiles?: PowerProfile[];
  authorRank?: { rank: number; total: number } | null;
};

export const Author = ({ authorDetails, authorProfiles = [], authorRank = null }: AuthorProps) => {
  const author = useAuthorViewModel({ authorDetails, authorProfiles });

  if (!author.githubUsername || !authorDetails) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" component="h1">
          Author not found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          This contributor does not exist in the current Powercalc library.
        </Typography>
        <Button component={RouterLink} to="/contributors" sx={{ mt: 2 }}>
          View contributors
        </Button>
      </Paper>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", to: "/" },
    { label: "Contributors", to: "/contributors" },
    { label: author.displayName },
  ];
  const authorName = authorDetails.name || author.githubUsername;

  return (
    <>
      <PageBreadcrumbs items={breadcrumbItems} includeStructuredData={false} />
      <Stack sx={{ gap: { xs: 2, sm: 3 } }}>
        <AuthorHero
          achievements={author.achievements}
          authorName={authorName}
          authorRank={authorRank}
          contributionCount={author.contributionCount}
          contributorSince={author.contributorSince}
          deviceTypeCount={author.deviceTypes.length}
          githubUsername={author.githubUsername}
          hasContributorTier={author.hasContributorTier}
          manufacturerCount={author.manufacturers.length}
        />
        <AuthorImpact
          authorName={authorName}
          knownDevices={author.knownDevices}
          knownProfileInstallations={author.knownProfileInstallations}
        />
        {author.showBreakdowns && (
          <AuthorBreakdowns
            contributionCount={author.contributionCount}
            deviceTypes={author.deviceTypes}
            githubUsername={author.githubUsername}
            manufacturers={author.manufacturers}
          />
        )}
        <LazyAuthorContributionsChart profiles={authorProfiles} />
        <AuthorProfiles
          contributionCount={author.contributionCount}
          manufacturerCount={author.manufacturers.length}
          onSortChange={author.setProfileSort}
          profileSort={author.profileSort}
          profiles={author.sortedProfiles}
        />
      </Stack>
    </>
  );
};
