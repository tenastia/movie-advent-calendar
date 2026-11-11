import { Canvas } from '@react-three/fiber'
import { button, Leva, useControls } from 'leva'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { clock } from '../motion/clock'
import { LetterScene, type SceneStats } from '../motion/LetterScene'
import { MODE_IDS, MODES } from '../motion/modes'
import { daySchedule, formatGap } from '../motion/day'
import { DEFAULT_PARAMS, type MotionParams } from '../motion/params'
import { DEFAULT_PRESET, PRESETS, presetJson } from '../motion/presets'
import { buildParamSchema } from './controls'
import { FpsMeter } from './FpsMeter'
import { Transport } from './Transport'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

const ASPECTS: Record<string, number> = { fill: 0, '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1, '4:5': 4 / 5 }

const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'preset'

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;left:0;top:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export function LabApp() {
  const systemReduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [stats, setStats] = useState<SceneStats | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef(0)
  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  // ── Content ──
  const [content, setContent] = useControls(
    'Content',
    () => ({
      mode: {
        value: DEFAULT_PRESET?.mode ?? 'explosion',
        options: Object.fromEntries(MODE_IDS.map((id) => [MODES[id].label, id])),
      },
      day: { value: 24, min: 0, step: 1, label: 'day number' },
      title: { value: 'INTERSTELLAR', label: 'title' },
      nextTitle: { value: 'ARRIVAL', label: 'next title', hint: 'Fills the next day’s number that fades in at 24:00 (blank = same title)' },
    }),
    { order: 0 },
  )

  // ── Every motion parameter, one folder per group ──
  const schema = useMemo(() => buildParamSchema(DEFAULT_PRESET?.params ?? DEFAULT_PARAMS), [])
  const [rawParams, setParams] = useControls(() => schema)
  const params = rawParams as unknown as MotionParams

  // ── Presets ──
  const live = useRef({ params, mode: content.mode })
  live.current = { params, mode: content.mode }

  const applyPreset = useRef((_key: string) => {})
  applyPreset.current = (key: string) => {
    const preset = PRESETS.find((p) => p.key === key)
    if (!preset) return
    setParams(preset.params as never)
    if (preset.mode in MODES) setContent({ mode: preset.mode })
    clock.replay()
    notify(`Loaded preset “${preset.name}”`)
  }

  const presetNameRef = useRef('my-preset')
  const copyPreset = useRef((_name: string) => {})
  copyPreset.current = async (name: string) => {
    const file = slug(name)
    const json = presetJson(name.trim() || file, live.current.mode, live.current.params)
    console.info(`[presets] src/motion/presets/${file}.json\n${json}`)
    const ok = await copyText(json)
    notify(ok ? `Copied — save as src/motion/presets/${file}.json` : 'Copy failed — JSON is in the console')
  }

  const [presetCtl] = useControls(
    'Presets',
    () => ({
      preset: {
        value: DEFAULT_PRESET?.key ?? '',
        options: Object.fromEntries(PRESETS.map((p) => [p.name, p.key])),
        transient: false,
        onChange: (key: string, _path: string, ctx: { initial: boolean }) => {
          if (!ctx.initial) applyPreset.current(key)
        },
      },
      saveAs: { value: 'my-preset', label: 'save as', hint: 'Name for the copied preset JSON' },
      'copy preset': button(() => copyPreset.current(presetNameRef.current)),
    }),
    { order: 1 },
  )
  presetNameRef.current = (presetCtl as { saveAs: string }).saveAs

  // ── Output (not part of presets) ──
  const output = useControls(
    'Output',
    {
      aspect: { value: 'fill', options: Object.keys(ASPECTS), hint: 'Stage aspect; also the recorded video size' },
      maxDpr: { value: 2, min: 1, max: 2, step: 0.25, label: 'max dpr' },
      reducedMotion: {
        value: 'auto',
        options: { 'auto (system)': 'auto', 'force on': 'on', 'force off': 'off' },
        label: 'reduced motion',
      },
      bitrate: { value: 16, min: 2, max: 60, step: 1, label: 'video Mbps' },
      smoothing: {
        value: true,
        label: 'fast smoothing',
        hint: 'While playing faster than ~10×, damp tremble, wander, tumble and camera sway so the preview doesn’t strobe. 1× and paused frames are exact.',
      },
    },
    { collapsed: true, order: 40 },
  )
  const reduced = output.reducedMotion === 'auto' ? systemReduced : output.reducedMotion === 'on'

  // Pace of the day for the HUD: one release / one title letter every …
  const day = daySchedule(params)
  const pace = stats
    ? `1 release every ${formatGap((day.decay1 - day.decay0) / stats.letters)} · ` +
      `1 title letter every ${formatGap((day.assemble1 - day.decay1) / stats.heroes)}` +
      (params.extraLetters === 'stack' ? ` · 1 return every ${formatGap((day.assemble1 - day.decay1) / stats.letters)} avg` : '') +
      (stats.titleFits ? '' : ' · title wider than number')
    : undefined

  // Keyboard: Space play/pause, R replay, ←/→ step 1 min (Shift 15 min, Alt 1 s).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.code === 'Space') {
        e.preventDefault()
        clock.toggle()
      } else if (e.key === 'r' || e.key === 'R') {
        clock.replay()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const step = (e.altKey ? 1 : e.shiftKey ? 900 : 60) * (e.key === 'ArrowLeft' ? -1 : 1)
        clock.set({ playing: false })
        clock.seek(clock.time + step)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Letterbox the stage to the chosen aspect.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [wrap, setWrap] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = wrapRef.current!
    const ro = new ResizeObserver(([entry]) => setWrap({ w: entry.contentRect.width, h: entry.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const ratio = ASPECTS[output.aspect] ?? 0
  let stageStyle: CSSProperties = { width: '100%', height: '100%' }
  if (ratio && wrap.w && wrap.h) {
    const w = Math.min(wrap.w, wrap.h * ratio)
    stageStyle = { width: Math.floor(w), height: Math.floor(w / ratio) }
  }

  const dpr = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio, output.maxDpr)
  const narrow = typeof window !== 'undefined' && window.innerWidth < 700

  return (
    <div className="lab">
      <div className="stage-wrap" ref={wrapRef}>
        <div className="stage" style={stageStyle}>
          <Canvas
            dpr={[1, output.maxDpr]}
            flat
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            camera={{ fov: params.fov, near: 0.1, far: 1000, position: [0, 0, 25] }}
            onCreated={({ gl }) => {
              canvasRef.current = gl.domElement
            }}
          >
            <LetterScene
              params={params}
              modeId={content.mode}
              day={content.day}
              title={content.title}
              nextTitle={content.nextTitle}
              reduced={reduced}
              smoothing={output.smoothing}
              onStats={setStats}
            />
          </Canvas>
        </div>
      </div>

      <FpsMeter stats={stats} dpr={dpr} reduced={reduced} pace={pace} />

      <Transport
        params={params}
        getCanvas={() => canvasRef.current}
        bitrateMbps={output.bitrate}
        fileStem={`${content.mode}-${content.day}`}
        notify={notify}
      />

      <Leva
        collapsed={narrow}
        titleBar={{ title: 'Motion Lab', filter: true }}
        theme={{ sizes: { rootWidth: '320px', controlWidth: '150px' } }}
      />

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
