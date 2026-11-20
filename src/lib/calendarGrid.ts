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
