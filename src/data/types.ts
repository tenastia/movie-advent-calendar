export type DayStatus = 'guessed' | 'missed';

export interface CalendarDay {
  day: number;
  title: string;
  status: DayStatus;
}

export interface RevealImage {
  src: string;
  alt: string;
  /**
   * Optional crop of the source image inside the 638×441 reveal frame,
   * as CSS lengths for the image's box (e.g. `{ width: '187.5%', left: '-43.75%' }`).
   * When omitted, the image covers the frame.
   */
  crop?: { width: string; height: string; left: string; top: string };
}

export interface Calendar {
  owner: string;
  /** Daily reveal time, "HH:MM" in local time. */
  revealTime: string;
  attemptsPerDay: number;
  today: {
    day: number;
    reveal: RevealImage;
  };
  /** Days already revealed, oldest first. */
  days: CalendarDay[];
}
