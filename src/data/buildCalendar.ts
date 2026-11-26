import { getCountdownRange } from '../lib/calendar';
import type { DayRecord } from './guessStore';
import type { MovieList } from './movieLists';
import { sampleReveal } from './sampleReveal';
import type { Calendar, DayStatus } from './types';

export const REVEAL_TIME = '12:00';
export const ATTEMPTS_PER_DAY = 3;

/**
 * A movie list as the pages show it on `currentDay`. A calendar that hasn't
 * started yet shows its first day, and one that's over shows Christmas Eve.
 * Days so far are guessed if one of the guesses was right, otherwise missed.
 */
export function buildCalendar(list: MovieList, currentDay: number, records: Record<number, DayRecord>): Calendar {
  const { first, last } = getCountdownRange(list.length);
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
    today: {
      day,
      title: titleFor(day),
      nextTitle: day < last ? titleFor(day + 1) : undefined,
      reveal: photo ? { src: photo, alt: `The photo for December ${day}` } : sampleReveal,
    },
    days: Array.from({ length: day - first + 1 }, (_, i) => first + i).map((d) => ({
      day: d,
      title: titleFor(d),
      status: statusFor(d),
    })),
  };
}
