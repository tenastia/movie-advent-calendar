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
lab/index.html     Entry for the motion lab page (/lab/)
src/
  assets/          Images and icons exported from Figma
  components/      UI building blocks (one folder per component, CSS Modules)
  data/            Types and mock calendar data
  lab/             The motion lab UI (sliders, transport, recorder)
  lib/             Framework-free helpers (countdown maths)
  motion/          The letter engine, shaders and presets
  pages/HomePage/  The home page
  styles/          Design tokens (mirrors Figma variables) and global styles
```

Styling uses CSS Modules plus CSS custom properties. `src/styles/tokens.css` mirrors the Figma
variables (`Colour/Border/nav-border` → `--colour-border-nav-border`), so prefer a token over a raw value.

## Letter motion

Today's number is drawn by a WebGL letter engine (`src/motion`, Three.js via React Three Fiber) in a
full-viewport canvas behind the page, centred on the reveal frame. It runs on the visitor's clock:

| Local time    | What happens                                             |
| ------------- | -------------------------------------------------------- |
| 00:00 → 06:00 | The number decays letter by letter                       |
| 06:00 → 12:00 | Letters drift back one by one and assemble the title     |
| 12:00 → 24:00 | The title holds; at midnight the next number fades in    |

- **Motion lab:** `/lab/` tunes every parameter live. "Copy preset" puts the JSON on the clipboard; save
  it as `src/motion/presets/<name>.json`.
- **Which preset the calendar uses:** `CALENDAR_PRESET_KEY` in `src/motion/presets/index.ts`.
- **Checking any moment:** `?time=03:00` starts the day at 03:00; `?speed=720` plays the whole day in
  2 minutes. Both work together.
- Browsers without WebGL see the static image from `src/assets/reveal`.

## Fonts

- **SF Pro Display** is used on Apple devices, where the OS provides it. Elsewhere the page falls back to
  **Inter**, which is self-hosted via `@fontsource`.
- **Monsieur La Doulaise** (the "Advent" script) is self-hosted via `@fontsource`.

## Current state

The home page is built against mock data in `src/data/mockCalendar.ts`. Not built yet:

- Guesses only count down the remaining attempts. Nothing checks them against an answer yet.
- The countdown shows the time until the next daily reveal at 19:00 local time.
- The "Create" and "Calendars" nav links and the "Other Calendars" tab don't have pages yet.
