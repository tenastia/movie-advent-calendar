import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { clock } from '../../motion/clock';
import { DAY } from '../../motion/day';
import { LetterScene } from '../../motion/LetterScene';
import { presetForStyle } from '../../motion/presets';
import { usePrefersReducedMotion } from '../../motion/usePrefersReducedMotion';
import styles from './MotionPreview.module.css';

/**
 * The moment the preview shows: 06:00, as the last letters let go of the
 * number, playing on at real speed — the same motion the home page shows
 * then (?time=06:00), rather than a sped-up day that suggests it all happens
 * in seconds.
 */
const PREVIEW_TIME = 6 * 3600;

interface MotionPreviewProps {
  style: 'drifting' | 'blizzard';
  day: number;
  title: string;
  /** Canvas clear colour; matches the preview panel's stage. */
  background: string;
}

/** The Create page's preview of the reveal: the day's letter motion at 06:00, at real speed. */
export default function MotionPreview({ style, day, title, background }: MotionPreviewProps) {
  const reduced = usePrefersReducedMotion();
  const preset = presetForStyle(style);
  const params = useMemo(() => ({ ...preset.params, background }), [preset, background]);

  // Drive the shared motion clock while the preview is up; hand it back as the home page expects.
  useEffect(() => {
    clock.set({ time: PREVIEW_TIME, playing: true, speed: 1, loop: true, duration: DAY });
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
          smoothing={false}
        />
      </Canvas>
    </div>
  );
}
