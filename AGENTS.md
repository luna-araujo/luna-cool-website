# AGENTS.md — luna-cool-website

Personal site (Astro 4 + Tailwind CSS, no framework components). Content via Astro Content Collections.

## Dev commands

```bash
npm run dev      # http://localhost:3000
npm run build    # outputs dist/
npm run preview  # preview built site
```

No tests, no lint, no typecheck scripts exist.

## Architecture gotchas

- **Output mode: `hybrid`** with **Netlify adapter** (`astro.config.mjs`). Most pages are static; `/game` is SSR (`prerender = false`).
- **All URLs use `import.meta.env.BASE_URL`** — never hard-code paths. Pattern: `const basePath = import.meta.env.BASE_URL;` then `{basePath + 'projects'}` or `{basePath + project.data.image.slice(1)}`.
- **No React/Vue/Svelte** — all interactivity is vanilla `<script>` blocks inside `.astro` files.
- **Theme**: Catppuccin colors via CSS variables. Stored in `localStorage` key `"luna:theme"`. Early inline `<script>` in BaseLayout prevents flash.

## Content collections (`src/content/config.ts`)

| Collection | Schema | Location |
|---|---|---|
| `blog` | title, description, date, tags?, coverImage?, coverAlt?, coverCaption? | `src/content/blog/*.md` |
| `projects` | title, summary, role?, year?, image?, link? | `src/content/projects/*.md` |
| `help-cards` | title, accent, x, y, w, open, kind, order, tags? | `src/content/help-cards/*.md` |

Home page content renders from `src/content/home/index.md` (not a formal collection — imported directly via `import Intro from "../content/home/index.md"`).

## Game download page (`/game`)

SSR-only page that fetches latest GitHub release at runtime. Needs env vars (see `.env.example`):
- `GAME_RELEASES_OWNER` (default: `luna-araujo`)
- `GAME_RELEASES_REPO` (default: `happy_lobby`)
- `GAME_RELEASES_TOKEN` (required for private repos)

Logic in `src/lib/github-releases.ts`. Set `GAME_RELEASES_TOKEN` in `.env` for local dev.

## Project image galleries

Discovered at build time via Node `fs` in frontmatter (`.astro` file's `---` block). Convention:
- Cover: `public/images/projects/<slug>/cover.png` (ref'd in frontmatter as `/images/projects/<slug>/cover.png`)
- Gallery: `public/images/projects/<slug>/gallery/*.{png,jpg,jpeg,gif,webp}`
- Slice leading `/` when combining with `basePath`: `basePath + project.data.image.slice(1)`

## Deployment

- **Netlify** (via `netlify.toml`): `npm run build`, publish `dist/`, Node 20.
- **GitHub Pages** workflow also present (`.github/workflows/deploy.yml`) — uses `withastro/action@v2` + `actions/deploy-pages@v4`. Passes `GAME_RELEASES_TOKEN` as secret.
- Current `astro.config.mjs`: `site: 'https://luna-araujo.com'`, `base: '/'`, Netlify adapter.

## Styling

- Tailwind + hand-crafted CSS in `src/styles/*.css` (imported per-page).
- Page-specific CSS files: `about.css`, `blog-index.css`, `blog-post.css`, `contact.css`, `game-download.css`, `project-card.css`, `project-detail.css`, `projects-view.css`.
- Fonts: DM Sans (body), Space Mono (code), Merriweather (serif) from Google Fonts. Font Awesome 6 from CDN.
