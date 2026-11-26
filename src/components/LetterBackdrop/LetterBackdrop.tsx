import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useState, type RefObject } from 'react';
import type { PerspectiveCamera } from 'three';
import { PHONE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { clock } from '../../motion/clock';
import { LetterScene } from '../../motion/LetterScene';
import { DEFAULT_PRESET, type Preset } from '../../motion/presets';
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
  /** The motion to play (the calendar's reveal style). */
  preset?: Preset;
}

/**
 * On phones the screen's width limits the number, and the preset's share of
 * it leaves the number tiny. There it spans the content column instead: the
 * 358px between the 22px margins of a 402px screen, as wide as the guess field.
 */
const PHONE_NUMBER_FILL = 358 / 402;

/**
 * …but never taller than this share of the reveal frame (the space between the
 * header and today's date box), so on short phones and wider phone-layout
 * windows the number shrinks to clear the countdown and the box. The small
 * margin leaves room for the letter cells at the number's edges.
 */
const PHONE_FRAME_HEIGHT_FILL = 0.9;

/** The element's height, kept up to date as the layout changes. */
function useElementHeight(ref: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return height;
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

/** The letters, sized to fit the reveal frame on phones (see PHONE_FRAME_HEIGHT_FILL). */
function FittedLetters({
  anchorRef,
  isPhone,
  ...scene
}: Omit<Parameters<typeof LetterScene>[0], 'fit'> & { anchorRef: RefObject<HTMLElement | null>; isPhone: boolean }) {
  const canvasHeight = useThree((s) => s.size.height);
  const frameHeight = useElementHeight(anchorRef);
  const numberFill = scene.params.numberFill;
  const fit = useMemo(() => {
    if (!isPhone || frameHeight <= 0 || canvasHeight <= 0) return undefined;
    return { width: numberFill, height: (frameHeight * PHONE_FRAME_HEIGHT_FILL) / canvasHeight };
  }, [isPhone, frameHeight, canvasHeight, numberFill]);

  return <LetterScene {...scene} fit={fit} />;
}

export default function LetterBackdrop({
  day,
  title,
  nextTitle = '',
  anchorRef,
  background,
  preset = DEFAULT_PRESET,
}: LetterBackdropProps) {
  const reduced = usePrefersReducedMotion();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const params = useMemo(() => {
    const base = preset.params;
    const numberFill = isPhone ? Math.max(base.numberFill, PHONE_NUMBER_FILL) : base.numberFill;
    return { ...base, numberFill, background };
  }, [background, isPhone, preset]);

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
        <FittedLetters
          anchorRef={anchorRef}
          isPhone={isPhone}
          params={params}
          modeId={preset.mode}
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
