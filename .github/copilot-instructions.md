# Copilot instructions (luna-cool-website)

## Project overview
- Static personal site built with **Astro 4** + **Tailwind CSS** (no React/Vue/Svelte components).
- Content is authored as Markdown via **Astro Content Collections** and rendered by dynamic routes.
- Deployed to **GitHub Pages** under a subpath; base URLs matter.

## Key structure
- `src/pages/` defines routes (e.g. `index.astro`, `about.astro`, `blog/*`, `projects/*`).
- `src/layouts/BaseLayout.astro` wraps every page; contains the bottom nav + active-link logic.
- `src/content/config.ts` defines the `blog` + `projects` collections (Zod schema).
- `src/content/blog/*.md` and `src/content/projects/*.md` are the Markdown entries.
- `public/images/projects/<slug>/...` holds project images and optional `gallery/` images.
- Styling is a mix of Tailwind utilities and handcrafted CSS in `src/styles/*.css`.

## Local dev / build
- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build` (outputs `dist/`)
- Preview build: `npm run preview`

## GitHub Pages base-path rules (important)
- `astro.config.mjs` sets `site` + `base` (`/luna-cool-website/`).
- When creating links or asset URLs, prefer:
  - `const basePath = import.meta.env.BASE_URL;`
  - `href={basePath + 'projects'}` / `src={basePath + 'images/...'}'
- Avoid hard-coded root-absolute URLs like `/projects` because they break under the Pages subpath.

## Content patterns
- Blog pages:
  - List route: `src/pages/blog/index.astro` uses `getCollection('blog')` and sorts by `date`.
  - Detail route: `src/pages/blog/[...slug].astro` uses `getStaticPaths()` + `post.render()`.
- Project pages:
  - Detail route: `src/pages/projects/[...slug].astro` renders Markdown and optionally builds a gallery.
  - Carousel + modal UI lives in `src/pages/projects/index.astro` with vanilla DOM scripting.

## Images / galleries
- Project frontmatter commonly stores `image` as a root-style path like `/images/projects/<slug>/cover.png`.
- Code frequently converts that to a correct deployed URL via `basePath + image.slice(1)`.
- Galleries are discovered at build-time using Node APIs (server-side frontmatter only):
  - `public/images/projects/<slug>/gallery/*.{png,jpg,jpeg,gif,webp}`
  - See `src/pages/projects/[...slug].astro` and `src/pages/projects/index.astro`.
- If you add a gallery feature, keep filesystem access in frontmatter and pass data to client JS via `define:vars`.

## Styling conventions
- `src/styles/global.css` defines theme CSS variables (`--bg`, `--text`, `--accent`, etc.) and uses Tailwind `@apply`.
- Some views pull in additional CSS files directly from pages (e.g. `projects/index.astro` imports `project-card.css` + `projects-view.css`).

## When editing UI behavior
- Prefer the existing approach: small vanilla `<script>` blocks inside `.astro` pages/layouts.
- Keep accessibility attributes used today (`aria-label`, `dialog`, keyboard handlers) when changing modals/lightboxes.
