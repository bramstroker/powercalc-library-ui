import BoltIcon from "@mui/icons-material/Bolt";
import HistoryIcon from "@mui/icons-material/History";
import MoreIcon from "@mui/icons-material/More";
import PermDeviceInformationIcon from "@mui/icons-material/PermDeviceInformation";
import PersonIcon from "@mui/icons-material/Person";
import { Stack, Tooltip } from "@mui/material";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";

import type { PowerProfile } from "../../../types/PowerProfile";
import { formatTimestampUtc } from "../../../utils/dateFormat";
import { authorPath } from "../../../utils/urlSlugs.mjs";

import { Timestamp } from "./AttributeRenderers";
import type { ProfileAttribute } from "./types";

export const createLibraryAttributes = (profile: PowerProfile): ProfileAttribute[] => [
  {
    label: "Created",
    value: formatTimestampUtc(profile.createdAt),
    icon: HistoryIcon,
    group: "library",
  },
  {
    label: "Updated",
    value: profile.updatedAt && formatTimestampUtc(profile.updatedAt),
    icon: HistoryIcon,
    group: "library",
    render: () => (profile.updatedAt ? <Timestamp date={profile.updatedAt} /> : null),
  },
  {
    label: "Authors",
    value: profile.authors.map((author) => author.name),
    icon: PersonIcon,
    group: "library",
    filterKey: "author",
    render: () => (
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5 }}>
        {profile.authors.map((author, index) => (
          <Tooltip
            key={author.githubUsername || `${author.name}-${index}`}
            title="View this author's profiles"
            describeChild
            arrow
            placement="top"
          >
            <Link
              component={RouterLink}
              to={authorPath(author.githubUsername)}
              underline="always"
              color="primary"
              sx={{ textDecorationStyle: "dotted" }}
            >
              {author.name}
            </Link>
          </Tooltip>
        ))}
      </Stack>
    ),
  },
  { label: "Min version", value: profile.minVersion, icon: MoreIcon, group: "library" },
  {
    label: "Discovery",
    value:
      profile.discoveryBy === "manual"
        ? "Not available (manual setup only)"
        : `Automatic, by ${profile.discoveryBy ?? "entity"}`,
    icon: PermDeviceInformationIcon,
    group: "library",
  },
  {
    label: "Only self usage",
    value: profile.onlySelfUsage ? "Yes" : null,
    icon: BoltIcon,
    group: "library",
  },
  {
    label: "Compatible integrations",
    value: profile.compatibleIntegrations,
    icon: MoreIcon,
    group: "library",
  },
];
