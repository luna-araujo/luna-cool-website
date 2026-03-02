/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GAME_RELEASES_OWNER?: string;
  readonly GAME_RELEASES_REPO?: string;
  readonly GAME_RELEASES_TOKEN?: string;
}
