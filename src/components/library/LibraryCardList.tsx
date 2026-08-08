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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { PowerProfile } from "../../types/PowerProfile";
import { AliasChips } from "../AliasChips";

import { DeviceTypeIcon } from "./facetIcons";
import { profileRowId } from "./LibraryDataGrid";

const PAGE_SIZE = 25;

export type LibraryCardListProps = {
  rows: PowerProfile[];
};

/**
 * The phone-sized view of the results. A five-column table needs ~770px, so on a 390px screen the
 * DataGrid could only be read by scrolling sideways; one card per profile fits the width instead.
 */
export const LibraryCardList = ({ rows }: LibraryCardListProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  // Filtering can shrink the list under the current page.
  useEffect(() => {
    setPage(0);
  }, [rows]);

  const start = page * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

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
              onClick={() => {
                void navigate(`/profiles/${profile.manufacturer.dirName}/${profile.modelId}`);
              }}
              sx={{ alignItems: "flex-start", gap: 1.5, py: 1.5 }}
            >
              <Box sx={{ width: 24, flexShrink: 0, mt: 0.25 }}>
                <DeviceTypeIcon deviceType={profile.deviceType} />
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.75, minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {profile.manufacturer.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ·
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {profile.modelId}
                  </Typography>
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
          setPage(next);
          window.scrollTo({ top: 0 });
        }}
        rowsPerPage={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
        labelRowsPerPage=""
      />
    </Box>
  );
};
