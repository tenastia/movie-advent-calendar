import type { CSSProperties } from 'react';
import type { RevealImage } from '../../data/types';
import styles from './RevealArt.module.css';

interface RevealArtProps {
  image: RevealImage;
  /** Rendered width in px; height follows the 638×441 frame ratio. */
  width?: number;
}

/**
 * The static reveal artwork. Used for the Create page preview, and on the
 * home page in browsers without WebGL (where the letter engine can't run).
 */
export function RevealArt({ image, width = 638 }: RevealArtProps) {
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
