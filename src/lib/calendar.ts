export interface CalendarCell {
  date: Date;
  /** Day of the month (1–31). */
  day: number;
  /** False for the leading/trailing days borrowed from the neighbouring months. */
  inMonth: boolean;
}

/**
 * Weeks of a month as rows of 7 cells, Monday first, padded with the
 * neighbouring months' days so every row is complete.
 */
export function getMonthWeeks(year: number, monthIndex: number): CalendarCell[][] {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // getDay(): Sunday = 0. Shift so Monday = 0.
  const leading = (first.getDay() + 6) % 7;
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, monthIndex, 1 - leading + i);
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push({
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
    });
  }
  return weeks;
}

/** Returns a copy of `items` with the element at `from` moved to index `to`. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  if (from === to || from < 0 || from >= next.length || to < 0 || to >= next.length) {
    return next;
  }
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
