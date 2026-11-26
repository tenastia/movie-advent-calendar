import { describe, expect, it } from 'vitest';
import { buildCalendar } from './buildCalendar';
import { movieLists } from './movieLists';

const [nastia, dread] = movieLists;

describe('buildCalendar', () => {
  it('puts a 24-day list on 1–24 December', () => {
    const calendar = buildCalendar(nastia, 9, {});
    expect(calendar.today).toMatchObject({ day: 9, title: 'Tokyo Godfathers', nextTitle: 'Amélie' });
    expect(calendar.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(calendar.days[0]).toMatchObject({ title: 'Klaus' });
  });

  it('starts a 12-day list on 13 December, showing its first day until then', () => {
    expect(buildCalendar(dread, 9, {}).today).toMatchObject({ day: 13, title: 'Nosferatu' });
    expect(buildCalendar(dread, 15, {}).today).toMatchObject({ day: 15, title: 'The Innocents' });
    expect(buildCalendar(dread, 15, {}).days.map((d) => d.title)).toEqual(['Nosferatu', 'Psycho', 'The Innocents']);
  });

  it('has no next title on Christmas Eve', () => {
    const calendar = buildCalendar(nastia, 24, {});
    expect(calendar.today).toMatchObject({ day: 24, title: 'The Intouchables' });
    expect(calendar.today.nextTitle).toBeUndefined();
  });

  it('marks days guessed only when a guess was right', () => {
    const calendar = buildCalendar(nastia, 3, {
      1: { guesses: ['Klaus'], solved: true },
      2: { guesses: ['a', 'b', 'c'], solved: false },
    });
    expect(calendar.days.map((d) => d.status)).toEqual(['guessed', 'missed', 'missed']);
  });
});
