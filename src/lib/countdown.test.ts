import { describe, expect, it } from 'vitest';
import { formatCountdown, getChristmasTarget, toIsoDuration } from './countdown';

describe('formatCountdown', () => {
  it('formats days, hours, minutes and seconds as zero-padded pairs', () => {
    const ms = ((71 * 24 + 23) * 3600 + 22 * 60 + 11) * 1000;
    expect(formatCountdown(ms)).toBe('71 : 23 : 22 : 11');
  });

  it('pads single digits', () => {
    expect(formatCountdown((1 * 3600 + 2 * 60 + 3) * 1000)).toBe('00 : 01 : 02 : 03');
  });

  it('never goes negative', () => {
    expect(formatCountdown(-5000)).toBe('00 : 00 : 00 : 00');
  });

  it('drops partial seconds', () => {
    expect(formatCountdown(1999)).toBe('00 : 00 : 00 : 01');
  });
});

describe('toIsoDuration', () => {
  it('returns whole seconds', () => {
    expect(toIsoDuration(61_500)).toBe('PT61S');
  });
});

describe('getChristmasTarget', () => {
  const christmas2026 = new Date(2026, 11, 25);

  it('targets this year’s Christmas before it arrives', () => {
    expect(getChristmasTarget(new Date(2026, 10, 13, 9, 30))).toEqual(christmas2026);
    expect(getChristmasTarget(new Date(2026, 0, 1))).toEqual(christmas2026);
  });

  it('counts down to the very last second of Christmas Eve', () => {
    const now = new Date(2026, 11, 24, 23, 59, 59);
    expect(getChristmasTarget(now)).toEqual(christmas2026);
    expect(formatCountdown(getChristmasTarget(now).getTime() - now.getTime())).toBe('00 : 00 : 00 : 01');
  });

  it('rests at zero throughout Christmas Day', () => {
    const now = new Date(2026, 11, 25, 18, 0);
    expect(getChristmasTarget(now)).toEqual(christmas2026);
    expect(formatCountdown(getChristmasTarget(now).getTime() - now.getTime())).toBe('00 : 00 : 00 : 00');
  });

  it('moves on to next year’s Christmas from 26 December', () => {
    expect(getChristmasTarget(new Date(2026, 11, 26))).toEqual(new Date(2027, 11, 25));
  });

  it('shows the full day count from mid-November', () => {
    const now = new Date(2026, 10, 13, 12, 0, 0);
    expect(formatCountdown(getChristmasTarget(now).getTime() - now.getTime())).toBe('41 : 12 : 00 : 00');
  });
});
