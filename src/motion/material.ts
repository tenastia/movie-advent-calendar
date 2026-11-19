import {
  AdditiveBlending,
  Color,
  DoubleSide,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  type IUniform,
  type Texture,
} from 'three'
import type { GlyphAtlas } from './atlas'
import { DAY, daySchedule } from './day'
import type { MotionMode } from './modes'
import { SPEC, UNIFORM_KEYS, uniformName, type MotionParams } from './params'
import fragmentShader from './shaders/letters.frag.glsl?raw'
import vertexShader from './shaders/letters.vert.glsl?raw'

/** motion = the animated day; number/title = reduced-motion layers; next = next day's number (midnight fade). */
export type LetterLayer = 'motion' | 'number' | 'title' | 'next'

const STATIC_LAYER: Record<LetterLayer, number> = { motion: 0, number: 1, title: 2, next: 3 }

export function createLetterMaterial(mode: MotionMode, layer: LetterLayer) {
  const uniforms: Record<string, IUniform> = {
    uTime: { value: 0 },
    uStatic: { value: STATIC_LAYER[layer] },
    uNumberEm: { value: 1 },
    uFocus: { value: 20 },
    uSpan: { value: 0 },
    uDecay0: { value: 0 },
    uDecay1: { value: 6 * 3600 },
    uAssemble1: { value: 12 * 3600 },
    uDayLength: { value: DAY },
    uCrossfade: { value: 120 },
    uStack: { value: 1 },
    uAtlas: { value: null as Texture | null },
    uAtlasGrid: { value: new Vector2(1, 1) },
    uSdfEdge: { value: 0.75 },
    uSdfRadius: { value: 32 },
    uMaxSoftPx: { value: 20 },
    uBlurMaxPx: { value: 16 },
  }
  for (const key of UNIFORM_KEYS) {
    const v = SPEC[key].value
    uniforms[uniformName(key)] = { value: typeof v === 'string' ? new Color(v) : Number(v) }
  }

  return new ShaderMaterial({
    uniforms,
    vertexShader: vertexShader.replace('/*__MODE__*/', mode.glsl),
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: DoubleSide,
  })
}

/** Push leva params into a material's uniforms (cheap; no recompile). */
export function applyParams(mat: ShaderMaterial, p: MotionParams, atlas: GlyphAtlas | null) {
  const u = mat.uniforms
  for (const key of UNIFORM_KEYS) {
    const v = p[key]
    const uni = u[uniformName(key)]
    if (!uni) continue
    if (uni.value instanceof Color) uni.value.set(v as string)
    else uni.value = typeof v === 'boolean' ? (v ? 1 : 0) : v
  }
  const day = daySchedule(p)
  u.uDecay0.value = day.decay0
  u.uDecay1.value = day.decay1
  u.uAssemble1.value = day.assemble1
  u.uCrossfade.value = day.fade
  u.uStack.value = p.extraLetters === 'stay' ? 0 : 1
  if (atlas) {
    u.uAtlas.value = atlas.texture
    u.uAtlasGrid.value.set(atlas.cols, atlas.rows)
    u.uSdfEdge.value = atlas.sdfEdge
    u.uSdfRadius.value = atlas.sdfRadius
    // The softest edge must stay inside the encoded padding, or quad borders show.
    const maxSoft = Math.max(1, atlas.outsidePx - Math.max(0, p.weight) - 1.5)
    u.uMaxSoftPx.value = maxSoft
    u.uBlurMaxPx.value = p.blurMax * maxSoft
  }
  const blending = p.blending === 'additive' ? AdditiveBlending : NormalBlending
  if (mat.blending !== blending) mat.blending = blending
}
