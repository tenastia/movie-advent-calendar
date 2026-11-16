import { describe, expect, it } from 'vitest';
import { formatRevealTime, REVEAL_AT } from './reveal';

describe('formatRevealTime', () => {
  it('formats whole hours without minutes', () => {
    expect(formatRevealTime(12 * 3600)).toBe('12pm');
    expect(formatRevealTime(0)).toBe('12am');
    expect(formatRevealTime(9 * 3600)).toBe('9am');
    expect(formatRevealTime(19 * 3600)).toBe('7pm');
  });

  it('adds minutes when needed', () => {
    expect(formatRevealTime(18.5 * 3600)).toBe('6:30pm');
    expect(formatRevealTime(6 * 3600 + 5 * 60)).toBe('6:05am');
  });
});

describe('REVEAL_AT', () => {
  it('matches the calendar preset, where the title completes at noon', () => {
    expect(formatRevealTime(REVEAL_AT)).toBe('12pm');
  });
});
