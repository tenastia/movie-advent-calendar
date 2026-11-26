import { describe, expect, it } from 'vitest';
import { getCalendarDay, PREVIEW_DAY, readDayOverride } from './calendarDay';

describe('getCalendarDay', () => {
  it('follows the date in December, stopping at Christmas Eve', () => {
    expect(getCalendarDay(new Date(2026, 11, 1))).toBe(1);
    expect(getCalendarDay(new Date(2026, 11, 17, 23, 59))).toBe(17);
    expect(getCalendarDay(new Date(2026, 11, 31))).toBe(24);
  });

  it('shows the preview day the rest of the year', () => {
    expect(getCalendarDay(new Date(2026, 10, 26))).toBe(PREVIEW_DAY);
    expect(getCalendarDay(new Date(2027, 0, 2))).toBe(PREVIEW_DAY);
  });

  it('lets ?day= pick any day', () => {
    expect(getCalendarDay(new Date(2026, 10, 26), 20)).toBe(20);
  });
});

describe('readDayOverride', () => {
  it('reads 1–24 and ignores anything else', () => {
    expect(readDayOverride('?day=13')).toBe(13);
    expect(readDayOverride('?time=03:00&day=1')).toBe(1);
    expect(readDayOverride('?day=0')).toBeUndefined();
    expect(readDayOverride('?day=25')).toBeUndefined();
    expect(readDayOverride('?day=abc')).toBeUndefined();
    expect(readDayOverride('')).toBeUndefined();
  });
});
