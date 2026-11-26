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
  id: string;
  name: string;
  description: string;
  /** Number of days (movies), counting down to Christmas Eve. */
  length: number;
  /** Daily reveal time, "HH:MM" in local time. */
  revealTime: string;
  attemptsPerDay: number;
  revealStyle: RevealStyle;
  /** First December day (25 − length). */
  firstDay: number;
  /** False before the first day: no movie yet, the home page shows the snowfall. */
  started: boolean;
  today: {
    day: number;
    /** Today's movie: the answer, and the letters the day's number is made of. */
    title: string;
    /** Tomorrow's movie; its letters form the number that fades in at midnight. */
    nextTitle?: string;
    reveal: RevealImage;
  };
  /** Days already revealed, oldest first. */
  days: CalendarDay[];
}

/** How a calendar reveals each day: letter motion presets, or a photo per day. */
export type RevealStyle = 'drifting' | 'blizzard' | 'image';
