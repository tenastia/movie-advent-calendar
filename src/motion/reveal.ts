import { useEffect, useState } from 'react';
import { daySchedule } from './day';
import { DEFAULT_PRESET } from './presets';
import { makeDayTime, readClockOverrides } from './wallClock';

const SCHEDULE = daySchedule(DEFAULT_PRESET.params);

/**
 * When today's title is complete, in seconds after local midnight. It comes
 * from the calendar's motion preset ("assemble end"), so the cards and the
 * letter motion always agree.
 */
export const REVEAL_AT = SCHEDULE.assemble1;

/** When the day's motion starts (the number begins to come apart). */
export const MOTION_START = SCHEDULE.decay0;

/** 0 → 1 from the start of the day's motion to the reveal; 1 once the title is in place. */
export function revealProgress(dayTime: number) {
  return Math.min(1, Math.max(0, (dayTime - MOTION_START) / (REVEAL_AT - MOTION_START)));
}

/** The motion's clock: seconds since midnight, honouring `?time=` and `?speed=`. */
export function createDayClock() {
  return makeDayTime(readClockOverrides(window.location.search));
}

/** 43200 → "12pm", 66600 → "6:30pm", 0 → "12am". */
export function formatRevealTime(seconds: number) {
  const totalMinutes = Math.round(seconds / 60) % (24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? 'am' : 'pm';
  return m === 0 ? `${hour12}${suffix}` : `${hour12}:${String(m).padStart(2, '0')}${suffix}`;
}

/**
 * Whether today's movie has been revealed, on the same clock as the letter
 * motion (so `?time=` and `?speed=` work here too).
 */
export function useIsRevealed() {
  const [dayTime] = useState(createDayClock);
  const [revealed, setRevealed] = useState(() => dayTime() >= REVEAL_AT);

  useEffect(() => {
    const id = window.setInterval(() => setRevealed(dayTime() >= REVEAL_AT), 1000);
    return () => window.clearInterval(id);
  }, [dayTime]);

  return revealed;
}
