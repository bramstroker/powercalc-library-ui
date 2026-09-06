import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router";

import { useLibraryPagination } from "../../../hooks/useLibraryPagination";
import type { PowerProfile } from "../../../types/PowerProfile";
import { isRecentlyAdded } from "../../../utils/recency";
import { profilePath } from "../../../utils/urlSlugs.mjs";
import { AliasChips } from "../../profile/AliasChips";
import { DeviceTypeIcon } from "../../profile/DeviceTypeIcon";
import { profileRowId } from "../grid/profileRowId";
import { NewBadge } from "../presentation/NewBadge";

export type LibraryCardListProps = {
  rows: PowerProfile[];
};

/**
 * The phone-sized view of the results. A five-column table needs ~770px, so on a 390px screen the
 * DataGrid could only be read by scrolling sideways; one card per profile fits the width instead.
 */
export const LibraryCardList = ({ rows }: LibraryCardListProps) => {
  const location = useLocation();
  const { page, pageSize, setPagination } = useLibraryPagination(rows.length);
  const start = page * pageSize;
  const visible = rows.slice(start, start + pageSize);

  if (rows.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
        No profiles match the current filters
      </Typography>
    );
  }

  return (
    <Box data-testid="library-card-list">
      <List disablePadding>
        {visible.map((profile) => (
          <Box key={profileRowId(profile)}>
            <ListItemButton
              component={RouterLink}
              to={profilePath(profile.manufacturer.dirName, profile.modelId)}
              state={{ libraryPath: `${location.pathname}${location.search}` }}
              prefetch="intent"
              sx={{ alignItems: "flex-start", gap: 1.5, py: 1.5 }}
            >
              <Box sx={{ width: 24, flexShrink: 0, mt: 0.25 }}>
                <DeviceTypeIcon deviceType={profile.deviceType} />
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {profile.manufacturer.fullName}
                </Typography>
                <Stack
                  direction="row"
                  sx={{ alignItems: "baseline", flexWrap: "wrap", gap: 0.75, minWidth: 0 }}
                >
                  <Typography
                    component="h2"
                    variant="subtitle2"
                    sx={{ fontWeight: 700, overflowWrap: "anywhere", minWidth: 0 }}
                  >
                    {profile.modelId}
                  </Typography>
                  {isRecentlyAdded(profile) && <NewBadge />}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {profile.name}
                </Typography>

                {profile.aliases.length > 0 && (
                  <Box sx={{ mt: 0.75 }}>
                    <AliasChips aliases={profile.aliases} maxVisible={2} />
                  </Box>
                )}
              </Box>

              <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary", mt: 0.5 }} />
            </ListItemButton>
            <Divider component="li" />
          </Box>
        ))}
      </List>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_event, next) => {
          setPagination({ page: next, pageSize });
          window.scrollTo({ top: 0 });
        }}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
        labelRowsPerPage=""
      />
    </Box>
  );
};
