# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Luna's personal site built with **Astro 4** + **Tailwind CSS** (no framework components). Content is authored as Markdown via Astro Content Collections and rendered through dynamic routes. Deployed to GitHub Pages under the `/luna-cool-website/` subpath.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start local dev server (http://localhost:3000)
npm run build            # Production build (outputs to dist/)
npm run preview          # Preview production build locally
```

## Critical: GitHub Pages Base-Path Handling

This site is deployed to `https://luna-araujo.github.io/luna-cool-website/`, which means:

- **`astro.config.mjs`** sets `site: 'https://luna-araujo.github.io'` and `base: '/luna-cool-website/'`
- When creating links or asset URLs, use `const basePath = import.meta.env.BASE_URL;` and then reference paths as `href={basePath + 'projects'}` or `src={basePath + 'image.png'}`
- Hard-coded root-absolute URLs like `/projects` or `/images/...` **will break** in the deployed subpath
- This applies to all links, asset references, and image URLs throughout the codebase

## Architecture

### Layout & Navigation
- [BaseLayout.astro](src/layouts/BaseLayout.astro) wraps all pages with:
  - Bottom navigation bar with active-link detection
  - Theme toggle button (light/dark mode)
  - Custom cursor effect (positioned via sessionStorage to persist across navigations)
  - Critical CSS for theme variables loaded before external stylesheets
- Active link detection compares `Astro.url.pathname` with nav link paths, accounting for base path

### Content Collections
- [src/content/config.ts](src/content/config.ts) defines schema for two collections:
  - **blog**: Posts with `title`, `description`, `date`, optional `tags` and `coverImage`
  - **projects**: Project entries with `title`, `summary`, `role`, `year`, `image`, `link`
- Content files are in [src/content/blog/](src/content/blog/) and [src/content/projects/](src/content/projects/)

### Pages & Routes
- Static pages: [src/pages/index.astro](src/pages/index.astro), `about.astro`, `contact.astro`, `404.astro`
- Dynamic routes:
  - [src/pages/blog/index.astro](src/pages/blog/index.astro) lists posts sorted by date
  - [src/pages/blog/[...slug].astro](src/pages/blog/[...slug].astro) renders individual posts via `getStaticPaths()` + `post.render()`
  - [src/pages/projects/index.astro](src/pages/projects/index.astro) displays a carousel with modal UI
  - [src/pages/projects/[...slug].astro](src/pages/projects/[...slug].astro) renders project details and discovers gallery images

### Theme System
- [src/scripts/theme-tools.ts](src/scripts/theme-tools.ts) handles client-side theme switching
- Theme value stored in `localStorage` under key `"luna:theme"`; defaults to system preference if not set
- Early inline script in BaseLayout prevents flash of unstyled content before external CSS loads
- CSS variables (`--bg`, `--text`, `--accent`, etc.) are defined in [src/styles/themes.css](src/styles/themes.css)
- Color scheme uses Catppuccin palette (light: Latte, dark: Mocha)

### Styling
- [src/styles/global.css](src/styles/global.css) defines theme variables and global utilities (uses Tailwind `@apply`)
- Page-specific CSS files in [src/styles/](src/styles/):
  - `about.css`, `blog-index.css`, `blog-post.css`, `contact.css`, `project-card.css`, `projects-view.css`
  - These are imported directly in their corresponding `.astro` pages
- Custom fonts: DM Sans (body), Space Mono (code), Merriweather (serif) from Google Fonts

### Image Galleries
- Project gallery discovery (build-time) happens in [src/pages/projects/index.astro](src/pages/projects/index.astro) and [src/pages/projects/[...slug].astro](src/pages/projects/[...slug].astro)
- Images in `public/images/projects/<slug>/gallery/*.{png,jpg,jpeg,gif,webp}` are discovered via Node filesystem APIs (server-side only)
- Frontmatter accesses these and passes data to client JS via `define:vars`
- Project cover images are referenced in frontmatter as `/images/projects/<slug>/cover.png` and converted to correct URLs using `basePath`

## UI Patterns

- **No framework components**: All UI is vanilla HTML/CSS/JS within `.astro` files
- Small `<script>` blocks are preferred for interactivity (theme toggle, carousel navigation, modal controls)
- Keep accessibility attributes (`aria-label`, `dialog`, keyboard handlers) when modifying UI
- Forms and interactive features are plain HTML with inline event handlers

## Tailwind Configuration

- [tailwind.config.cjs](tailwind.config.cjs) extends default with custom fonts
- Content scan includes all `.astro`, `.html`, `.js`, `.jsx`, `.md`, `.mdx`, `.ts`, `.tsx` files in `src/`
- Uses Catppuccin plugin via `@catppuccin/tailwindcss` for color consistency (not active in current config but available)
