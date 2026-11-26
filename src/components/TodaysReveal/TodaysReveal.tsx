import { lazy, Suspense, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RevealImage, RevealStyle } from '../../data/types';
import { presetForStyle } from '../../motion/presets';
import { RevealArt } from '../RevealArt/RevealArt';
import styles from './TodaysReveal.module.css';

// Three.js only downloads once the page has rendered.
const LetterBackdrop = lazy(() => import('../LetterBackdrop/LetterBackdrop'));

interface TodaysRevealProps {
  day: number;
  title: string;
  nextTitle?: string;
  /** Static artwork, shown when the browser has no WebGL; in the Image style, today's photo. */
  image: RevealImage;
  revealStyle?: RevealStyle;
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function pageBackground() {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--colour-background-background')
    .trim();
  return value || '#111111';
}

export function TodaysReveal({ day, title, nextTitle, image, revealStyle = 'drifting' }: TodaysRevealProps) {
  const frameRef = useRef<HTMLElement>(null);
  const [webgl] = useState(hasWebGL);
  const [background] = useState(pageBackground);

  // Image style: today's photo is the clue, with no letters.
  if (revealStyle === 'image') {
    return (
      <figure className={styles.photo}>
        <img src={image.src} alt={image.alt} />
      </figure>
    );
  }

  if (!webgl) return <RevealArt image={image} />;

  // The frame keeps its place in the layout; the letters render in a
  // full-viewport canvas behind the page, centred on this frame.
  return (
    <>
      <figure ref={frameRef} className={styles.frame} role="img" aria-label={image.alt} />
      {createPortal(
        <Suspense fallback={null}>
          <LetterBackdrop
            day={day}
            title={title}
            nextTitle={nextTitle}
            anchorRef={frameRef}
            background={background}
            preset={presetForStyle(revealStyle)}
          />
        </Suspense>,
        document.body,
      )}
    </>
  );
}
