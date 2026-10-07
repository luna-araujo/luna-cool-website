export type StudioGameStat = {
  label: string;
  value: string;
  note?: string;
};

export type StudioGame = {
  name: string;
  slug: string;
  status: "live" | "soon";
  category: string;
  rtp?: string;
  art?: string;
  cardBackground?: string;
  text?: string;
  stats: StudioGameStat[];
  shots: string[];
  demo?: string;
  page: string;
};

const STUDIO_GAMES_URL: string = import.meta.env.LUCKY_LUNA_GAMES_URL ?? "https://luckyluna.studio/games.json";

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as JsonObject;
};

const getString = (obj: JsonObject, key: string): string | undefined => {
  const value: unknown = obj[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

const toStat = (value: unknown): StudioGameStat | null => {
  const obj = asObject(value);
  if (!obj) {
    return null;
  }
  const label = getString(obj, "label");
  const statValue = getString(obj, "value");
  if (!label || !statValue) {
    return null;
  }
  return { label, value: statValue, note: getString(obj, "note") };
};

const toGame = (value: unknown): StudioGame | null => {
  const obj = asObject(value);
  if (!obj) {
    return null;
  }
  const name = getString(obj, "name");
  const slug = getString(obj, "slug");
  if (!name || !slug) {
    return null;
  }
  const stats = Array.isArray(obj.stats) ? obj.stats.map(toStat).filter((s): s is StudioGameStat => s !== null) : [];
  const shots = Array.isArray(obj.shots) ? obj.shots.filter((s): s is string => typeof s === "string") : [];

  return {
    name,
    slug,
    status: getString(obj, "status") === "live" ? "live" : "soon",
    category: getString(obj, "category") ?? "",
    rtp: getString(obj, "rtp"),
    art: getString(obj, "art"),
    cardBackground: getString(obj, "cardBackground"),
    text: getString(obj, "text"),
    stats,
    shots,
    demo: getString(obj, "demo"),
    page: getString(obj, "page") ?? "https://luckyluna.studio/games"
  };
};

let cached: Promise<StudioGame[]> | null = null;

/** Lucky Luna Studios' catalogue, read from the studio site's games.json.
 *  Runs at build time; if the feed is unreachable the build carries on without it. */
export const getStudioGames = (): Promise<StudioGame[]> => {
  cached ??= (async () => {
    try {
      const response = await fetch(STUDIO_GAMES_URL, { headers: { Accept: "application/json" } });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = asObject(await response.json());
      const list: unknown[] = Array.isArray(payload?.games) ? payload.games : [];
      // Released games first, keeping the studio's order within each group.
      return list
        .map(toGame)
        .filter((game): game is StudioGame => game !== null)
        .sort((a, b) => Number(b.status === "live") - Number(a.status === "live"));
    } catch (error) {
      console.warn(`[lucky-luna-games] Could not load ${STUDIO_GAMES_URL}: ${(error as Error).message}`);
      return [];
    }
  })();
  return cached;
};
