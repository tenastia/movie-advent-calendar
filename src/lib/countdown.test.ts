import { describe, expect, it } from 'vitest';
import { formatCountdown, getNextRevealAt, toIsoDuration } from './countdown';

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

describe('getNextRevealAt', () => {
  it('returns today when the reveal time is still ahead', () => {
    const now = new Date(2026, 11, 9, 10, 30);
    expect(getNextRevealAt(now, '19:00')).toEqual(new Date(2026, 11, 9, 19, 0));
  });

  it('rolls over to tomorrow once the reveal time has passed', () => {
    const now = new Date(2026, 11, 9, 19, 0);
    expect(getNextRevealAt(now, '19:00')).toEqual(new Date(2026, 11, 10, 19, 0));
  });

  it('rolls over across month boundaries', () => {
    const now = new Date(2026, 10, 30, 20, 0);
    expect(getNextRevealAt(now, '19:00')).toEqual(new Date(2026, 11, 1, 19, 0));
  });
});
