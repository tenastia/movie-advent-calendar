import type { Vector3 } from 'three'
import { damp, daySchedule, smoothstep } from '../day'
import type { MotionParams } from '../params'
import type { MotionMode } from './types'
import glsl from './explosion.glsl?raw'

/**
 * Slow camera drift as a closed-form function of the time of day: a gentle
 * orbit sway, positional wander and a push-in. It eases in over the first half
 * of the decay and is fully back home by assemble end, so the title shows at
 * exactly the on-screen size the number had at the start of the day.
 */
function camera(t: number, p: MotionParams, baseDistance: number, span: number, pos: Vector3, target: Vector3) {
  const s = daySchedule(p)
  const amt =
    smoothstep(s.decay0, s.decay0 + 0.5 * (s.decay1 - s.decay0), t) * (1 - smoothstep(s.decay1, s.assemble1, t))

  const w = Math.PI * 2 * p.driftSpeed
  const sway = amt * damp(w, span, 0.1)
  const orbit = (p.orbit * Math.PI) / 180
  const yaw = orbit * Math.sin(w * t * 0.8 + 0.4) * sway
  const pitch = orbit * 0.45 * Math.sin(w * t * 0.55 + 1.9) * sway
  const dist = baseDistance - p.dolly * amt
  const drift = p.cameraDrift * sway

  pos.set(
    Math.sin(yaw) * Math.cos(pitch) * dist + Math.sin(w * t + 1.3) * drift,
    Math.sin(pitch) * dist + Math.sin(w * t * 0.77 + 0.2) * drift * 0.6,
    Math.cos(yaw) * Math.cos(pitch) * dist + Math.sin(w * t * 0.61 + 2.4) * drift * 0.5,
  )
  target.set(Math.sin(w * t * 0.9 + 2.1) * drift * 0.35, Math.sin(w * t * 0.67 + 0.9) * drift * 0.2, 0)
}

export const explosion: MotionMode = {
  id: 'explosion',
  label: 'Explosion',
  glsl,
  camera,
}
