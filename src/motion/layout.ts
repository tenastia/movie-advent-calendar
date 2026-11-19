import { cssFamily } from './fonts'
import { createRng, shuffleInPlace } from './rng'

/** Title text as it will be shown (case applied, whitespace collapsed). */
export function normalizeTitle(title: string, uppercase: boolean) {
  const t = title.replace(/\s+/g, ' ').trim() || 'UNTITLED'
  return uppercase ? t.toUpperCase() : t
}

/** Title letters in reading order, without spaces: one slot each. */
export function titleSlots(text: string) {
  return Array.from(text).filter((c) => c !== ' ')
}

export interface NumberGrid {
  cells: Array<[number, number]>
  cols: number
  rows: number
}

/**
 * Rasterize the day number on an offscreen canvas and keep the grid cells
 * whose ink coverage reaches `threshold`.
 */
export function sampleNumber(
  text: string,
  family: string,
  weight: number,
  rows: number,
  stepRatio: number,
  threshold: number,
): NumberGrid {
  const fontPx = 600
  const font = `${weight} ${fontPx}px ${cssFamily(family)}`
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.font = font
  const m = ctx.measureText(text)
  const left = m.actualBoundingBoxLeft
  const inkW = Math.max(1, left + m.actualBoundingBoxRight)
  const ascent = m.actualBoundingBoxAscent
  const inkH = Math.max(1, ascent + m.actualBoundingBoxDescent)
  const pad = 4
  canvas.width = Math.ceil(inkW) + pad * 2
  canvas.height = Math.ceil(inkH) + pad * 2
  ctx.font = font
  ctx.fillStyle = '#fff'
  ctx.fillText(text, pad + left, pad + ascent)
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data

  const stepY = inkH / rows
  const stepX = stepY * stepRatio
  const cols = Math.max(1, Math.round(inkW / stepX))
  const x0 = pad + (inkW - cols * stepX) / 2
  const y0 = pad

  // Coverage from a 4x4 supersample of each cell.
  const S = 4
  const cells: Array<[number, number]> = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let sum = 0
      for (let sy = 0; sy < S; sy++) {
        const py = Math.floor(y0 + (j + (sy + 0.5) / S) * stepY)
        for (let sx = 0; sx < S; sx++) {
          const px = Math.floor(x0 + (i + (sx + 0.5) / S) * stepX)
          if (px >= 0 && py >= 0 && px < canvas.width && py < canvas.height) {
            sum += img[(py * canvas.width + px) * 4 + 3]
          }
        }
      }
      if (sum / (S * S * 255) >= threshold) cells.push([i, j])
    }
  }
  return { cells, cols, rows }
}

export interface LetterField {
  count: number
  /** Title letters in reading order (one slot each). */
  slots: string[]
  /** Title slot of each instance. */
  slotOf: Uint16Array
  aNumPos: Float32Array
  aData: Float32Array
  aRandA: Float32Array
  aRandB: Float32Array
  aRandC: Float32Array
  aRandD: Float32Array
  /** Distance from each letter to the number's outline (inner counters too), in grid rows. */
  edgeDist: Float32Array
  /** Grid pitch in em: letter advance (x) and line step (y). The title uses the same pitch. */
  stepXem: number
  stepYem: number
  cols: number
  numberWidthEm: number
  numberHeightEm: number
  rowsUsed: number
}

export interface FieldOptions {
  day: string
  titleText: string
  glyphIndex: Map<string, number>
  advanceEm: number
  seed: number
  rows: number
  tracking: number
  lineSpacing: number
  threshold: number
  numberFont: string
  numberWeight: number
}

/**
 * Distance from every inked cell to the nearest empty cell, in grid rows.
 * The grid is padded by one empty ring, so the outer outline and the inner
 * counters (the holes in 0, 4, 6, 8, 9) both count as edges.
 */
function edgeDistances(grid: NumberGrid, stepX: number, stepY: number) {
  const W = grid.cols + 2
  const H = grid.rows + 2
  const ink = new Uint8Array(W * H)
  for (const [i, j] of grid.cells) ink[(j + 1) * W + i + 1] = 1
  const edge: number[] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (ink[y * W + x]) continue
      let touches = false
      for (let dy = -1; dy <= 1 && !touches; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < W && ny < H && ink[ny * W + nx]) {
            touches = true
            break
          }
        }
      }
      if (touches) edge.push(x, y)
    }
  }
  const rx = stepX / stepY
  return grid.cells.map(([i, j]) => {
    let best = Infinity
    for (let k = 0; k < edge.length; k += 2) {
      const dx = (edge[k] - (i + 1)) * rx
      const dy = edge[k + 1] - (j + 1)
      const d = dx * dx + dy * dy
      if (d < best) best = d
    }
    return Math.sqrt(best)
  })
}

/**
 * Fill the inside cells of the day number with the title's letters, shuffled.
 * The title is repeated to cover every cell, so every instance belongs to a
 * title slot (slot = i % L). Which copy of a slot is its "hero" is decided by
 * the schedule (schedule.ts), not here.
 */
