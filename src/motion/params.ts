/**
 * Single source of truth for every tunable motion parameter.
 *
 * Each entry drives three things at once:
 *  - the leva control (min/max/step/label/hint, grouped into folders),
 *  - the preset JSON (keys are the param names),
 *  - the shader uniform when `uniform: true` (name = "u" + Capitalized key).
 *
 * Distances are world units: the day number is always 10 units tall, and the
 * camera distance is derived so the number fills `numberFill` of the frame.
 * Schedule params are hours; the shader gets them as seconds via day.ts.
 */

export type ParamGroup =
  | 'Layout'
  | 'Schedule'
  | 'Decay'
  | 'Field'
  | 'Assemble'
  | 'Hold'
  | 'Camera'
  | 'Lens'
  | 'Look'

type NumberSpec = {
  group: ParamGroup
  value: number
  min: number
  max: number
  step?: number
  label?: string
  hint?: string
  uniform?: boolean
}
type ColorSpec = { group: ParamGroup; value: string; color: true; label?: string; hint?: string; uniform?: boolean }
type SelectSpec = { group: ParamGroup; value: string; options: readonly string[]; label?: string; hint?: string }
type BoolSpec = { group: ParamGroup; value: boolean; label?: string; hint?: string; uniform?: boolean }
export type ParamSpec = NumberSpec | ColorSpec | SelectSpec | BoolSpec

