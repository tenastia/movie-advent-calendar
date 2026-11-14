import type { CSSProperties } from 'react';
import type { RevealImage } from '../../data/types';
import styles from './TodaysReveal.module.css';

interface TodaysRevealProps {
  image: RevealImage;
  /** Rendered width in px; height follows the 638×441 frame ratio. */
  width?: number;
}

export function TodaysReveal({ image, width = 638 }: TodaysRevealProps) {
  return (
    <figure className={styles.reveal} style={{ '--reveal-width': `${width}px` } as CSSProperties}>
      <img
        className={image.crop ? styles.cropped : styles.cover}
        style={image.crop}
        src={image.src}
        alt={image.alt}
      />
    </figure>
  );
}
