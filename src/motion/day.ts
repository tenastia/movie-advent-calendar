import type { MotionParams } from './params'

/** The lab clock is the time of day in seconds: 0 = 00:00, DAY = 24:00. */
export const DAY = 24 * 3600

/** Lab speed that plays the full 24 hours in 2 minutes. */
export const DAY_IN_TWO_MINUTES = DAY / 120

export interface DaySchedule {
  /** Seconds of the day. decay0 < decay1 < assemble1 <= DAY. */
  decay0: number
  decay1: number
  assemble1: number
  /** Midnight crossfade length (s), ending at 24:00 and never starting before assemble1. */
  fade: number
}

/** Schedule boundaries from the preset (hours), ordered and clamped. */
export function daySchedule(p: Pick<MotionParams, 'decayStart' | 'decayEnd' | 'assembleEnd' | 'crossfade'>): DaySchedule {
  const decay0 = Math.min(Math.max(p.decayStart, 0), 23.5) * 3600
  const decay1 = Math.min(Math.max(p.decayEnd * 3600, decay0 + 60), DAY - 60)
  const assemble1 = Math.min(Math.max(p.assembleEnd * 3600, decay1 + 60), DAY)
  const fade = Math.max(1, Math.min(p.crossfade, DAY - assemble1))
  return { decay0, decay1, assemble1, fade }
}

export const smoothstep = (a: number, b: number, x: number) => {
  if (a === b) return x < a ? 0 : 1
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** 0 → 1 over the midnight crossfade (title → next day's number). */
export function midnightFade(t: number, s: DaySchedule) {
  return smoothstep(DAY - s.fade, DAY, t)
}

/**
 * Fast-preview smoothing, same as `damp()` in the vertex shader. `span` is
 * day-seconds per frame (0 = exact). An oscillation at `w` rad/s keeps full
 * amplitude while it moves less than `c` radians per frame, then fades out.
 */
export function damp(w: number, span: number, c: number) {
  const x = (w * span) / c
  return x <= 1 ? 1 : 1 / (x * x)
}

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')

/** 23456.7 → "06:30:56". */
export function formatClock(t: number, seconds = true) {
  const s = Math.max(0, Math.min(DAY, t))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return seconds ? `${pad(h)}:${pad(m)}:${pad(s % 60)}` : `${pad(h)}:${pad(m)}`
}

/** A gap between events in words: "19.1 s", "4.5 min", "1.2 h". */
export function formatGap(sec: number) {
  if (!Number.isFinite(sec)) return '—'
  if (sec < 90) return `${sec.toFixed(sec < 10 ? 2 : 1)} s`
  if (sec < 5400) return `${(sec / 60).toFixed(1)} min`
  return `${(sec / 3600).toFixed(1)} h`
}
