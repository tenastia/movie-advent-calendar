import type { RevealImage } from '../../data/types';
import styles from './TodaysReveal.module.css';

interface TodaysRevealProps {
  image: RevealImage;
}

export function TodaysReveal({ image }: TodaysRevealProps) {
  return (
    <figure className={styles.reveal}>
      <img
        className={image.crop ? styles.cropped : styles.cover}
        style={image.crop}
        src={image.src}
        alt={image.alt}
      />
    </figure>
  );
}
