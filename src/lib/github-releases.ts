export type ReleasePlatform = "windows" | "linux" | "macos" | "other";

export type GameReleaseAsset = {
  name: string;
  downloadUrl: string;
  sizeBytes: number;
  platform: ReleasePlatform;
};

export type LatestGameReleaseSuccess = {
  ok: true;
  tagName: string;
  releaseName: string;
  publishedAt: string;
  releaseUrl: string;
  assets: GameReleaseAsset[];
};

export type LatestGameReleaseFailure = {
  ok: false;
  message: string;
  releaseUrl: string;
};

export type LatestGameReleaseResult = LatestGameReleaseSuccess | LatestGameReleaseFailure;

const GAME_OWNER: string = import.meta.env.GAME_RELEASES_OWNER ?? "luna-araujo";
const GAME_REPO: string = import.meta.env.GAME_RELEASES_REPO ?? "happy_lobby";
const GAME_RELEASES_TOKEN: string | undefined = import.meta.env.GAME_RELEASES_TOKEN;
const GAME_REPO_SLUG: string = `${GAME_OWNER}/${GAME_REPO}`;
const GAME_RELEASES_API_URL: string = `https://api.github.com/repos/${GAME_REPO_SLUG}/releases/latest`;
export const GAME_RELEASES_URL: string = `https://github.com/${GAME_REPO_SLUG}/releases`;

const PLATFORM_RANK: Record<ReleasePlatform, number> = {
  windows: 0,
  linux: 1,
  macos: 2,
  other: 3
};

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as JsonObject;
};

const getString = (obj: JsonObject, key: string): string | null => {
  const value: unknown = obj[key];
  if (typeof value !== "string") {
    return null;
  }
  return value;
};

const getNumber = (obj: JsonObject, key: string): number | null => {
  const value: unknown = obj[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
};

const inferPlatform = (filename: string): ReleasePlatform => {
  const normalized: string = filename.toLowerCase();

  if (normalized.includes("windows") || normalized.includes("win")) {
    return "windows";
  }
  if (normalized.includes("linux")) {
    return "linux";
  }
  if (normalized.includes("macos") || normalized.includes("darwin") || normalized.includes("osx") || normalized.includes("mac")) {
    return "macos";
  }

  return "other";
};

const parseAsset = (value: unknown): GameReleaseAsset | null => {
  const entry: JsonObject | null = asObject(value);
  if (entry == null) {
    return null;
  }

  const name: string | null = getString(entry, "name");
  const downloadUrl: string | null = getString(entry, "browser_download_url");
  const sizeBytes: number | null = getNumber(entry, "size");

  if (name == null || downloadUrl == null) {
    return null;
  }
  if (!name.toLowerCase().endsWith(".zip")) {
    return null;
  }

  return {
    name,
    downloadUrl,
    sizeBytes: sizeBytes ?? 0,
    platform: inferPlatform(name)
  };
};

const sortAssets = (a: GameReleaseAsset, b: GameReleaseAsset): number => {
  const byPlatform: number = PLATFORM_RANK[a.platform] - PLATFORM_RANK[b.platform];
  if (byPlatform !== 0) {
    return byPlatform;
  }
  return a.name.localeCompare(b.name);
};

export const formatBytes = (sizeBytes: number): string => {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "Unknown size";
  }

  const units: string[] = ["B", "KB", "MB", "GB"];
  let size: number = sizeBytes;
  let unitIndex: number = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision: number = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

export const fetchLatestGameRelease = async (): Promise<LatestGameReleaseResult> => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "luna-cool-website"
    };
    if (GAME_RELEASES_TOKEN && GAME_RELEASES_TOKEN.trim().length > 0) {
      headers.Authorization = `Bearer ${GAME_RELEASES_TOKEN}`;
    }

    const response: Response = await fetch(GAME_RELEASES_API_URL, {
      headers
    });

    if (!response.ok) {
      const missingTokenForPrivateRepo: boolean = response.status === 404 && !headers.Authorization;
      return {
        ok: false,
        message: missingTokenForPrivateRepo
          ? "GitHub API returned 404. This usually means the repo is private and GAME_RELEASES_TOKEN is missing."
          : `GitHub API returned ${response.status}.`,
        releaseUrl: GAME_RELEASES_URL
      };
    }

    const payload: unknown = await response.json();
    const release: JsonObject | null = asObject(payload);
    if (release == null) {
      return {
        ok: false,
        message: "Could not parse latest release response.",
        releaseUrl: GAME_RELEASES_URL
      };
    }

    const tagName: string | null = getString(release, "tag_name");
    const releaseName: string | null = getString(release, "name");
    const publishedAt: string | null = getString(release, "published_at");
    const releaseUrl: string = getString(release, "html_url") ?? GAME_RELEASES_URL;

    if (tagName == null) {
      return {
        ok: false,
        message: "Latest release data is missing a version tag.",
        releaseUrl
      };
    }

    const rawAssets: unknown = release["assets"];
    const assetsList: unknown[] = Array.isArray(rawAssets) ? rawAssets : [];
    const assets: GameReleaseAsset[] = assetsList
      .map(parseAsset)
      .filter((asset): asset is GameReleaseAsset => asset != null)
      .sort(sortAssets);

    return {
      ok: true,
      tagName,
      releaseName: releaseName && releaseName.trim().length > 0 ? releaseName : tagName,
      publishedAt: publishedAt ?? "",
      releaseUrl,
      assets
    };
  } catch {
    return {
      ok: false,
      message: "Failed to reach GitHub release API.",
      releaseUrl: GAME_RELEASES_URL
    };
  }
};