// Time is the time of day in seconds (0 = 00:00, 86400 = 24:00). Durations
// below are in seconds of that day clock unless the label says minutes or hours.
export const SPEC = {
  // ── Layout: how the number and the title are built (rebuilds instances) ──
  seed: { group: 'Layout', value: 7, min: 1, max: 9999, step: 1, hint: 'Shuffles letters and every per-letter random' },
  gridRows: { group: 'Layout', value: 26, min: 8, max: 64, step: 1, label: 'rows', hint: 'Lines of letters across the number height' },
  fillThreshold: { group: 'Layout', value: 0.5, min: 0.05, max: 0.95, step: 0.01, label: 'fill', hint: 'Ink coverage a grid cell needs to get a letter' },
  tracking: { group: 'Layout', value: 1.0, min: 0.7, max: 2, step: 0.01, hint: 'Letter spacing of the number grid (the title uses it too)' },
  lineSpacing: { group: 'Layout', value: 1.0, min: 0.7, max: 2, step: 0.01, label: 'line spacing' },
  numberFont: { group: 'Layout', value: 'Inter', options: ['Inter', 'JetBrains Mono', 'sans-serif', 'serif'], label: 'number font' },
  numberWeight: { group: 'Layout', value: 900, min: 100, max: 900, step: 100, label: 'number weight' },
  numberFill: { group: 'Layout', value: 0.72, min: 0.3, max: 1, step: 0.01, label: 'number fill', hint: 'Share of the frame the number fills (sets camera distance)' },
  glyphFont: { group: 'Layout', value: 'JetBrains Mono', options: ['JetBrains Mono', 'monospace'], label: 'glyph font' },
  glyphWeight: { group: 'Layout', value: 700, min: 100, max: 800, step: 100, label: 'glyph weight' },
  uppercase: { group: 'Layout', value: true },
  titleMaxLines: { group: 'Layout', value: 2, min: 1, max: 4, step: 1, label: 'title lines', hint: 'The title wraps (at spaces) when wider than the number grid' },
  titleLineSpacing: { group: 'Layout', value: 1.5, min: 1, max: 4, step: 0.05, label: 'title line gap', hint: 'Distance between title lines, in number-grid rows' },

  // ── Schedule: boundaries of the day, in hours ──
  decayStart: { group: 'Schedule', value: 0, min: 0, max: 23.75, step: 0.25, label: 'decay start (h)', hint: 'The number starts coming apart' },
  decayEnd: { group: 'Schedule', value: 6, min: 0.25, max: 24, step: 0.25, label: 'decay end (h)', hint: 'Last letter released; assembly starts' },
  assembleEnd: { group: 'Schedule', value: 12, min: 0.5, max: 24, step: 0.25, label: 'assemble end (h)', hint: 'Title complete; hold until 24:00' },
  crossfade: { group: 'Schedule', value: 120, min: 1, max: 3600, step: 1, label: 'midnight fade (s)', hint: 'Title → next day’s number, ending at 24:00 (also the reduced-motion crossfade)' },

  // ── Decay: erosion order + how one letter leaves ──
  erosionNoise: { group: 'Decay', value: 0.4, min: 0, max: 1, step: 0.01, label: 'edge ↔ noise', hint: '0 = strictly outline first, 1 = pure noise order' },
  erosionScale: { group: 'Decay', value: 5, min: 1, max: 30, step: 0.5, label: 'noise size', hint: 'Size of the ragged front’s bites, in grid rows' },
  trembleDuration: { group: 'Decay', value: 3, min: 0, max: 30, step: 0.1, uniform: true, label: 'tremble (s)' },
  trembleAmount: { group: 'Decay', value: 0.05, min: 0, max: 0.4, step: 0.005, uniform: true, label: 'tremble size', hint: 'Shiver amplitude, in letter heights' },
  peelDuration: { group: 'Decay', value: 8, min: 0.5, max: 120, step: 0.5, uniform: true, label: 'peel (s)', hint: 'Slow lift off the surface' },
  peelLift: { group: 'Decay', value: 0.8, min: 0, max: 5, step: 0.05, uniform: true, label: 'peel lift', hint: 'Lift toward the camera, in letter heights' },
  peelTilt: { group: 'Decay', value: 35, min: 0, max: 120, step: 1, uniform: true, label: 'peel tilt (°)', hint: 'Curl of the letter as it peels' },
  riseAngle: { group: 'Decay', value: 10, min: -180, max: 180, step: 1, uniform: true, label: 'rise dir (°)', hint: '0 = straight up, 90 = right, −90 = left' },
  riseSpread: { group: 'Decay', value: 25, min: 0, max: 180, step: 1, uniform: true, label: 'rise spread (°)', hint: 'Per-letter variation of the rise direction' },
  riseHeight: { group: 'Decay', value: 5, min: 0, max: 30, step: 0.1, uniform: true, label: 'rise', hint: 'Climb before it curves into the field (number is 10 tall)' },
  driftAway: { group: 'Decay', value: 150, min: 5, max: 1800, step: 5, uniform: true, label: 'drift away (s)', hint: 'Ease-in drift from the peel until it joins the field' },
  turbulence: { group: 'Decay', value: 1.5, min: 0, max: 8, step: 0.05, uniform: true, hint: 'Curl-noise swirl, world units' },
  turbulenceScale: { group: 'Decay', value: 0.15, min: 0.01, max: 1, step: 0.01, uniform: true, label: 'turb. scale', hint: 'Higher = smaller, tighter swirls' },
  tumbleSpeed: { group: 'Decay', value: 0.35, min: 0, max: 3, step: 0.01, uniform: true, label: 'tumble speed', hint: 'Slow 3D tumble (rad/s), spins up from rest' },

  // ── Field: where released letters drift ──
  fieldRadius: { group: 'Field', value: 9, min: 1, max: 40, step: 0.1, uniform: true, label: 'radius', hint: 'Spread of the field around the number' },
  depthSpread: { group: 'Field', value: 1.8, min: 0, max: 4, step: 0.05, uniform: true, label: 'depth spread', hint: 'Stretches the field along the view axis' },
  fieldDepth: { group: 'Field', value: 6, min: -20, max: 40, step: 0.1, uniform: true, label: 'depth offset', hint: 'Pushes the field away from the camera' },
  drift: { group: 'Field', value: 1.5, min: 0, max: 8, step: 0.05, uniform: true, label: 'wander', hint: 'Slow drift around each letter’s place, world units' },
  driftPeriod: { group: 'Field', value: 90, min: 5, max: 1800, step: 5, uniform: true, label: 'wander period (s)' },
  flightScale: { group: 'Field', value: 0.5, min: -0.5, max: 3, step: 0.01, uniform: true, label: 'flight scale', hint: 'Letters grow by this much in the field' },
  sizeJitter: { group: 'Field', value: 0.4, min: 0, max: 1.5, step: 0.01, uniform: true, label: 'size jitter' },
  brightnessJitter: { group: 'Field', value: 0.45, min: 0, max: 1, step: 0.01, uniform: true, label: 'dim jitter', hint: 'Random dimming of letters in the field' },

  // ── Assemble: letters fly back into the title ──
  approach: { group: 'Assemble', value: 3, min: 0.1, max: 60, step: 0.1, uniform: true, label: 'approach (min)', hint: 'Each letter starts flying back this long before it lands' },
  assembleEase: { group: 'Assemble', value: 3, min: 1, max: 8, step: 0.1, uniform: true, label: 'ease power', hint: 'In-out ease exponent of the return' },
  assembleArc: { group: 'Assemble', value: 0.3, min: 0, max: 1.5, step: 0.01, uniform: true, label: 'arc', hint: 'Curves the return path' },
  extraLetters: { group: 'Assemble', value: 'stack', options: ['stack', 'stay'], label: 'extra letters', hint: 'stack = they return onto a matching slot · stay = they keep drifting, dimmed' },
  stayDim: { group: 'Assemble', value: 0.3, min: 0, max: 1, step: 0.01, uniform: true, label: 'stay dim', hint: 'Opacity of left-over letters in “stay” mode' },

  // ── Hold: the finished title ──
  breathe: { group: 'Hold', value: 0.012, min: 0, max: 0.1, step: 0.001, uniform: true, hint: 'Scale swing of the resting title' },
  breathePeriod: { group: 'Hold', value: 9, min: 1, max: 60, step: 0.5, uniform: true, label: 'breath (s)' },
  breatheWave: { group: 'Hold', value: 0.35, min: 0, max: 2, step: 0.01, uniform: true, label: 'breath wave', hint: 'Phase offset across the title; 0 = all letters together' },

  // ── Camera (evaluated on the CPU as a closed-form function of time) ──
  fov: { group: 'Camera', value: 38, min: 15, max: 90, step: 1 },
  cameraDrift: { group: 'Camera', value: 1.2, min: 0, max: 6, step: 0.05, label: 'drift', hint: 'Slow positional sway, world units' },
  driftSpeed: { group: 'Camera', value: 0.03, min: 0.002, max: 0.5, step: 0.001, label: 'drift speed', hint: 'Sway frequency (Hz)' },
  orbit: { group: 'Camera', value: 9, min: 0, max: 45, step: 0.5, hint: 'Orbit sway amplitude (deg)' },
  dolly: { group: 'Camera', value: 3, min: -10, max: 15, step: 0.1, hint: 'Push-in during the day, world units. Always back home by assemble end' },

  // ── Lens: fake depth of field + fog ──
  focusOffset: { group: 'Lens', value: 0, min: -15, max: 15, step: 0.1, label: 'focus offset', hint: 'Shift focus from the title plane' },
  focusRange: { group: 'Lens', value: 1.5, min: 0, max: 10, step: 0.05, uniform: true, label: 'focus range', hint: 'Half-width of the sharp band' },
  blurStrength: { group: 'Lens', value: 0.11, min: 0, max: 1, step: 0.005, uniform: true, label: 'blur', hint: 'Blur growth per unit of depth off focus' },
  farBlur: { group: 'Lens', value: 0.5, min: 0, max: 2, step: 0.01, uniform: true, label: 'far blur', hint: 'Blur multiplier behind the focus plane' },
  blurMax: { group: 'Lens', value: 0.9, min: 0, max: 1, step: 0.01, label: 'blur max', hint: 'Cap, as a share of the SDF headroom' },
  bokehGrow: { group: 'Lens', value: 0.8, min: 0, max: 3, step: 0.01, uniform: true, label: 'bokeh grow', hint: 'Defocused letters swell by this much' },
  bokehDim: { group: 'Lens', value: 0.45, min: 0, max: 1, step: 0.01, uniform: true, label: 'bokeh dim', hint: 'Defocused letters lose this much opacity' },
  fogStart: { group: 'Lens', value: 5, min: -10, max: 40, step: 0.1, uniform: true, label: 'fog start', hint: 'Fog begins this far behind focus' },
  fogLength: { group: 'Lens', value: 32, min: 1, max: 120, step: 0.5, uniform: true, label: 'fog length', hint: 'Depth over which letters fade to black' },
  nearFade: { group: 'Lens', value: 3, min: 0.1, max: 15, step: 0.1, uniform: true, label: 'near fade', hint: 'Letters closer than this to the lens fade out' },

  // ── Look ──
  color: { group: 'Look', value: '#f1ede4', color: true, uniform: true },
  background: { group: 'Look', value: '#000000', color: true },
  weight: { group: 'Look', value: 0, min: -4, max: 4, step: 0.1, uniform: true, label: 'stroke', hint: 'Thicken (+) or thin (−) strokes via the SDF' },
  opacity: { group: 'Look', value: 1, min: 0, max: 1, step: 0.01, uniform: true },
  blending: { group: 'Look', value: 'normal', options: ['normal', 'additive'] },
} as const satisfies Record<string, ParamSpec>

