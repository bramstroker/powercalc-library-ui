import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { Box, Tooltip } from "@mui/material";
import { ColumnsPanelTrigger, Toolbar, ToolbarButton } from "@mui/x-data-grid";
import type { ReactNode } from "react";

export type LibraryGridToolbarProps = {
  /** Filled from `slotProps.toolbar` — holds the mobile "Filters" button and the result count. */
  children?: ReactNode;
};

export const LibraryGridToolbar = ({ children }: LibraryGridToolbarProps) => (
  <Toolbar>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>{children}</Box>
    <Tooltip title="Show/hide columns">
      <ColumnsPanelTrigger render={<ToolbarButton aria-label="Show/hide columns" />}>
        <ViewColumnIcon fontSize="small" />
      </ColumnsPanelTrigger>
    </Tooltip>
  </Toolbar>
);
