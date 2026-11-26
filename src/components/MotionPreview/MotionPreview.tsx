import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { clock } from '../../motion/clock';
import { DAY } from '../../motion/day';
import { LetterScene } from '../../motion/LetterScene';
import { presetForStyle } from '../../motion/presets';
import { usePrefersReducedMotion } from '../../motion/usePrefersReducedMotion';
import styles from './MotionPreview.module.css';

/** The preview loops from midnight to 13:00: the number comes apart, then the title forms and rests a moment. */
const LOOP_END = 13 * 3600;
/** …in about 20 seconds. */
const LOOP_SECONDS = 20;

interface MotionPreviewProps {
  style: 'drifting' | 'blizzard';
  day: number;
  title: string;
  /** Canvas clear colour; matches the preview panel's stage. */
  background: string;
}

/** The Create page's preview of a reveal style: the day's letter motion, sped up and looping. */
export default function MotionPreview({ style, day, title, background }: MotionPreviewProps) {
  const reduced = usePrefersReducedMotion();
  const preset = presetForStyle(style);
  const params = useMemo(() => ({ ...preset.params, background }), [preset, background]);

  // Drive the shared motion clock while the preview is up; hand it back as the home page expects.
  useEffect(() => {
    clock.set({ time: 0, playing: true, speed: LOOP_END / LOOP_SECONDS, loop: true, duration: LOOP_END });
    return () => clock.set({ time: 0, playing: false, speed: 1, loop: true, duration: DAY });
  }, []);

  return (
    <div className={styles.preview} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        flat
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: params.fov, near: 0.1, far: 1000, position: [0, 0, 25] }}
      >
        <LetterScene
          params={params}
          modeId={preset.mode}
          day={day}
          title={title}
          nextTitle={title}
          reduced={reduced}
          smoothing
        />
      </Canvas>
    </div>
  );
}
