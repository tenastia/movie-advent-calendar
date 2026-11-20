export interface CalendarCell {
  date: Date;
  /** False for the leading/trailing days borrowed from the neighbouring months. */
  inMonth: boolean;
}

/**
 * Monday-first weeks covering every day of a month (`month` is 0-based),
 * padded with days from the neighbouring months to fill the first and last week.
 */
export function getMonthWeeks(year: number, month: number): CalendarCell[][] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil((offset + daysInMonth) / 7);

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(year, month, 1 - offset + week * 7 + weekday);
      return { date, inMonth: date.getMonth() === month };
    }),
  );
}

/** Every calendar counts down to Christmas, so its last day is always Christmas Eve. */
export const COUNTDOWN_LAST_DAY = 24;

/**
 * The December days a calendar of `length` days covers: the run of days that
 * ends on Christmas Eve (e.g. 6 days → 19–24 December). Matches the desktop Create page.
 */
export function getCountdownRange(length: number): { first: number; last: number } {
  const days = Math.min(Math.max(Math.round(length), 1), COUNTDOWN_LAST_DAY);
  return { first: COUNTDOWN_LAST_DAY - days + 1, last: COUNTDOWN_LAST_DAY };
}
