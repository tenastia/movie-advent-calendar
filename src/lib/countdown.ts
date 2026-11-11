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

/**
 * Next occurrence of a daily reveal time ("HH:MM", local time) strictly after `now`.
 */
export function getNextRevealAt(now: Date, revealTime: string): Date {
  const [hours, minutes] = revealTime.split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}
