# Movie Advent Calendar

A daily movie-guessing advent calendar. Each day reveals a puzzle image; you get a few attempts to guess the movie.

Built from the Figma designs with Vite, React and TypeScript:

- [Home page](https://www.figma.com/design/HKCrv875zRzE964kHd5j5s/Movie-Advent-Calendar?node-id=1-6) (desktop)
- [Create page](https://www.figma.com/design/DUq5WEpHzaPWA39dxM0Oaz/Portfolio-2025-bam?node-id=6683-14519) (mobile; calendar and list views)

## Getting started

```bash
npm install
npm run dev
```

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Type-check and build for production  |
| `npm run preview`   | Serve the production build           |
| `npm run typecheck` | Type-check only                      |
| `npm test`          | Run unit tests (Vitest)              |

## Project layout

```
src/
  assets/          Images and icons exported from Figma
  components/      UI building blocks (one folder per component, CSS Modules)
  data/            Types and mock calendar data
  lib/             Framework-free helpers (countdown maths, calendar grid, routes)
  pages/           One folder per page (HomePage, CreatePage)
  styles/          Design tokens (mirrors Figma variables) and global styles
```

Pages are picked from the URL hash (`#home`, `#create`), so the static build runs on any host
without server rewrites. Below 640px wide the nav rail becomes a bar floating at the bottom of the screen.

Styling uses CSS Modules plus CSS custom properties. `src/styles/tokens.css` mirrors the Figma
variables (`Colour/Border/nav-border` → `--colour-border-nav-border`), so prefer a token over a raw value.

## Fonts

- **SF Pro Display** is used on Apple devices, where the OS provides it. Elsewhere the page falls back to
  **Inter**, which is self-hosted via `@fontsource`.
- **Monsieur La Doulaise** (the "Advent" script) is self-hosted via `@fontsource`.

## Current state

Both pages run against mock data in `src/data/mockCalendar.ts`; there is no backend yet.

- Guesses only count down the remaining attempts. Nothing checks them against an answer yet.
- The countdown shows the time until the next daily reveal at 19:00 local time.
- Like the desktop Create page, a calendar always ends on 24 December: 6 days covers 19–24 December,
  24 days covers 1–24 December. Earlier days are dimmed.
- The Create page keeps the draft (name, days, titles, reveal style) in memory only. "Share the Calendar"
  opens the share sheet (or copies the link) for the app itself, not for a saved calendar.
- The reveal-style preview shows the same artwork for every style.
- The "Calendars" nav link and the "Other Calendars" tab don't have pages yet.
