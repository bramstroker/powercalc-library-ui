import AddCircleIcon from "@mui/icons-material/AddCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import UpdateIcon from "@mui/icons-material/Update";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";

import {
  fetchLibraryChanges,
  SUPPORTED_LIBRARY_CHANGE_TYPES,
  type LibraryChange,
  type LibraryChangesPage,
  type LibraryProfileChange,
  type SupportedLibraryChangeType,
} from "../../../api/library.api";
import { useLibrary } from "../../../context/LibraryContext";
import type { PowerProfile } from "../../../types/PowerProfile";
import { formatDateUtc } from "../../../utils/dateFormat";
import { humanizeIdentifier } from "../../../utils/profilePresentation";
import { authorPath, profilePath, slugifyPathSegment } from "../../../utils/urlSlugs.mjs";
import { DeviceTypeIcon } from "../../profile/DeviceTypeIcon";
import { PageBreadcrumbs } from "../../shared/PageBreadcrumbs";

interface WhatsNewProps {
  initialPage: LibraryChangesPage;
}

type VisibleProfileChange = LibraryProfileChange & { type: SupportedLibraryChangeType };
type VisibleLibraryChange = Omit<LibraryChange, "changes"> & { changes: VisibleProfileChange[] };

const isSupportedChange = (change: LibraryProfileChange): change is VisibleProfileChange =>
  SUPPORTED_LIBRARY_CHANGE_TYPES.includes(change.type as SupportedLibraryChangeType);

const visibleChanges = (pages: LibraryChangesPage[]): VisibleLibraryChange[] =>
  pages.flatMap((page) =>
    page.items.flatMap((item) => {
      const changes = item.changes.filter(isSupportedChange);
      return changes.length > 0 ? [{ ...item, changes }] : [];
    }),
  );

const dayLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "Date unknown" : formatDateUtc(date);
};

const groupByDay = (changes: VisibleLibraryChange[]) => {
  const groups = new Map<string, VisibleLibraryChange[]>();
  for (const change of changes) {
    const day = dayLabel(change.occurred_at);
    groups.set(day, [...(groups.get(day) ?? []), change]);
  }
  return [...groups.entries()];
};

const changePresentation = (type: SupportedLibraryChangeType) =>
  type === "profile_added"
    ? { label: "New profile", color: "success" as const, icon: <AddCircleIcon /> }
    : { label: "Measurements updated", color: "primary" as const, icon: <UpdateIcon /> };

const ContributorLinks = ({ change }: { change: VisibleLibraryChange }) => {
  if (change.authors.length === 0) {
    return <Box component="span">a Powercalc contributor</Box>;
  }

  return change.authors.map((author, index) => (
    <Box component="span" key={author.github ?? `${author.name}-${index}`}>
      {index > 0 && ", "}
      {author.github ? (
        <Link
          component={RouterLink}
          to={authorPath(author.github)}
          prefetch="intent"
          underline="hover"
          sx={{ fontWeight: 700 }}
        >
          {author.name || author.github}
        </Link>
      ) : (
        <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
          {author.name}
        </Box>
      )}
    </Box>
  ));
};

