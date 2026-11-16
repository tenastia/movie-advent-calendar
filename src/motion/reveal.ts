import { useEffect, useState } from 'react';
import { daySchedule } from './day';
import { DEFAULT_PRESET } from './presets';
import { makeDayTime, readClockOverrides } from './wallClock';

/**
 * When today's title is complete, in seconds after local midnight. It comes
 * from the calendar's motion preset ("assemble end"), so the cards and the
 * letter motion always agree.
 */
export const REVEAL_AT = daySchedule(DEFAULT_PRESET.params).assemble1;

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
  const [dayTime] = useState(() => makeDayTime(readClockOverrides(window.location.search)));
  const [revealed, setRevealed] = useState(() => dayTime() >= REVEAL_AT);

  useEffect(() => {
    const id = window.setInterval(() => setRevealed(dayTime() >= REVEAL_AT), 1000);
    return () => window.clearInterval(id);
  }, [dayTime]);

  return revealed;
}
