// Bundled fonts (no CDN). Each CSS file only declares @font-face rules; the
// woff2 subsets download lazily when `ensureFont` asks for them.
import '@fontsource/jetbrains-mono/100.css'
import '@fontsource/jetbrains-mono/200.css'
import '@fontsource/jetbrains-mono/300.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/jetbrains-mono/800.css'
import '@fontsource/inter/100.css'
import '@fontsource/inter/200.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/900.css'

const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'system-ui'])

export function cssFamily(family: string) {
  return GENERIC.has(family) ? family : `"${family}"`
}

export async function ensureFont(family: string, weight: number, text: string) {
  if (GENERIC.has(family) || typeof document === 'undefined' || !document.fonts) return
  try {
    await document.fonts.load(`${weight} 64px ${cssFamily(family)}`, text || 'A')
  } catch {
    // Fall back to whatever the browser has; the layout still works.
  }
}
