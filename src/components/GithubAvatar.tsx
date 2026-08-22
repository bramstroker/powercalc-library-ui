import { Avatar, type AvatarProps } from "@mui/material";
import { useEffect, useState } from "react";

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
  const avatarUrl = `https://github.com/${encodeURIComponent(username)}.png`;
  const [failedUrl, setFailedUrl] = useState<string>();

  useEffect(() => setFailedUrl(undefined), [avatarUrl]);

  return (
    <Avatar
      {...avatarProps}
      alt={name || username}
      src={failedUrl === avatarUrl ? undefined : avatarUrl}
      slotProps={{
        img: {
          loading: "lazy",
          onError: () => {
            setFailedUrl(avatarUrl);
          },
        },
      }}
    >
      {initials(name, username)}
    </Avatar>
  );
};
