import { createRoot } from 'react-dom/client'
import { clock } from '../motion/clock'
import { LabApp } from './LabApp'
import './lab.css'

// Handy for console scripting in dev: __clock.set({ playing: false }); __clock.seek(4.2)
if (import.meta.env.DEV) (window as unknown as { __clock: typeof clock }).__clock = clock

createRoot(document.getElementById('root')!).render(<LabApp />)
