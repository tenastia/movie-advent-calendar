/** The day shown outside December (as in the designs), so the calendars can be tried any time. */
export const PREVIEW_DAY = 9;

/**
 * `?day=N` picks the December day to show, for testing: 1–24, or 0 for
 * before 1 December (no calendar has started yet).
 */
export function readDayOverride(search: string): number | undefined {
  const value = new URLSearchParams(search).get('day');
  const day = Number(value);
  return value !== null && value !== '' && Number.isInteger(day) && day >= 0 && day <= 24 ? day : undefined;
}

/**
 * The December day the calendars are on: today's date from 1 to 24 December,
 * Christmas Eve after that, and PREVIEW_DAY the rest of the year.
 */
export function getCalendarDay(now: Date, override?: number): number {
  if (override !== undefined) return override;
  if (now.getMonth() === 11) return Math.min(now.getDate(), 24);
  return PREVIEW_DAY;
}
