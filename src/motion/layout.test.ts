import { describe, expect, it } from 'vitest'
import { fitTitleGrid, layoutTitleGrid } from './layout'

// A number grid 40 letters wide and 26 rows tall, 1em pitch.
const field = { stepXem: 1, stepYem: 1, cols: 40, numberWidthEm: 40, numberHeightEm: 26 }

describe('layoutTitleGrid', () => {
  it('keeps the number grid pitch at scale 1', () => {
    const t = layoutTitleGrid('THE HOLDOVERS', field, 2, 1.5)
    expect(t.lines).toEqual(['THE HOLDOVERS'])
    expect(t.widthEm).toBe(13)
    expect(t.scale).toBe(1)
  })

  it('scales spacing and size, wrapping sooner as the letters grow', () => {
    const t = layoutTitleGrid('THE SECRET LIFE OF WALTER MITTY', field, 2, 1.5, 2)
    expect(t.lines).toEqual(['THE SECRET LIFE', 'OF WALTER MITTY'])
    expect(t.widthEm).toBe(30)
    expect(t.heightEm).toBe(1.5 * 2 + 2)
  })
})

describe('fitTitleGrid', () => {
  it('grows a short title up to the maximum size', () => {
    const t = fitTitleGrid('ELF', field, 2, 1.5, 4)
    expect(t.scale).toBe(4)
    expect(t.widthEm).toBe(12)
  })

  it('prefers bigger letters on two lines over smaller ones on one', () => {
    const t = fitTitleGrid('THE HOLDOVERS', field, 2, 1.5, 4)
    expect(t.lines).toEqual(['THE', 'HOLDOVERS'])
    expect(t.scale).toBe(4)
  })

  it('grows a one-line title until it fills the number width, and no further', () => {
    const t = fitTitleGrid('THE HOLDOVERS', field, 1, 1.5, 4)
    expect(t.widthEm).toBeLessThanOrEqual(field.numberWidthEm)
    // Within one 3% step of filling the width.
    expect(t.widthEm).toBeGreaterThan(field.numberWidthEm * 0.97 - 1e-9)
  })

  it('wraps a long title onto two lines to keep it large', () => {
    const t = fitTitleGrid('THE SECRET LIFE OF WALTER MITTY', field, 2, 1.5, 4)
    expect(t.lines).toHaveLength(2)
    expect(t.scale).toBeGreaterThan(2.5)
    expect(t.widthEm).toBeLessThanOrEqual(field.numberWidthEm)
    expect(t.heightEm).toBeLessThanOrEqual(field.numberHeightEm)
  })

  it('keeps the number letter size for a title too long to fit at all', () => {
    const t = fitTitleGrid('SUPERCALIFRAGILISTICEXPIALIDOCIOUSLYLONGWORD', field, 2, 1.5, 4)
    expect(t.scale).toBe(1)
  })
})
