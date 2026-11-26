/**
 * A calendar someone created and shared: what the Create page sends, what the
 * server stores, and what a friend's browser gets back. Shared by the app and
 * the Netlify functions, so both validate the same way.
 */
import type { RevealStyle } from '../data/types';

export const CALENDAR_LENGTHS = [6, 12, 18, 24] as const;
export const REVEAL_STYLES: readonly RevealStyle[] = ['drifting', 'blizzard', 'image'];
export const MAX_NAME = 80;
export const MAX_TITLE = 120;

/** Sent by the Create page. `images[i]` is an uploaded image key for day i, or null. */
export interface CalendarInput {
  name: string;
  length: number;
  revealStyle: RevealStyle;
  movies: string[];
  images?: (string | null)[];
}

/** What the server keeps. */
export interface StoredCalendar extends Required<CalendarInput> {
  id: string;
  createdAt: string;
}

/** What a friend's browser gets: the days up to tomorrow (tomorrow's letters fade in at midnight). */
export interface SharedCalendar {
  id: string;
  name: string;
  length: number;
  revealStyle: RevealStyle;
  /** First December day: 25 − length. */
  firstDay: number;
  /** Movies from the first day to `visibleTo`, in order. */
  movies: string[];
  /** Image URLs for the same days (null where there is none). */
  images: (string | null)[];
  /** The last day included. */
  visibleTo: number;
}

const IMAGE_KEY = /^[A-Za-z0-9]{10,40}$/;

export function isImageKey(value: unknown): value is string {
  return typeof value === 'string' && IMAGE_KEY.test(value);
}

export function imageUrl(key: string) {
  return `/api/images/${key}`;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Checks and tidies a calendar from the Create page. */
export function parseCalendarInput(body: unknown): Result<CalendarInput> {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Expected a calendar.' };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return { ok: false, error: 'Give the calendar a name.' };
  if (name.length > MAX_NAME) return { ok: false, error: `Keep the name under ${MAX_NAME} characters.` };

  const length = b.length;
  if (!CALENDAR_LENGTHS.includes(length as (typeof CALENDAR_LENGTHS)[number])) {
    return { ok: false, error: 'A calendar runs 6, 12, 18 or 24 days.' };
  }

  if (!REVEAL_STYLES.includes(b.revealStyle as RevealStyle)) return { ok: false, error: 'Unknown reveal style.' };
  const revealStyle = b.revealStyle as RevealStyle;

  if (!Array.isArray(b.movies) || b.movies.length !== length) {
    return { ok: false, error: `Add a movie for each of the ${length} days.` };
  }
  const movies = b.movies.map((m) => (typeof m === 'string' ? m.replace(/\s+/g, ' ').trim() : ''));
  const missing = movies.filter((m) => !m).length;
  if (missing) return { ok: false, error: `Add a movie for each day (${missing} to go).` };
  if (movies.some((m) => m.length > MAX_TITLE)) return { ok: false, error: `Keep titles under ${MAX_TITLE} characters.` };

  let images: (string | null)[] = Array.from({ length: length as number }, () => null);
  if (b.images !== undefined) {
    if (!Array.isArray(b.images) || b.images.length !== length || !b.images.every((k) => k === null || isImageKey(k))) {
      return { ok: false, error: 'Images don’t match the days.' };
    }
    images = b.images as (string | null)[];
  }
  if (revealStyle === 'image' && images.some((k) => k === null)) {
    const left = images.filter((k) => k === null).length;
    return { ok: false, error: `Add a photo for each day (${left} to go).` };
  }

  return { ok: true, value: { name, length: length as number, revealStyle, movies, images } };
}

/** The part of a stored calendar a friend may see on `day`: everything up to tomorrow. */
export function visibleCalendar(stored: StoredCalendar, day: number): SharedCalendar {
  const firstDay = 25 - stored.length;
  const visibleTo = Math.min(24, Math.max(firstDay, Math.round(day)) + 1);
  const count = visibleTo - firstDay + 1;
  return {
    id: stored.id,
    name: stored.name,
    length: stored.length,
    revealStyle: stored.revealStyle,
    firstDay,
    movies: stored.movies.slice(0, count),
    images: stored.images.slice(0, count).map((key) => (key ? imageUrl(key) : null)),
    visibleTo,
  };
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

/** A short, unguessable id (≈ 70 bits) without look-alike characters. */
export function newId(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}
