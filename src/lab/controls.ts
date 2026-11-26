import { folder } from 'leva'
import { GROUP_ORDER, PARAM_KEYS, SPEC, type MotionParams, type ParamGroup, type ParamSpec } from '../motion/params'

const OPEN_GROUPS: ParamGroup[] = ['Schedule', 'Decay']

/** Turn the SPEC table into a leva schema: one folder per group, in GROUP_ORDER. */
export function buildParamSchema(initial: MotionParams) {
  const groups: Partial<Record<ParamGroup, Record<string, Record<string, unknown>>>> = {}
  for (const key of PARAM_KEYS) {
    const s: ParamSpec = SPEC[key]
    const input: Record<string, unknown> = { value: initial[key] }
    if ('min' in s) {
      input.min = s.min
      input.max = s.max
      if (s.step !== undefined) input.step = s.step
    }
    if ('options' in s) input.options = [...s.options]
    if (s.label) input.label = s.label
    if (s.hint) input.hint = s.hint
    ;(groups[s.group] ??= {})[key] = input
  }
  return Object.fromEntries(
    GROUP_ORDER.filter((g) => groups[g]).map((g, i) => [
      g,
      folder(groups[g] as never, { collapsed: !OPEN_GROUPS.includes(g), order: 10 + i }),
    ]),
  )
}
