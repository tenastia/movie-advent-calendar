import type { LetterField } from './layout'
import { createRng, shuffleInPlace } from './rng'

/**
 * Per-letter schedule, as fractions of the decay and assembly windows. The
 * shader turns them into times of day, so retiming the day never needs a rebuild.
 *
 *  - release: erosion order. Letters on the number's outline go first, then a
 *    ragged front eats inward: key = (1 − w)·edge distance + w·smooth noise.
 *    Releases are evenly spaced by rank, one letter at a time.
 *  - arrival: title slots fill one by one, in shuffled order, evenly spread over
 *    the assembly window. Each slot's hero is its earliest-released copy (it has
 *    drifted longest). In "stack" mode the slot's other copies land on it later,
 *    spread between the hero's arrival and assemble end, first out, first back.
 */
export interface ScheduleOptions {
  seed: number
  erosionNoise: number
  erosionScale: number
}

export interface LetterSchedule {
  /** vec4 per instance: release 0..1, arrival 0..1, hero 0/1, unused. */
  aSched: Float32Array
}

function hash2(x: number, y: number, seed: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

/** Smooth 2D value noise in 0..1. */
function valueNoise(x: number, y: number, seed: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
  const a = hash2(ix, iy, seed)
  const b = hash2(ix + 1, iy, seed)
  const c = hash2(ix, iy + 1, seed)
  const d = hash2(ix + 1, iy + 1, seed)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

function fbm(x: number, y: number, seed: number) {
  return 0.62 * valueNoise(x, y, seed) + 0.38 * valueNoise(x * 2.3 + 17.1, y * 2.3 - 5.7, seed + 1)
}

export function scheduleLetters(field: LetterField, o: ScheduleOptions): LetterSchedule {
  const N = field.count
  const L = field.slots.length
  const rand = createRng(o.seed * 7919 + 101)
  const aSched = new Float32Array(N * 4)

  // ── Release order: erosion from the outline inward, roughened by noise ──
  let maxEdge = 1e-6
  for (let i = 0; i < N; i++) maxEdge = Math.max(maxEdge, field.edgeDist[i])
  const w = Math.min(1, Math.max(0, o.erosionNoise))
  const scale = Math.max(0.25, o.erosionScale) * field.stepYem
  const key = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const x = field.aNumPos[i * 2] / scale
    const y = field.aNumPos[i * 2 + 1] / scale
    const edge = field.edgeDist[i] / maxEdge
    // A pinch of per-letter grain so equal-distance letters don't go in scan order.
    key[i] = (1 - w) * edge + w * fbm(x, y, o.seed) + 0.03 * rand()
  }
  const byKey = Array.from({ length: N }, (_, i) => i).sort((a, b) => key[a] - key[b])
  const release = new Float32Array(N)
  byKey.forEach((inst, rank) => (release[inst] = (rank + 0.5) / N))

  // ── Arrivals: slots fill in shuffled order; extras stack on afterwards ──
  const slotOrder = shuffleInPlace(
    Array.from({ length: L }, (_, s) => s),
    rand,
  )
  const copies: number[][] = Array.from({ length: L }, () => [])
  for (let i = 0; i < N; i++) copies[field.slotOf[i]].push(i)

  slotOrder.forEach((slot, k) => {
    const list = copies[slot].sort((a, b) => release[a] - release[b])
    const heroArrival = (k + 0.5) / L
    const extras = list.length - 1
    const later = Array.from({ length: extras }, () => heroArrival + (1 - heroArrival) * rand()).sort((a, b) => a - b)
    list.forEach((inst, j) => {
      aSched[inst * 4] = release[inst]
      aSched[inst * 4 + 1] = j === 0 ? heroArrival : later[j - 1]
      aSched[inst * 4 + 2] = j === 0 ? 1 : 0
      aSched[inst * 4 + 3] = 0
    })
  })

  return { aSched }
}
