import { explosion } from './explosion'
import type { MotionMode } from './types'

export type { MotionMode } from './types'

// Blizzard and Image slot in here once Explosion is tuned.
export const MODES: Record<string, MotionMode> = {
  explosion,
}

export const MODE_IDS = Object.keys(MODES)

export function getMode(id: string): MotionMode {
  return MODES[id] ?? explosion
}
