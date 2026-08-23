export type AvatarResolution = 96 | 192;

const githubAvatarUrl = (username: string, resolution: AvatarResolution) =>
  `https://github.com/${encodeURIComponent(username)}.png?size=${resolution}`;

const downloadedAvatarPaths: Readonly<Record<string, string>> = __AVATAR_PATHS__;

export const localAvatarPath = (
  username: string,
  avatarPaths: Readonly<Record<string, string>> = downloadedAvatarPaths,
  resolution: AvatarResolution = 192,
) => {
  const basePath = avatarPaths[username.toLocaleLowerCase("en-US")];
  if (!basePath) return undefined;
  // Keep local development and rolling deployments compatible with the previous manifest format.
  if (/\.(?:gif|jpe?g|png|webp)$/iu.test(basePath)) return basePath;
  return `${basePath}-${resolution}.webp`;
};

export const contributorAvatarUrl = (
  username: string,
  resolution: AvatarResolution = 192,
  avatarPaths: Readonly<Record<string, string>> = downloadedAvatarPaths,
) => localAvatarPath(username, avatarPaths, resolution) ?? githubAvatarUrl(username, resolution);

export const fallbackContributorAvatarUrl = (
  username: string,
  failedUrl: string,
  resolution: AvatarResolution = 192,
) => {
  const localUrl = localAvatarPath(username, downloadedAvatarPaths, resolution);
  return localUrl && failedUrl === localUrl ? githubAvatarUrl(username, resolution) : undefined;
};
