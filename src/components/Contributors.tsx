import { useRef } from "react";

import { SITE_URL } from "../config/site";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import { MAX_ITEM_LIST_ENTRIES, type StructuredData as StructuredDataNode } from "../seo/meta";
import { StructuredData } from "../seo/StructuredData";
import { authorPath } from "../utils/urlSlugs.mjs";

import { ContributorActivity } from "./contributors/ContributorActivity";
import { ContributorDirectory } from "./contributors/ContributorDirectory";
import { ContributorsHero } from "./contributors/ContributorsHero";
import {
  contributorDisplayName,
  useContributorsViewModel,
} from "./contributors/useContributorsViewModel";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

export const Contributors = ({ now = new Date() }: { now?: Date }) => {
  const directoryRef = useRef<HTMLDivElement>(null);
  const viewModel = useContributorsViewModel(now);

  const structuredData: StructuredDataNode[] = [
    breadcrumbStructuredData([{ label: "Home", to: "/" }, { label: "Contributors" }]),
    {
      "@type": "CollectionPage",
      name: "Powercalc contributors",
      description:
        "The community members who contribute measured device profiles to the Powercalc library.",
      url: `${SITE_URL}/contributors`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: viewModel.contributorSummaries.length,
        itemListElement: viewModel.contributorSummaries
          .slice()
          .sort((a, b) => contributorDisplayName(a).localeCompare(contributorDisplayName(b)))
          .slice(0, MAX_ITEM_LIST_ENTRIES)
          .map((summary, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: contributorDisplayName(summary),
            url: `${SITE_URL}${authorPath(summary.author.githubUsername)}`,
          })),
      },
    },
  ];

  const showActiveContributors = () => {
    viewModel.showActiveContributors();
    // Optional call: jsdom and older engines do not implement it.
    directoryRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <StructuredData graph={structuredData} />
      <PageBreadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Contributors" }]}
        includeStructuredData={false}
      />

      <ContributorsHero
        contributorCount={viewModel.contributorSummaries.length}
        contributedProfileCount={viewModel.contributedProfileCount}
      />
      <ContributorActivity
        recentProfileCount={viewModel.recentProfileCount}
        recentContributorCount={viewModel.recentContributorCount}
        recentContributors={viewModel.recentContributors}
        onShowActiveContributors={showActiveContributors}
      />
      <ContributorDirectory {...viewModel} directoryRef={directoryRef} />
    </>
  );
};