export function buildField(o: FieldOptions): LetterField {
  const slots = titleSlots(o.titleText)
  const L = slots.length
  const stepXem = o.advanceEm * o.tracking
  const stepYem = o.lineSpacing

  let rows = o.rows
  let grid = sampleNumber(o.day, o.numberFont, o.numberWeight, rows, stepXem / stepYem, o.threshold)
  // Every title letter needs at least one instance: densify the grid if needed.
  while (grid.cells.length < L && rows < 160) {
    rows = Math.ceil(rows * 1.25) + 1
    grid = sampleNumber(o.day, o.numberFont, o.numberWeight, rows, stepXem / stepYem, o.threshold)
  }
  const dist = edgeDistances(grid, stepXem, stepYem)

  const rand = createRng(o.seed)
  const order = shuffleInPlace(
    grid.cells.map((_, i) => i),
    rand,
  )
  const N = Math.max(order.length, L)

  const slotOf = new Uint16Array(N)
  const aNumPos = new Float32Array(N * 2)
  const aData = new Float32Array(N * 4)
  const aRandA = new Float32Array(N * 4)
  const aRandB = new Float32Array(N * 4)
  const aRandC = new Float32Array(N * 4)
  const aRandD = new Float32Array(N * 4)
  const edgeDist = new Float32Array(N)

  const cx = (grid.cols - 1) / 2
  const cy = (grid.rows - 1) / 2
  for (let i = 0; i < N; i++) {
    const slot = i % L
    const c = order.length ? order[i % order.length] : -1
    const [gx, gy] = c >= 0 ? grid.cells[c] : [cx, cy]
    aNumPos[i * 2] = (gx - cx) * stepXem
    aNumPos[i * 2 + 1] = (cy - gy) * stepYem
    edgeDist[i] = c >= 0 ? dist[c] : 1

    slotOf[i] = slot
    aData[i * 4] = o.glyphIndex.get(slots[slot]) ?? 0
    aData[i * 4 + 1] = 0
    aData[i * 4 + 2] = L > 1 ? slot / (L - 1) : 0.5
    aData[i * 4 + 3] = slot
    for (let k = 0; k < 4; k++) {
      aRandA[i * 4 + k] = rand()
      aRandB[i * 4 + k] = rand()
      aRandC[i * 4 + k] = rand()
      aRandD[i * 4 + k] = rand()
    }
  }

  return {
    count: N,
    slots,
    slotOf,
    aNumPos,
    aData,
    aRandA,
    aRandB,
    aRandC,
    aRandD,
    edgeDist,
    stepXem,
    stepYem,
    cols: grid.cols,
    numberWidthEm: grid.cols * stepXem,
    numberHeightEm: grid.rows * stepYem,
    rowsUsed: rows,
  }
}

export interface TitleLayout {
  lines: string[]
  /** Slot centers in em, (x, y) pairs in reading order. */
  slotPos: Float32Array
  widthEm: number
  heightEm: number
}

function wrapWords(words: string[], maxChars: number) {
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if (cur.length + 1 + w.length <= maxChars) cur += ' ' + w
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

/** Narrowest word wrap that uses at most n lines (words are never split). */
function balancedWrap(words: string[], n: number) {
  const total = words.join(' ').length
  let width = Math.max(1, ...words.map((w) => w.length))
  let lines = wrapWords(words, width)
  while (lines.length > n && width < total) lines = wrapWords(words, ++width)
  return lines
}

/**
 * Lay the title out on the number's own grid pitch: same glyph size, same
 * letter spacing, centred where the number was. It stays on one line when it
 * fits inside the number grid's width, otherwise wraps at spaces onto up to
 * `maxLines` lines (balanced). A single word wider than the grid stays whole.
 */
export function layoutTitleGrid(
  text: string,
  field: Pick<LetterField, 'stepXem' | 'stepYem' | 'cols'>,
  maxLines: number,
  lineGapRows: number,
): TitleLayout {
  const words = text.split(' ').filter(Boolean)
  let lines = [words.join(' ')]
  for (let n = 1; n <= Math.max(1, maxLines); n++) {
    lines = balancedWrap(words, n)
    if (Math.max(...lines.map((l) => Array.from(l).length)) <= field.cols) break
  }

  const step = field.stepXem
  const lineStep = field.stepYem * lineGapRows
  const pos: number[] = []
  let maxLen = 0
  lines.forEach((line, li) => {
    const chars = Array.from(line)
    maxLen = Math.max(maxLen, chars.length)
    const y = ((lines.length - 1) / 2 - li) * lineStep
    chars.forEach((c, ci) => {
      if (c === ' ') return
      pos.push((ci - (chars.length - 1) / 2) * step, y)
    })
  })
  return {
    lines,
    slotPos: new Float32Array(pos),
    widthEm: Math.max(1, maxLen) * step,
    heightEm: (lines.length - 1) * lineStep + field.stepYem,
  }
}
