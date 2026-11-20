import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  InstancedBufferAttribute,
  InstancedMesh,
  PlaneGeometry,
  Vector3,
  type PerspectiveCamera,
} from 'three'
import { buildAtlas, type GlyphAtlas } from './atlas'
import { clock } from './clock'
import { daySchedule, midnightFade } from './day'
import { ensureFont } from './fonts'
import { buildField, layoutTitleGrid, normalizeTitle, titleSlots, type LetterField, type TitleLayout } from './layout'
import { applyParams, createLetterMaterial, type LetterLayer } from './material'
import { getMode } from './modes'
import type { MotionParams } from './params'
import { scheduleLetters } from './schedule'

/** The day number is always this many world units tall. */
export const NUMBER_HEIGHT = 10

export interface SceneStats {
  letters: number
  heroes: number
  rows: number
  titleLines: number
  /** False when a single word is wider than the number grid. */
  titleFits: boolean
}

interface Props {
  params: MotionParams
  modeId: string
  day: number
  title: string
  /** Title of the next day; its number fades in at midnight. Blank = same title. */
  nextTitle: string
  reduced: boolean
  /** Damp fast oscillations while playing at high speed (see damp() in day.ts). */
  smoothing: boolean
  /** Pad the day number with leading zeros to this many digits: 2 draws day 9 as "09". */
  digits?: number
  onStats?: (s: SceneStats) => void
}

interface Built {
  atlas: GlyphAtlas
  field: LetterField
  next: LetterField
  titleText: string
  nextText: string
}

function makeGeometry(atlas: GlyphAtlas, field: LetterField) {
  const N = field.count
  const g = new PlaneGeometry(atlas.quadW, atlas.quadH)
  g.setAttribute('aNumPos', new InstancedBufferAttribute(field.aNumPos, 2))
  g.setAttribute('aTitlePos', new InstancedBufferAttribute(new Float32Array(N * 2), 2))
  g.setAttribute('aData', new InstancedBufferAttribute(field.aData, 4))
  g.setAttribute('aSched', new InstancedBufferAttribute(new Float32Array(N * 4), 4))
  g.setAttribute('aRandA', new InstancedBufferAttribute(field.aRandA, 4))
  g.setAttribute('aRandB', new InstancedBufferAttribute(field.aRandB, 4))
  g.setAttribute('aRandC', new InstancedBufferAttribute(field.aRandC, 4))
  g.setAttribute('aRandD', new InstancedBufferAttribute(field.aRandD, 4))
  return g
}

/** Camera distance at which the number (or a title wider than it) fills `fill` of the frame. */
function frameDistance(field: LetterField, title: TitleLayout, aspect: number, fov: number, fill: number) {
  const tanHalf = Math.tan((fov * Math.PI) / 360)
  const em = NUMBER_HEIGHT / field.numberHeightEm
  const width = Math.max(field.numberWidthEm, title.widthEm) * em
  return Math.max(NUMBER_HEIGHT / fill / (2 * tanHalf), width / fill / (2 * tanHalf * aspect))
}

