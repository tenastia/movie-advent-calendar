import { getCountdownRange } from '../lib/calendar';
import type { DayRecord } from './guessStore';
import type { MovieList } from './movieLists';
import { sampleReveal } from './sampleReveal';
import type { Calendar, DayStatus } from './types';

export const REVEAL_TIME = '12:00';
export const ATTEMPTS_PER_DAY = 3;

/**
 * A movie list as the pages show it on `currentDay`. Before its first day a
 * calendar hasn't started (no movie, no days yet); once it's over it shows
 * Christmas Eve. Days so far are guessed if one of the guesses was right,
 * otherwise missed.
 */
export function buildCalendar(list: MovieList, currentDay: number, records: Record<number, DayRecord>): Calendar {
  const { first, last } = getCountdownRange(list.length);
  const started = currentDay >= first;
  const day = Math.min(Math.max(currentDay, first), last);
  const titleFor = (d: number) => list.movies[d - first] ?? '';
  const photo = list.revealStyle === 'image' ? list.images?.[day - first] : null;
  const statusFor = (d: number): DayStatus => (records[d]?.solved ? 'guessed' : 'missed');

  return {
    id: list.id,
    name: list.name,
    description: list.description,
    length: list.length,
    revealTime: REVEAL_TIME,
    attemptsPerDay: ATTEMPTS_PER_DAY,
    revealStyle: list.revealStyle,
    firstDay: first,
    started,
    today: {
      day,
      // Nothing to show (or give away) before the calendar starts.
      title: started ? titleFor(day) : '',
      nextTitle: started && day < last ? titleFor(day + 1) : undefined,
      reveal: photo ? { src: photo, alt: `The photo for December ${day}` } : sampleReveal,
    },
    days: Array.from({ length: started ? day - first + 1 : 0 }, (_, i) => first + i).map((d) => ({
      day: d,
      title: titleFor(d),
      status: statusFor(d),
    })),
  };
}
