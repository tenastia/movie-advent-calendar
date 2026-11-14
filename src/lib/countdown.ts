const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a duration as `DD : HH : MM : SS`, the format used in the header pill. */
export function formatCountdown(ms: number): string {
  const remaining = Math.max(0, ms);
  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / HOUR);
  const minutes = Math.floor((remaining % HOUR) / MINUTE);
  const seconds = Math.floor((remaining % MINUTE) / SECOND);
  return [days, hours, minutes, seconds].map(pad).join(' : ');
}

/** Machine-readable ISO 8601 duration for `<time dateTime>`. */
export function toIsoDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / SECOND);
  return `PT${totalSeconds}S`;
}

const DECEMBER = 11;

/**
 * The Christmas to count down to: midnight starting 25 December, local time.
 * Through Christmas Day this is the current year's (so the countdown rests at
 * zero on the day itself); from 26 December it is next year's.
 */
export function getChristmasTarget(now: Date): Date {
  const year = now.getFullYear();
  const dayAfterChristmas = new Date(year, DECEMBER, 26);
  return new Date(now < dayAfterChristmas ? year : year + 1, DECEMBER, 25);
}