export type ParamKey = keyof typeof SPEC

type Widen<T> = T extends number ? number : T extends string ? string : T extends boolean ? boolean : T
export type MotionParams = { -readonly [K in ParamKey]: Widen<(typeof SPEC)[K]['value']> }

export const PARAM_KEYS = Object.keys(SPEC) as ParamKey[]

export const DEFAULT_PARAMS = Object.fromEntries(
  PARAM_KEYS.map((k) => [k, SPEC[k].value]),
) as MotionParams

export const GROUP_ORDER: ParamGroup[] = ['Schedule', 'Decay', 'Field', 'Assemble', 'Hold', 'Camera', 'Lens', 'Look', 'Layout']

/** Keys whose change requires rebuilding the instance layout / atlas. */
export const LAYOUT_KEYS = PARAM_KEYS.filter((k) => SPEC[k].group === 'Layout')

export function uniformName(key: string) {
  return 'u' + key[0].toUpperCase() + key.slice(1)
}

export const UNIFORM_KEYS = PARAM_KEYS.filter(
  (k) => 'uniform' in SPEC[k] && (SPEC[k] as { uniform?: boolean }).uniform,
)

/** Keep only known keys with the right primitive type; fill the rest from defaults. */
export function sanitizeParams(input: Record<string, unknown> | undefined, base: MotionParams = DEFAULT_PARAMS) {
  const out = { ...base }
  const unknown: string[] = []
  if (input) {
    for (const [k, v] of Object.entries(input)) {
      if (!(k in SPEC)) {
        unknown.push(k)
        continue
      }
      const key = k as ParamKey
      if (typeof v === typeof DEFAULT_PARAMS[key]) (out as Record<string, unknown>)[key] = v
    }
  }
  return { params: out, unknown }
}