export function LetterScene({ params, modeId, day, title, nextTitle, reduced, smoothing, digits = 2, onStats }: Props) {
  const mode = getMode(modeId)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  const titleText = normalizeTitle(title, params.uppercase)
  const nextText = nextTitle.trim() ? normalizeTitle(nextTitle, params.uppercase) : titleText
  const dayN = Math.max(0, Math.round(day))
  const dayText = String(dayN).padStart(digits, '0')
  const nextDayText = String(dayN + 1).padStart(digits, '0')

  // ── 1. Glyph atlas + today's field + tomorrow's number (async: waits for fonts) ──
  const [built, setBuilt] = useState<Built | null>(null)
  const layoutKey = JSON.stringify([
    titleText,
    nextText,
    dayText,
    params.seed,
    params.gridRows,
    params.fillThreshold,
    params.tracking,
    params.lineSpacing,
    params.numberFont,
    params.numberWeight,
    params.glyphFont,
    params.glyphWeight,
  ])
  useEffect(() => {
    let cancelled = false
    const chars = [...new Set([...titleSlots(titleText), ...titleSlots(nextText)])]
    Promise.all([
      ensureFont(params.glyphFont, params.glyphWeight, chars.join('') + 'M'),
      ensureFont(params.numberFont, params.numberWeight, dayText + nextDayText),
    ]).then(() => {
      if (cancelled) return
      const atlas = buildAtlas(chars, params.glyphFont, params.glyphWeight)
      const common = {
        glyphIndex: atlas.index,
        advanceEm: atlas.advanceEm,
        seed: params.seed,
        rows: params.gridRows,
        tracking: params.tracking,
        lineSpacing: params.lineSpacing,
        threshold: params.fillThreshold,
        numberFont: params.numberFont,
        numberWeight: params.numberWeight,
      }
      const field = buildField({ ...common, day: dayText, titleText })
      const next = buildField({ ...common, day: nextDayText, titleText: nextText, seed: params.seed + 1 })
      setBuilt({ atlas, field, next, titleText, nextText })
    })
    return () => {
      cancelled = true
    }
    // layoutKey captures every input above.
  }, [layoutKey])
  useEffect(() => () => built?.atlas.dispose(), [built])

  // ── 2. Instanced geometry: one quad, per-instance attributes ──
  const geometry = useMemo(() => (built ? makeGeometry(built.atlas, built.field) : null), [built])
  const nextGeometry = useMemo(() => (built ? makeGeometry(built.atlas, built.next) : null), [built])
  useEffect(() => () => geometry?.dispose(), [geometry])
  useEffect(() => () => nextGeometry?.dispose(), [nextGeometry])

  // ── 3. Title on the number's own grid pitch (today and tomorrow, for framing) ──
  const titles = useMemo(() => {
    if (!built) return null
    return {
      today: layoutTitleGrid(built.titleText, built.field, params.titleMaxLines, params.titleLineSpacing),
      next: layoutTitleGrid(built.nextText, built.next, params.titleMaxLines, params.titleLineSpacing),
    }
  }, [built, params.titleMaxLines, params.titleLineSpacing])

  useLayoutEffect(() => {
    if (!geometry || !titles || !built) return
    const attr = geometry.getAttribute('aTitlePos') as InstancedBufferAttribute
    const arr = attr.array as Float32Array
    const { slotOf, count } = built.field
    const slotPos = titles.today.slotPos
    for (let i = 0; i < count; i++) {
      const s = slotOf[i]
      arr[i * 2] = slotPos[s * 2] ?? 0
      arr[i * 2 + 1] = slotPos[s * 2 + 1] ?? 0
    }
    attr.needsUpdate = true
  }, [geometry, titles, built])

  // ── 4. Schedule: erosion order, arrivals, heroes (cheap; no rebuild) ──
  useLayoutEffect(() => {
    if (!geometry || !built) return
    const { aSched } = scheduleLetters(built.field, {
      seed: params.seed,
      erosionNoise: params.erosionNoise,
      erosionScale: params.erosionScale,
    })
    const attr = geometry.getAttribute('aSched') as InstancedBufferAttribute
    ;(attr.array as Float32Array).set(aSched)
    attr.needsUpdate = true
  }, [geometry, built, params.seed, params.erosionNoise, params.erosionScale])

  // ── 5. Framing: the same camera distance frames the number at 00:00 and the title at rest ──
  const framing = useMemo(() => {
    if (!built || !titles) return null
    const aspect = width / Math.max(1, height)
    return {
      distance: frameDistance(built.field, titles.today, aspect, params.fov, params.numberFill),
      nextDistance: frameDistance(built.next, titles.next, aspect, params.fov, params.numberFill),
      numberEm: NUMBER_HEIGHT / built.field.numberHeightEm,
      nextEm: NUMBER_HEIGHT / built.next.numberHeightEm,
    }
  }, [built, titles, width, height, params.fov, params.numberFill])

  // ── 6. Materials: the animated day (or two static layers) + tomorrow's number ──
  const layers: LetterLayer[] = reduced ? ['number', 'title', 'next'] : ['motion', 'next']
  const materials = useMemo(() => layers.map((l) => ({ layer: l, mat: createLetterMaterial(mode, l) })), [mode, reduced])
  useEffect(() => () => materials.forEach((m) => m.mat.dispose()), [materials])

  const meshes = useMemo(() => {
    if (!geometry || !nextGeometry || !built) return []
    return materials.map(({ layer, mat }) => {
      const isNext = layer === 'next'
      const mesh = new InstancedMesh(isNext ? nextGeometry : geometry, mat, isNext ? built.next.count : built.field.count)
      mesh.frustumCulled = false // positions live in the vertex shader
      return mesh
    })
  }, [geometry, nextGeometry, materials, built])

  useEffect(() => {
    for (const { layer, mat } of materials) {
      applyParams(mat, params, built?.atlas ?? null)
      if (framing) mat.uniforms.uNumberEm.value = layer === 'next' ? framing.nextEm : framing.numberEm
    }
  }, [materials, params, built, framing])

  useEffect(() => {
    if (built && titles && onStats) {
      onStats({
        letters: built.field.count,
        heroes: built.field.slots.length,
        rows: built.field.rowsUsed,
        titleLines: titles.today.lines.length,
        titleFits: titles.today.widthEm <= built.field.numberWidthEm + 1e-6,
      })
    }
  }, [built, titles, onStats])

  // ── 7. Per frame: advance the clock, place the camera, set time + focus ──
  const live = useRef({ params, framing, materials, reduced, mode, smoothing })
  live.current = { params, framing, materials, reduced, mode, smoothing }
  const camPos = useMemo(() => new Vector3(), [])
  const camTarget = useMemo(() => new Vector3(), [])

  useFrame((_, delta) => {
    clock.tick(delta)
    const { params: p, framing: f, materials: mats, reduced: still, mode: m, smoothing: smooth } = live.current
    if (!f) return
    const t = clock.time
    const st = clock.state
    const span = smooth && st.playing ? st.speed / 60 : 0
    // Hand the framing over to tomorrow's number during the midnight fade.
    const dist = f.distance + (f.nextDistance - f.distance) * midnightFade(t, daySchedule(p))
    if (still) {
      camPos.set(0, 0, dist)
      camTarget.set(0, 0, 0)
    } else {
      m.camera(t, p, dist, span, camPos, camTarget)
    }
    if (camera.fov !== p.fov) {
      camera.fov = p.fov
      camera.updateProjectionMatrix()
    }
    camera.position.copy(camPos)
    camera.lookAt(camTarget)
    const focus = camPos.distanceTo(camTarget) + p.focusOffset
    for (const { mat } of mats) {
      mat.uniforms.uTime.value = t
      mat.uniforms.uFocus.value = focus
      mat.uniforms.uSpan.value = span
    }
  })

  return (
    <>
      <color attach="background" args={[params.background]} />
      {meshes.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}
    </>
  )
}
