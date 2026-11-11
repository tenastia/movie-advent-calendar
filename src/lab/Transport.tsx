import { useEffect, useRef, useSyncExternalStore } from 'react'
import { clock } from '../motion/clock'
import { DAY, DAY_IN_TWO_MINUTES, daySchedule, formatClock } from '../motion/day'
import type { MotionParams } from '../motion/params'
import { canRecord, CanvasRecorder, downloadBlob } from './recorder'

const SPEEDS = [0.25, 1, 5, 20, 60, 180, DAY_IN_TWO_MINUTES]
const JUMPS_H = [0, 3, 6, 9, 12]

interface Props {
  params: MotionParams
  getCanvas: () => HTMLCanvasElement | null
  bitrateMbps: number
  fileStem: string
  notify: (msg: string) => void
}

const nowOfDay = () => {
  const d = new Date()
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000
}

export function Transport({ params, getCanvas, bitrateMbps, fileStem, notify }: Props) {
  const s = useSyncExternalStore(clock.subscribe, clock.getSnapshot)
  const rangeRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const scrubbing = useRef<{ resume: boolean } | null>(null)
  const recorder = useRef<CanvasRecorder | null>(null)

  // Mirror the clock into the scrubber without React re-renders.
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const t = clock.time
      if (rangeRef.current && !scrubbing.current) rangeRef.current.value = String(t)
      if (timeRef.current) timeRef.current.textContent = formatClock(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const stopRecording = async () => {
    const rec = recorder.current
    if (!rec) return
    recorder.current = null
    clock.set({ recording: false })
    const blob = await rec.stop()
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    downloadBlob(blob, `${fileStem}-${stamp}.${rec.extension}`)
    notify(`Saved ${(blob.size / 1e6).toFixed(1)} MB ${rec.extension.toUpperCase()}`)
  }

  useEffect(() => clock.onEnd(() => void stopRecording()), [])

  // Records from the current time at the current speed until Stop or 24:00.
  const toggleRecord = () => {
    if (recorder.current) {
      void stopRecording()
      return
    }
    const canvas = getCanvas()
    if (!canvas || !canRecord()) {
      notify('Recording is not supported in this browser')
      return
    }
    try {
      const rec = new CanvasRecorder(canvas, 60, bitrateMbps * 1e6)
      recorder.current = rec
      if (clock.time >= DAY) clock.seek(0)
      clock.set({ playing: true, recording: true })
      rec.start()
      const left = (DAY - clock.time) / clock.state.speed
      notify(
        `Recording from ${formatClock(clock.time, false)} at ${clock.state.speed}× — ` +
          (left > 600 ? 'press Stop to finish' : `stops at 24:00 (${Math.ceil(left)} s)`),
      )
    } catch (err) {
      recorder.current = null
      clock.set({ recording: false })
      notify(`Could not start recording: ${(err as Error).message}`)
    }
  }

  const day = daySchedule(params)
  const marks = [
    ...(day.decay0 > 0 ? [{ t: day.decay0, label: 'decay' }] : []),
    { t: day.decay1, label: 'assemble' },
    { t: day.assemble1, label: 'hold' },
  ]
  const fast = s.speed === DAY_IN_TWO_MINUTES

  return (
    <div className="transport" role="toolbar" aria-label="Playback">
      <div className="trow main">
        <button className="tbtn" onClick={() => clock.replay()} title="Back to 00:00 and play (R)" aria-label="Replay">
          ↺
        </button>
        <button
          className="tbtn"
          onClick={() => clock.toggle()}
          title="Play / pause (Space)"
          aria-label={s.playing ? 'Pause' : 'Play'}
        >
          {s.playing ? '❚❚' : '▶'}
        </button>

        <div className="scrub">
          <input
            ref={rangeRef}
            type="range"
            min={0}
            max={DAY}
            step={1}
            defaultValue={0}
            aria-label="Time of day"
            onPointerDown={() => {
              scrubbing.current = { resume: clock.state.playing }
              clock.set({ playing: false })
            }}
            onPointerUp={() => {
              const resume = scrubbing.current?.resume
              scrubbing.current = null
              if (resume) clock.set({ playing: true })
            }}
            onInput={(e) => clock.seek(Number((e.target as HTMLInputElement).value))}
          />
          <div className="marks" aria-hidden>
            {marks.map((m) => (
              <span key={m.label} className="mark" style={{ left: `calc(7px + (100% - 14px) * ${m.t / DAY})` }}>
                <i>{m.label}</i>
              </span>
            ))}
          </div>
        </div>

        <span className="tclock">
          <span ref={timeRef}>00:00:00</span>
          <span className="dim"> / 24:00</span>
        </span>

        <select
          className="tsel"
          value={s.speed}
          onChange={(e) => clock.set({ speed: Number(e.target.value) })}
          aria-label="Speed"
          title="Speed multiplier (720× plays 24 h in 2 min)"
        >
          {SPEEDS.map((v) => (
            <option key={v} value={v}>
              {v}×
            </option>
          ))}
        </select>

        <button
          className={`tbtn ${s.loop ? 'on' : ''}`}
          onClick={() => clock.set({ loop: !s.loop })}
          title="Loop the day"
          aria-pressed={s.loop}
        >
          ⟲
        </button>

        <button
          className={`tbtn rec ${s.recording ? 'on' : ''}`}
          onClick={toggleRecord}
          title="Record from the current time until Stop or 24:00"
          aria-pressed={s.recording}
        >
          <span className="dot" /> {s.recording ? 'Stop' : 'Rec'}
        </button>
      </div>

      <div className="trow jumps" aria-label="Jump to time">
        {JUMPS_H.map((h) => (
          <button key={h} className="chip" onClick={() => clock.seek(h * 3600)} title={`Jump to ${formatClock(h * 3600, false)}`}>
            {formatClock(h * 3600, false)}
          </button>
        ))}
        <button
          className="chip"
          onClick={() => {
            clock.seek(nowOfDay())
            clock.set({ speed: 1, playing: true })
          }}
          title="Jump to the current time of day and play at 1× (what a visitor sees now)"
        >
          now
        </button>
        <button
          className={`chip ${fast ? 'on' : ''}`}
          onClick={() => clock.set({ time: 0, speed: DAY_IN_TWO_MINUTES, playing: true })}
          title="Play the full day from 00:00 in 2 minutes (720×)"
          aria-pressed={fast}
        >
          <span className="long">24 h in 2 min</span>
          <span className="short">24h·2m</span>
        </button>
      </div>
    </div>
  )
}
