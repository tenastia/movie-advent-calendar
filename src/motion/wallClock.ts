import { DAY } from './day'

/**
 * Real-time clock for the calendar page: seconds since local midnight.
 *
 * Two URL overrides make any moment of the day checkable on staging:
 *   ?time=03:00     start the day at 03:00 and run on from there
 *   ?speed=720      run 720× faster (720 plays the whole day in 2 minutes)
 */
export interface WallClockOptions {
  /** Seconds since midnight to start from; undefined = the real time. */
  start?: number
  speed: number
}

export function secondsSinceMidnight(d: Date) {
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000
}

/** "03:00", "3:00", "03:00:30" → seconds; anything else → undefined. */
export function parseTimeOfDay(value: string | null): number | undefined {
  const m = value?.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return undefined
  const [h, min, s] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)]
  if (h > 24 || min > 59 || s > 59) return undefined
  return Math.min(h * 3600 + min * 60 + s, DAY)
}

export function readClockOverrides(search: string): WallClockOptions {
  const q = new URLSearchParams(search)
  const speed = Number(q.get('speed'))
  return {
    start: parseTimeOfDay(q.get('time')),
    speed: Number.isFinite(speed) && speed > 0 ? speed : 1,
  }
}

/** Returns a function giving the current time of day in seconds (0 → 24:00). */
export function makeDayTime({ start, speed }: WallClockOptions, now: () => number = () => performance.now()) {
  if (start === undefined && speed === 1) return () => secondsSinceMidnight(new Date())
  const base = start ?? secondsSinceMidnight(new Date())
  const t0 = now()
  return () => {
    const t = base + ((now() - t0) / 1000) * speed
    return ((t % DAY) + DAY) % DAY
  }
}
