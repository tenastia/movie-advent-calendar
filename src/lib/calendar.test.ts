import { describe, expect, it } from 'vitest';
import { getMonthWeeks, moveItem } from './calendar';

describe('getMonthWeeks', () => {
  it('lays out December 2026 Monday-first, as in the design', () => {
    const weeks = getMonthWeeks(2026, 11);
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);

    // Mon 30 Nov is borrowed from November; Tue 1 Dec starts the month.
    expect(weeks[0].map((c) => c.day)).toEqual([30, 1, 2, 3, 4, 5, 6]);
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks[0][1].inMonth).toBe(true);

    // Thu 31 Dec, then 1–3 Jan.
    expect(weeks[4].map((c) => c.day)).toEqual([28, 29, 30, 31, 1, 2, 3]);
    expect(weeks[4].map((c) => c.inMonth)).toEqual([true, true, true, true, false, false, false]);
  });

  it('adds a sixth row when the month needs it', () => {
    // December 2029 starts on a Saturday.
    const weeks = getMonthWeeks(2029, 11);
    expect(weeks).toHaveLength(6);
    expect(weeks[0].slice(5).map((c) => c.day)).toEqual([1, 2]);
  });

  it('needs no leading days when the month starts on a Monday', () => {
    // December 2025 starts on a Monday.
    const weeks = getMonthWeeks(2025, 11);
    expect(weeks[0][0]).toMatchObject({ day: 1, inMonth: true });
  });
});

describe('moveItem', () => {
  it('moves an item down', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item up', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns an unchanged copy for out-of-range or no-op moves', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 0, 0)).toEqual(items);
    expect(moveItem(items, 0, 5)).toEqual(items);
    expect(moveItem(items, -1, 1)).toEqual(items);
    expect(moveItem(items, 0, 1)).not.toBe(items);
  });
});
