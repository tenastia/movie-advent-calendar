import { sanitizeParams, type MotionParams } from '../params'

/**
 * Presets are plain JSON files in this folder: { name, mode, params }.
 * Drop a file produced by the lab's "Copy preset" button here and it shows up
 * in the preset list (Vite picks it up on reload).
 */
export interface PresetFile {
  name?: string
  mode?: string
  params?: Record<string, unknown>
}

export interface Preset {
  key: string
  name: string
  mode: string
  params: MotionParams
}

const files = import.meta.glob<PresetFile>('./*.json', { eager: true, import: 'default' })

export const PRESETS: Preset[] = Object.entries(files)
  .map(([path, data]) => {
    const key = path.replace(/^.*\//, '').replace(/\.json$/, '')
    const { params, unknown } = sanitizeParams(data.params)
    if (unknown.length) console.warn(`[presets] ${key}.json has unknown params:`, unknown.join(', '))
    return { key, name: data.name ?? key, mode: data.mode ?? 'explosion', params }
  })
  .sort((a, b) => (a.key === 'default' ? -1 : b.key === 'default' ? 1 : a.name.localeCompare(b.name)))

/** The preset the calendar page uses and the lab opens with. Change the key to switch looks. */
export const CALENDAR_PRESET_KEY = 'test-1'

export const DEFAULT_PRESET = PRESETS.find((p) => p.key === CALENDAR_PRESET_KEY) ?? PRESETS[0]

export function presetJson(name: string, mode: string, params: MotionParams) {
  return JSON.stringify({ name, mode, params }, null, 2) + '\n'
}
