# Luna Cool Website

Personal site built with Astro + Tailwind.

## Commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Game download page (`/game`)
The `/game` route fetches the latest release from GitHub API at build/runtime.

If the game repository is private, configure environment variables:

- `GAME_RELEASES_OWNER` (default: `luna-araujo`)
- `GAME_RELEASES_REPO` (default: `happy_lobby`)
- `GAME_RELEASES_TOKEN` (required for private repos)

### Local setup
1. Copy `.env.example` to `.env`
2. Replace `GAME_RELEASES_TOKEN` with a GitHub token that can read the game repo releases
3. Restart `npm run dev`

### GitHub Actions setup
Add repository secret:
- `GAME_RELEASES_TOKEN`

The deploy workflow already passes this secret to the Astro build step.

## Content
- Blog posts: `src/content/blog/*.md`
- Projects: `src/content/projects/*.md`

## Deploy to GitHub Pages
Use the GitHub Pages workflow of your choice (e.g. Astro docs + Actions) and set the output folder to `dist`. 
