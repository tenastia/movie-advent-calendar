const MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.640028',
  'video/mp4;codecs=avc1',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

export function canRecord() {
  return typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement.prototype.captureStream === 'function'
}

function pickMime() {
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? ''
}

/** Records a canvas in real time with MediaRecorder. */
export class CanvasRecorder {
  private rec: MediaRecorder
  private chunks: Blob[] = []
  private done: Promise<Blob>
  readonly mime: string

  constructor(canvas: HTMLCanvasElement, fps: number, bitsPerSecond: number) {
    const stream = canvas.captureStream(fps)
    this.mime = pickMime()
    this.rec = new MediaRecorder(stream, {
      mimeType: this.mime || undefined,
      videoBitsPerSecond: bitsPerSecond,
    })
    this.rec.ondataavailable = (e) => {
      if (e.data.size) this.chunks.push(e.data)
    }
    this.done = new Promise((resolve) => {
      this.rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        resolve(new Blob(this.chunks, { type: this.rec.mimeType || this.mime || 'video/webm' }))
      }
    })
  }

  start() {
    this.rec.start(250)
  }

  stop() {
    if (this.rec.state !== 'inactive') this.rec.stop()
    return this.done
  }

  get extension() {
    return (this.rec.mimeType || this.mime).includes('mp4') ? 'mp4' : 'webm'
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
