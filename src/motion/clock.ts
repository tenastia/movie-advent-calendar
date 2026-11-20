import { DAY, DAY_IN_TWO_MINUTES } from './day'

/**
 * Playback clock shared by the scene, the transport bar and the recorder.
 * `time` is the time of day in seconds (0 → 24:00); `speed` multiplies real time.
 * `time` changes every frame and is read directly (no React re-render);
 * everything else notifies subscribers.
 */
export interface ClockState {
  time: number
  playing: boolean
  speed: number
  loop: boolean
  duration: number
  recording: boolean
}

type Listener = () => void

const state: ClockState = {
  time: 0,
  playing: true,
  speed: DAY_IN_TWO_MINUTES,
  loop: true,
  duration: DAY,
  recording: false,
}

const listeners = new Set<Listener>()
const endListeners = new Set<Listener>()
let snapshot: ClockState = { ...state }

function emit() {
  snapshot = { ...state }
  listeners.forEach((l) => l())
}

export const clock = {
  get time() {
    return state.time
  },
  get state(): Readonly<ClockState> {
    return state
  },
  /** Stable snapshot for useSyncExternalStore (time inside may be stale). */
  getSnapshot: () => snapshot,
  subscribe(l: Listener): () => void {
    listeners.add(l)
    return () => void listeners.delete(l)
  },
  onEnd(l: Listener): () => void {
    endListeners.add(l)
    return () => void endListeners.delete(l)
  },
  set(patch: Partial<ClockState>) {
    Object.assign(state, patch)
    state.time = Math.min(Math.max(state.time, 0), state.duration)
    emit()
  },
  seek(t: number) {
    state.time = Math.min(Math.max(t, 0), state.duration)
  },
  replay() {
    state.time = 0
    state.playing = true
    emit()
  },
  toggle() {
    if (!state.playing && state.time >= state.duration) state.time = 0
    state.playing = !state.playing
    emit()
  },
  /** Advance by a real-time delta (seconds). Called once per rendered frame. */
  tick(dt: number) {
    if (!state.playing) return
    state.time += Math.min(dt, 0.1) * state.speed
    if (state.time >= state.duration) {
      if (state.loop && !state.recording) {
        state.time %= state.duration
      } else {
        state.time = state.duration
        state.playing = false
        emit()
        endListeners.forEach((l) => l())
      }
    }
  },
}
