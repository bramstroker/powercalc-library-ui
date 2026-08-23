import { Avatar, type AvatarProps } from "@mui/material";
import { useEffect, useState } from "react";

import { contributorAvatarUrl, fallbackContributorAvatarUrl } from "../utils/avatarPaths";

const initials = (name: string, username: string) => {
  const source = name.trim() || username;
  return source
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

type GithubAvatarProps = Omit<AvatarProps, "alt" | "src" | "slotProps"> & {
  username: string;
  name?: string;
};

export const GithubAvatar = ({ username, name = "", ...avatarProps }: GithubAvatarProps) => {
  const primaryUrl = contributorAvatarUrl(username);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(primaryUrl);

  useEffect(() => setAvatarUrl(primaryUrl), [primaryUrl]);

  return (
    <Avatar
      {...avatarProps}
      alt={name || username}
      src={avatarUrl}
      slotProps={{
        img: {
          loading: "lazy",
          onError: () => {
            setAvatarUrl((failedUrl) =>
              failedUrl ? fallbackContributorAvatarUrl(username, failedUrl) : undefined,
            );
          },
        },
      }}
    >
      {initials(name, username)}
    </Avatar>
  );
};
