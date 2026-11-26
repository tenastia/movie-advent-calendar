import TinySDF from '@mapbox/tiny-sdf'
import { DataTexture, LinearFilter, RedFormat, UnsignedByteType } from 'three'
import { cssFamily } from './fonts'

// Atlas resolution. Outside the edge the SDF encodes RADIUS * (1 - CUTOFF) px of
// distance, which is the headroom available for fake depth-of-field blur.
const FONT_SIZE = 64
const BUFFER = 26
const RADIUS = 32
const CUTOFF = 0.25

export interface GlyphAtlas {
  texture: DataTexture
  chars: string[]
  index: Map<string, number>
  cols: number
  rows: number
  /** Advance width of the monospace font, in em. */
  advanceEm: number
  /** Size of one glyph quad (cell incl. SDF padding), in em. */
  quadW: number
  quadH: number
  sdfEdge: number
  sdfRadius: number
  /** Distance (atlas px) the SDF encodes outside the stroke. */
  outsidePx: number
  dispose(): void
}

/**
 * Build a single-channel SDF atlas for `chars` at runtime with tiny-sdf.
 * Every glyph sits in a fixed cell: pen origin centered on the advance box,
 * baseline at a fixed height, so quads line up like monospace text.
 */
export function buildAtlas(chars: string[], family: string, weight: number): GlyphAtlas {
  const fontFamily = cssFamily(family)
  const sdf = new TinySDF({
    fontSize: FONT_SIZE,
    buffer: BUFFER,
    radius: RADIUS,
    cutoff: CUTOFF,
    fontFamily,
    fontWeight: String(weight),
  })

  // Font metrics from a scratch canvas.
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.font = `${weight} ${FONT_SIZE}px ${fontFamily}`
  const m = ctx.measureText('M')
  const advancePx = m.width
  const ascent = Math.ceil(m.fontBoundingBoxAscent || FONT_SIZE * 0.95)
  const descent = Math.ceil(m.fontBoundingBoxDescent || FONT_SIZE * 0.3)

  const cellW = Math.ceil(advancePx) + 2 * BUFFER
  const cellH = ascent + descent + 2 * BUFFER
  const n = Math.max(1, chars.length)
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const width = cols * cellW
  const height = rows * cellH
  const data = new Uint8Array(width * height)

  const penX = (cellW - advancePx) / 2
  const baseline = BUFFER + ascent
  const index = new Map<string, number>()

  chars.forEach((ch, i) => {
    index.set(ch, i)
    const g = sdf.draw(ch)
    if (!g.width || !g.height) return
    // tiny-sdf puts the pen origin at x = BUFFER - glyphLeft and the baseline at y = BUFFER + glyphTop.
    const ox = Math.round(penX - (BUFFER - g.glyphLeft))
    const oy = Math.round(baseline - (BUFFER + g.glyphTop))
    const cx = (i % cols) * cellW
    const cy = Math.floor(i / cols) * cellH
    for (let y = 0; y < g.height; y++) {
      const ty = oy + y
      if (ty < 0 || ty >= cellH) continue
      for (let x = 0; x < g.width; x++) {
        const tx = ox + x
        if (tx < 0 || tx >= cellW) continue
        const v = g.data[y * g.width + x]
        const di = (cy + ty) * width + cx + tx
        if (v > data[di]) data[di] = v
      }
    }
  })

  const texture = new DataTexture(data, width, height, RedFormat, UnsignedByteType)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.unpackAlignment = 1
  texture.flipY = false
  texture.needsUpdate = true

  return {
    texture,
    chars,
    index,
    cols,
    rows,
    advanceEm: advancePx / FONT_SIZE,
    quadW: cellW / FONT_SIZE,
    quadH: cellH / FONT_SIZE,
    sdfEdge: 1 - CUTOFF,
    sdfRadius: RADIUS,
    outsidePx: Math.min(RADIUS * (1 - CUTOFF), BUFFER),
    dispose: () => texture.dispose(),
  }
}
