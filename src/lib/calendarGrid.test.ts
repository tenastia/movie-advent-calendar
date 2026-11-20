import { describe, expect, it } from 'vitest';
import { getMonthWeeks } from './calendarGrid';

const label = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

describe('getMonthWeeks', () => {
  it('lays out December 2026 Monday-first, as in the design', () => {
    const weeks = getMonthWeeks(2026, 11);
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(label(weeks[0][0].date)).toBe('11/30');
    expect(weeks[0][0].inMonth).toBe(false);
    expect(label(weeks[0][1].date)).toBe('12/1');
    expect(label(weeks[4][6].date)).toBe('1/3');
    expect(weeks.flat().filter((cell) => cell.inMonth)).toHaveLength(31);
  });

  it('needs no padding when the month starts on a Monday and fills whole weeks', () => {
    const weeks = getMonthWeeks(2027, 1); // February 2027
    expect(weeks).toHaveLength(4);
    expect(weeks.flat().every((cell) => cell.inMonth)).toBe(true);
  });
});
