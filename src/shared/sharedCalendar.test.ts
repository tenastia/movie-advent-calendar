import { describe, expect, it } from 'vitest';
import { newId, parseCalendarInput, visibleCalendar, type StoredCalendar } from './sharedCalendar';

const six = ['Klaus', 'Fargo', 'Carol', 'Elf', 'Alien', 'House'];

describe('parseCalendarInput', () => {
  it('accepts a complete calendar and tidies it', () => {
    const result = parseCalendarInput({ name: '  Winter  ', length: 6, revealStyle: 'drifting', movies: six.map((m) => ` ${m}  `) });
    expect(result).toEqual({
      ok: true,
      value: { name: 'Winter', length: 6, revealStyle: 'drifting', movies: six, images: [null, null, null, null, null, null] },
    });
  });

  it('explains what is missing', () => {
    expect(parseCalendarInput({ name: '', length: 6, revealStyle: 'drifting', movies: six })).toMatchObject({ ok: false, error: 'Give the calendar a name.' });
    expect(parseCalendarInput({ name: 'x', length: 7, revealStyle: 'drifting', movies: six })).toMatchObject({ ok: false });
    expect(parseCalendarInput({ name: 'x', length: 6, revealStyle: 'drifting', movies: ['a', '', 'c', ' ', 'e', 'f'] })).toMatchObject({
      ok: false,
      error: 'Add a movie for each day (2 to go).',
    });
    expect(parseCalendarInput({ name: 'x', length: 6, revealStyle: 'neon', movies: six })).toMatchObject({ ok: false });
  });

  it('needs a photo for every day in the Image style', () => {
    const images = ['abcdefghij12', null, null, null, null, null];
    expect(parseCalendarInput({ name: 'x', length: 6, revealStyle: 'image', movies: six, images })).toMatchObject({
      ok: false,
      error: 'Add a photo for each day (5 to go).',
    });
    expect(parseCalendarInput({ name: 'x', length: 6, revealStyle: 'drifting', movies: six, images: ['../etc', null, null, null, null, null] })).toMatchObject({ ok: false });
  });
});

describe('visibleCalendar', () => {
  const stored: StoredCalendar = {
    id: 'abc',
    name: 'Winter',
    length: 6,
    revealStyle: 'drifting',
    movies: six,
    images: ['abcdefghij12', null, null, null, null, null],
    createdAt: '2026-11-26T00:00:00Z',
  };

  it('shows the days up to tomorrow only', () => {
    const shared = visibleCalendar(stored, 20); // 6 days run 19–24
    expect(shared.firstDay).toBe(19);
    expect(shared.visibleTo).toBe(21);
    expect(shared.movies).toEqual(['Klaus', 'Fargo', 'Carol']);
    expect(shared.images).toEqual(['/api/images/abcdefghij12', null, null]);
  });

  it('before the calendar starts, shows its first day and the next', () => {
    expect(visibleCalendar(stored, 9).movies).toEqual(['Klaus', 'Fargo']);
  });

  it('shows everything on Christmas Eve', () => {
    expect(visibleCalendar(stored, 24).movies).toEqual(six);
  });
});

describe('newId', () => {
  it('makes distinct ids without look-alike characters', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId()));
    expect(ids.size).toBe(200);
    for (const id of ids) expect(id).toMatch(/^[A-HJ-NP-Za-km-z2-9]{12}$/);
  });
});
