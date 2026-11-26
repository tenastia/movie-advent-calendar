import { describe, expect, it } from 'vitest'
import { makeDayTime, parseTimeOfDay, readClockOverrides } from './wallClock'

describe('parseTimeOfDay', () => {
  it('reads HH:MM and HH:MM:SS', () => {
    expect(parseTimeOfDay('03:00')).toBe(3 * 3600)
    expect(parseTimeOfDay('9:30')).toBe(9 * 3600 + 30 * 60)
    expect(parseTimeOfDay('12:00:15')).toBe(12 * 3600 + 15)
  })

  it('rejects anything else', () => {
    expect(parseTimeOfDay(null)).toBeUndefined()
    expect(parseTimeOfDay('noon')).toBeUndefined()
    expect(parseTimeOfDay('25:00')).toBeUndefined()
  })
})

describe('readClockOverrides', () => {
  it('defaults to real time at 1×', () => {
    expect(readClockOverrides('')).toEqual({ start: undefined, speed: 1 })
  })

  it('reads ?time and ?speed', () => {
    expect(readClockOverrides('?time=06:00&speed=720')).toEqual({ start: 6 * 3600, speed: 720 })
  })

  it('ignores a bad speed', () => {
    expect(readClockOverrides('?speed=-3').speed).toBe(1)
  })
})

describe('makeDayTime', () => {
  it('runs on from the start time at the given speed and wraps at midnight', () => {
    let ms = 0
    const dayTime = makeDayTime({ start: 23 * 3600 + 59 * 60, speed: 60 }, () => ms)
    expect(dayTime()).toBe(23 * 3600 + 59 * 60)
    ms = 2000 // 2 s real = 120 s of day
    expect(dayTime()).toBe(60)
  })
})
