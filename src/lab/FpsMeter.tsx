import { useEffect, useRef } from 'react'
import type { SceneStats } from '../motion/LetterScene'

interface Props {
  stats: SceneStats | null
  dpr: number
  reduced: boolean
  /** Pace of the day, e.g. "1 release every 19.1 s · …". */
  pace?: string
}

/** Frame rate + frame time, sampled every half second; writes to the DOM directly. */
export function FpsMeter({ stats, dpr, reduced, pace }: Props) {
  const fpsRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    let frames = 0
    let worst = 0
    let last = performance.now()
    let windowStart = last
    const loop = (now: number) => {
      frames++
      worst = Math.max(worst, now - last)
      last = now
      const span = now - windowStart
      if (span >= 500) {
        const fps = (frames * 1000) / span
        const el = fpsRef.current
        if (el) {
          el.textContent = `${fps.toFixed(0)} fps · ${(span / frames).toFixed(1)} ms · worst ${worst.toFixed(0)} ms`
          el.dataset.level = fps >= 55 ? 'good' : fps >= 40 ? 'ok' : 'bad'
        }
        frames = 0
        worst = 0
        windowStart = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="hud" aria-live="off">
      <span ref={fpsRef} className="hud-fps" data-level="good">
        — fps
      </span>
      <span className="hud-meta">
        {stats ? `${stats.letters} letters · ${stats.heroes} in title · dpr ${dpr.toFixed(2)}` : 'building…'}
        {reduced ? ' · reduced motion' : ''}
      </span>
      {pace && <span className="hud-meta">{pace}</span>}
    </div>
  )
}
