import { Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

import type { BreadcrumbItem } from "../../seo/breadcrumbs";
import type { Manufacturer as ManufacturerDetails, PowerProfile } from "../../types/PowerProfile";
import { PageBreadcrumbs } from "../shared/PageBreadcrumbs";

import { ManufacturerHero } from "./detail/ManufacturerHero";
import { ManufacturerProfiles } from "./detail/ManufacturerProfiles";
import { useManufacturerViewModel } from "./detail/useManufacturerViewModel";

export type ManufacturerProps = {
  manufacturer?: ManufacturerDetails;
  profiles?: PowerProfile[];
};

export const Manufacturer = ({ manufacturer, profiles = [] }: ManufacturerProps) => {
  const viewModel = useManufacturerViewModel({ manufacturer, profiles });

  if (!manufacturer) {
    return (
      <>
        <Typography variant="h5">Manufacturer not found</Typography>
        <Button component={RouterLink} to="/manufacturers" sx={{ mt: 2 }}>
          Back to all manufacturers
        </Button>
      </>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", to: "/" },
    { label: "Manufacturers", to: "/manufacturers" },
    { label: manufacturer.fullName },
  ];

  return (
    <>
      <PageBreadcrumbs items={breadcrumbItems} includeStructuredData={false} />
      <ManufacturerHero
        deviceTypeCount={viewModel.deviceTypeCounts.length}
        introduction={viewModel.introduction}
        knownProfileInstallations={viewModel.knownProfileInstallations}
        manufacturer={manufacturer}
        profileCount={viewModel.profileCount}
      />
      <ManufacturerProfiles
        deviceType={viewModel.deviceType}
        deviceTypeCounts={viewModel.deviceTypeCounts}
        isFiltered={viewModel.isFiltered}
        onDeviceTypeChange={viewModel.setDeviceType}
        onSearchChange={viewModel.setSearch}
        onSortChange={viewModel.setSort}
        profileCount={viewModel.profileCount}
        profiles={viewModel.visibleProfiles}
        search={viewModel.search}
        showDeviceTypeFilter={viewModel.showDeviceTypeFilter}
        showProfileSearch={viewModel.showProfileSearch}
        sort={viewModel.sort}
      />
    </>
  );
};
