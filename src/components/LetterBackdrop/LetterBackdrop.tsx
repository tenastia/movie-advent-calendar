import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, type RefObject } from 'react';
import type { PerspectiveCamera } from 'three';
import { clock } from '../../motion/clock';
import { LetterScene } from '../../motion/LetterScene';
import { DEFAULT_PRESET } from '../../motion/presets';
import { usePrefersReducedMotion } from '../../motion/usePrefersReducedMotion';
import { makeDayTime, readClockOverrides } from '../../motion/wallClock';
import styles from './LetterBackdrop.module.css';

interface LetterBackdropProps {
  day: number;
  title: string;
  /** Title of the next day; its number fades in at midnight. Blank = same title. */
  nextTitle?: string;
  /** The number is centred on this element (the reveal frame in the page layout). */
  anchorRef: RefObject<HTMLElement | null>;
  /** Canvas clear colour; should match the page background. */
  background: string;
}

/** Drives the shared motion clock from the wall clock (plus any ?time / ?speed override). */
function WallClock() {
  const dayTime = useMemo(() => makeDayTime(readClockOverrides(window.location.search)), []);
  useLayoutEffect(() => {
    clock.set({ playing: false, speed: 1, loop: true });
    clock.seek(dayTime());
  }, [dayTime]);
  useFrame(() => clock.seek(dayTime()));
  return null;
}

/**
 * Shifts the camera's view so the scene centre (where the number and the title
 * sit) lands on the anchor's centre instead of the middle of the viewport.
 */
function CentreOn({ anchorRef }: { anchorRef: RefObject<HTMLElement | null> }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      camera.setViewOffset(width, height, width / 2 - cx, height / 2 - cy, width, height);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update);
      camera.clearViewOffset();
    };
  }, [anchorRef, camera, width, height]);

  return null;
}

export default function LetterBackdrop({ day, title, nextTitle = '', anchorRef, background }: LetterBackdropProps) {
  const reduced = usePrefersReducedMotion();
  const params = useMemo(() => ({ ...DEFAULT_PRESET.params, background }), [background]);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        flat
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: params.fov, near: 0.1, far: 1000, position: [0, 0, 25] }}
      >
        <WallClock />
        <CentreOn anchorRef={anchorRef} />
        <LetterScene
          params={params}
          modeId={DEFAULT_PRESET.mode}
          day={day}
          title={title}
          nextTitle={nextTitle}
          reduced={reduced}
          smoothing={false}
        />
      </Canvas>
    </div>
  );
}