const ProfileChange = ({
  change,
  currentProfiles,
}: {
  change: VisibleProfileChange;
  currentProfiles: Map<string, PowerProfile>;
}) => {
  const presentation = changePresentation(change.type);
  const { profile } = change;
  const currentProfile = currentProfiles.get(
    `${slugifyPathSegment(profile.manufacturer.dir_name)}/${slugifyPathSegment(profile.id)}`,
  );
  const manufacturerDirName = currentProfile?.manufacturer.dirName ?? profile.manufacturer.dir_name;
  const manufacturerFullName =
    currentProfile?.manufacturer.fullName ?? profile.manufacturer.full_name;
  const modelId = currentProfile?.modelId ?? profile.id;
  const name = currentProfile?.name ?? profile.name;
  const deviceType = currentProfile?.deviceType ?? profile.device_type;

  return (
    <Box sx={{ alignItems: "flex-start", display: "flex", gap: 1.5, py: 1.25 }}>
      <Box
        sx={{
          color: change.type === "profile_added" ? "success.main" : "primary.main",
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {deviceType && <DeviceTypeIcon deviceType={deviceType} />}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Link
            component={RouterLink}
            to={profilePath(manufacturerDirName, modelId)}
            prefetch="intent"
            underline="hover"
            sx={{ color: "text.primary", fontWeight: 700 }}
          >
            {manufacturerFullName} {modelId}
          </Link>
          <Chip
            size="small"
            variant="outlined"
            color={presentation.color}
            icon={presentation.icon}
            label={presentation.label}
          />
        </Stack>
        {(name || deviceType) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {[name, deviceType && humanizeIdentifier(deviceType)].filter(Boolean).join(" · ")}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const PullRequestChange = ({
  change,
  currentProfiles,
}: {
  change: VisibleLibraryChange;
  currentProfiles: Map<string, PowerProfile>;
}) => (
  <Box component="article" sx={{ px: 2, py: 1.75 }} data-testid="whats-new-pull-request">
    <Stack divider={<Divider flexItem />}>
      {change.changes.map((profileChange, index) => (
        <Box
          key={`${profileChange.type}-${profileChange.profile.manufacturer.dir_name}-${profileChange.profile.id}-${index}`}
        >
          <ProfileChange change={profileChange} currentProfiles={currentProfiles} />
        </Box>
      ))}
    </Stack>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
      Contributed by <ContributorLinks change={change} /> ·{" "}
      <Link
        href={change.source.pull_request_url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        Pull request #{change.source.pull_request_number}
        <OpenInNewIcon sx={{ ml: 0.4, fontSize: "inherit", verticalAlign: "text-bottom" }} />
      </Link>
    </Typography>
  </Box>
);

export const WhatsNew = ({ initialPage }: WhatsNewProps) => {
  const { powerProfilesBySlugKey } = useLibrary();
  const [pages, setPages] = useState([initialPage]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const changes = useMemo(() => visibleChanges(pages), [pages]);
  const groups = useMemo(() => groupByDay(changes), [changes]);
  const nextCursor = pages.at(-1)?.next_cursor;

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadError(false);
    try {
      const page = await fetchLibraryChanges({ cursor: nextCursor });
      setPages((current) => [...current, page]);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <Box>
      <PageBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "What's new" }]} />
      <Typography variant="h4" component="h1" gutterBottom>
        What&apos;s new
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        Follow newly added profiles and improved measurements, grouped by the merged pull requests
        that brought them into the library.
      </Typography>

      {groups.length === 0 && (
        <Typography color="text.secondary">No recent profile changes are available.</Typography>
      )}

      {groups.map(([day, dayChanges]) => (
        <Paper
          key={day}
          variant="outlined"
          sx={{ mb: 2.5, overflow: "hidden" }}
          data-testid="whats-new-day"
        >
          <Typography
            variant="subtitle2"
            component="h2"
            sx={{ bgcolor: "action.hover", borderBottom: 1, borderColor: "divider", px: 2, py: 1 }}
          >
            {day}
          </Typography>
          <Stack divider={<Divider flexItem />}>
            {dayChanges.map((change) => (
              <PullRequestChange
                key={change.id}
                change={change}
                currentProfiles={powerProfilesBySlugKey}
              />
            ))}
          </Stack>
        </Paper>
      ))}

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Older changes could not be loaded. Please try again.
        </Alert>
      )}
      {nextCursor && (
        <Button
          variant="outlined"
          onClick={() => void loadMore()}
          disabled={isLoadingMore}
          startIcon={isLoadingMore ? <CircularProgress size={16} /> : undefined}
        >
          {isLoadingMore ? "Loading…" : "Load older changes"}
        </Button>
      )}
    </Box>
  );
};
