import type { Vector3 } from 'three'
import type { MotionParams } from '../params'

/**
 * A motion mode supplies the letters' free flight (GLSL) and the camera path.
 * Both must be pure functions of the time of day: the lab scrubs freely.
 *
 * The GLSL chunk must define `Flight flight(float t, float release)`: where a
 * letter is before its release (on the number), while it leaves, and while it
 * drifts. The shared shader handles the return into the title, the hold and
 * the midnight crossfade. Any uniform named after a param in SPEC is filled
 * automatically.
 *
 * `camera` must leave the camera at rest (offset 0) at decay start and from
 * assemble end on. `span` is day-seconds per frame while fast-previewing
 * (0 = exact); use `damp()` from day.ts on oscillations.
 */
export interface MotionMode {
  id: string
  label: string
  glsl: string
  camera: (t: number, p: MotionParams, baseDistance: number, span: number, pos: Vector3, target: Vector3) => void
}
