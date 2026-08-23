const githubAvatarUrl = (username: string) =>
  `https://github.com/${encodeURIComponent(username)}.png?size=192`;

const downloadedAvatarPaths: Readonly<Record<string, string>> = __AVATAR_PATHS__;

export const localAvatarPath = (
  username: string,
  avatarPaths: Readonly<Record<string, string>> = downloadedAvatarPaths,
) => avatarPaths[username.toLocaleLowerCase("en-US")];

export const contributorAvatarUrl = (
  username: string,
  avatarPaths: Readonly<Record<string, string>> = downloadedAvatarPaths,
) => localAvatarPath(username, avatarPaths) ?? githubAvatarUrl(username);

export const fallbackContributorAvatarUrl = (username: string, failedUrl: string) => {
  const localUrl = localAvatarPath(username);
  return localUrl && failedUrl === localUrl ? githubAvatarUrl(username) : undefined;
};
