# Movie Advent Calendar

A daily movie-guessing advent calendar. Each day reveals a puzzle image; you get a few attempts to guess the movie.

Built from the [Figma design](https://www.figma.com/design/HKCrv875zRzE964kHd5j5s/Movie-Advent-Calendar?node-id=1-6) with Vite, React and TypeScript.

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
  lib/             Framework-free helpers (countdown maths)
  pages/HomePage/  The home page
  styles/          Design tokens (mirrors Figma variables) and global styles
```

Styling uses CSS Modules plus CSS custom properties. `src/styles/tokens.css` mirrors the Figma
variables (`Colour/Border/nav-border` → `--colour-border-nav-border`), so prefer a token over a raw value.

## Fonts

- **SF Pro Display** is used on Apple devices, where the OS provides it. Elsewhere the page falls back to
  **Inter**, which is self-hosted via `@fontsource`.
- **Monsieur La Doulaise** (the "Advent" script) is self-hosted via `@fontsource`.

## Pages

| Route        | Page                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| `/`          | Home: today's reveal, guessing, and a deck of past days to flip through                  |
| `/calendars` | Calendars: pick which calendar the home page shows (opens over the home page)            |
| `/create`    | Create a calendar: name, length, a movie title per day (calendar or list view), preview |

Routing uses React Router. Netlify serves `index.html` for every path (`public/_redirects`), so deep links work.

## Current state

Pages run on mock data (`src/data/mockCalendar.ts`) and local state. Not built yet:

- Guesses only count down the remaining attempts. Nothing checks them against an answer yet.
- Create page: "Share the Calendar" does nothing yet, the preview always shows the sample reveal, and
  the reveal styles (Drifting / Blizzard / Image) can be selected but don't change the preview.
  A draft is lost on reload.
- Every calendar reuses the one reveal image there is so far, and the calendar you pick is forgotten
  on reload.
