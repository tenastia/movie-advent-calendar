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
  hooks/           Shared React hooks (media queries)
  lab/             The motion lab UI (sliders, transport, recorder)
  lib/             Framework-free helpers (countdown and carousel-loop maths)
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

## Pages

| Route        | Page                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| `/`          | Home: today's reveal, guessing, and a deck of past days to flip through                  |
| `/calendars` | Calendars: pick which calendar the home page shows (opens over the home page)            |
| `/create`    | Create a calendar: name, length, a movie title per day (calendar or list view), preview |
| `/c/:id`     | A calendar someone shared: opens it on the home page                                      |

Routing uses React Router. Netlify serves `index.html` for every path (`public/_redirects`), so deep links work.

On phones (up to 639px wide, the Figma 402px frames) the side nav becomes a bar floating at the bottom,
the home page shows today's date box instead of the deck (tap it to open the deck of days and guesses),
the Calendars screen is a sideways carousel, and the Create page is a single 358px column.

## Sharing (API)

"Share the Calendar" saves the calendar and copies a link (`/c/<id>`) for a friend. The API is a set of
Netlify Functions (`netlify/functions`) storing data in Netlify Blobs; `npm run dev` runs them locally
(`netlify/dev/devApi.ts`, data in `.netlify/blobs-dev`), so no Netlify account or CLI is needed to try it.

| Request                          | Does                                                                     |
| -------------------------------- | ------------------------------------------------------------------------ |
| `POST /api/calendars`            | Saves a calendar (name, length, reveal style, movies, photos); returns its id |
| `GET /api/calendars/:id?day=N`   | The calendar as seen on day N, with titles only up to tomorrow           |
| `POST /api/images`               | Stores one photo (JPEG / PNG / WebP / GIF, ≤ 4 MB); returns its key and URL |
| `GET /api/images/:key`           | Serves a photo (cached for good)                                         |

Validation lives in `src/shared/sharedCalendar.ts`, shared by the app and the functions. Creating and
uploading are rate-limited per IP. There are no accounts yet: a calendar can't be edited once shared,
and the "titles up to tomorrow" rule keeps spoilers out of casual view but trusts the day the browser
asks for.

## Reveal preview

The Create page previews how each day is revealed: the letter motion (`CALENDAR_PRESET_KEY`, currently
`test-1`) as it looks at 06:00, playing at real speed, with the calendar's first movie. Other reveal
styles (Blizzard, a photo per day) are planned for a later version; the API and the home page already
understand a calendar's `revealStyle`, and `STYLE_PRESET_KEYS` in `src/motion/presets/index.ts` maps
styles to presets.

## Current state

The calendars come from the movie lists in `src/data/movieLists.ts`: a list of N days runs to Christmas
Eve, so its first movie is on 25 − N December. Through 1–24 December the home page shows today's movie;
the rest of the year it previews 9 December. Guesses are checked leniently (case, accents, punctuation and
a leading "The" don't matter; numbers must match; longer titles forgive a typo) and kept in the browser.

For testing, add to the URL:

- `?day=15` to show any December day (a 12-day calendar shows its first day, the 13th, until then)
- `?reset` to forget every guess made in this browser
- `?time=` / `?speed=` for the letter motion (see above)

Not built yet:

- Create page: a draft is lost on reload. Sharing by email (recipient + note) has its own design and
  isn't built.
- Every calendar reuses the one reveal image there is so far, and the calendar you pick is forgotten
  on reload.
