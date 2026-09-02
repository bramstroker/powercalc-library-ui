import CategoryIcon from "@mui/icons-material/Category";
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link as RouterLink } from "react-router";

import type { ProfileCategoryConfig } from "../config/profileCategories";
import { SITE_URL } from "../config/site";
import { useLibrary } from "../context/LibraryContext";
import { breadcrumbStructuredData } from "../seo/breadcrumbs";
import { MAX_ITEM_LIST_ENTRIES, type StructuredData as StructuredDataNode } from "../seo/meta";
import { StructuredData } from "../seo/StructuredData";

import { getDeviceTypeIcon } from "./library/facetIcons";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

type CategorySummary = { value: string; label: string; profileCount: number; path: string };

const numberFormat = new Intl.NumberFormat("en-US");

export const ProfileCategoryIndex = ({ config }: { config: ProfileCategoryConfig }) => {
  const { powerProfiles } = useLibrary();
  const counts = new Map<string, number>();

  for (const profile of powerProfiles) {
    for (const value of config.values(profile)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  const categories: CategorySummary[] = [...counts.entries()]
    .map(([value, profileCount]) => ({
      value,
      label: config.label(value),
      profileCount,
      path: config.path(value),
    }))
    .sort((a, b) => b.profileCount - a.profileCount || a.label.localeCompare(b.label));

  const graph: StructuredDataNode[] = [
    breadcrumbStructuredData([{ label: "Home", to: "/" }, { label: config.breadcrumbLabel }]),
    {
      "@type": "CollectionPage",
      name: config.indexTitle,
      description: config.indexDescription,
      url: `${SITE_URL}${config.indexPath}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: categories.length,
        itemListElement: categories.slice(0, MAX_ITEM_LIST_ENTRIES).map((category, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: category.label,
          url: `${SITE_URL}${category.path}`,
        })),
      },
    },
  ];

  return (
    <>
      <StructuredData graph={graph} />
      <PageBreadcrumbs
        items={[{ label: "Home", to: "/" }, { label: config.breadcrumbLabel }]}
        includeStructuredData={false}
      />

      <Box sx={{ mb: 3, maxWidth: "72ch" }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }} gutterBottom>
          {config.indexTitle}
        </Typography>
        <Typography color="text.secondary">{config.indexDescription}</Typography>
      </Box>

      <Grid container spacing={2} data-testid="profile-category-list">
        {categories.map((category) => {
          const DeviceTypeIcon = getDeviceTypeIcon(category.value) ?? CategoryIcon;
          return (
            <Grid key={category.value} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  component={RouterLink}
                  to={category.path}
                  prefetch="intent"
                  sx={{ height: "100%" }}
                >
                  <CardContent>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
                      <DeviceTypeIcon color="primary" aria-hidden="true" />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
                          {category.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {numberFormat.format(category.profileCount)}{" "}
                          {category.profileCount === 1 ? "profile" : "profiles"}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
