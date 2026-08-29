import type { SvgIconComponent } from "@mui/icons-material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, ButtonBase, Collapse, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useId } from "react";

export type FacetSectionProps = {
  title: string;
  icon?: SvgIconComponent;
  /**
   * Sits in the header, so it survives collapsing: the selected count, or the span a slider is
   * currently set to. Collapsing a section should hide its controls, not what it is doing.
   */
  summary?: ReactNode;
  expanded: boolean;
  onToggleExpanded: () => void;
  children: ReactNode;
  testId?: string;
};

/**
 * One collapsible block of the filter panel. Every kind of filter uses it — checkboxes, the
 * author picker, the sliders, the date field — so they collapse alike and the panel can fold
 * them all at once.
 */
export const FacetSection = ({
  title,
  icon: Icon,
  summary,
  expanded,
  onToggleExpanded,
  children,
  testId,
}: FacetSectionProps) => {
  const contentId = useId();

  return (
    // The rule lives on the section rather than between sections, so one that renders nothing
    // does not leave a stray line behind.
    <Box data-testid={testId} sx={{ pb: 1, mb: 1, borderBottom: 1, borderColor: "divider" }}>
      {/* A real button, so the section can be collapsed from the keyboard and is announced as a
          control rather than as plain text. */}
      <Stack
        component={ButtonBase}
        direction="row"
        aria-expanded={expanded}
        aria-controls={contentId}
        sx={{
          width: "100%",
          textAlign: "left",
          alignItems: "center",
          gap: 1,
          py: 0.75,
          borderRadius: 1,
          "&:hover": { color: "primary.main" },
        }}
        onClick={onToggleExpanded}
      >
        {Icon && <Icon fontSize="small" sx={{ color: "text.secondary" }} />}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1, textAlign: "left" }}>
          {title}
        </Typography>
        {summary}
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Stack>

      <Collapse id={contentId} in={expanded} unmountOnExit>
        {children}
      </Collapse>
    </Box>
  );
};
