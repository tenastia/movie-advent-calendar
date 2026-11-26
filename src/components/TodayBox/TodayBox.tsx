import type { Ref } from 'react';
import outline from '../../assets/ui/today-box-outline.svg';
import { useRevealProgress } from '../../hooks/useRevealProgress';
import styles from './TodayBox.module.css';

interface TodayBoxProps {
  day: number;
  /** Whether the days it opens are showing. */
  expanded: boolean;
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Today's date on the phone home page (Figma 48×48 "CalCard"), in place of the
 * pile of day cards. Its outline carries the same reveal-progress ring as
 * today's card; tapping it opens the days so far and how they were guessed.
 */
export function TodayBox({ day, expanded, onOpen, ref }: TodayBoxProps) {
  const progressRef = useRevealProgress<HTMLSpanElement>();

  return (
    <button
      ref={ref}
      type="button"
      className={styles.box}
      aria-label={`December ${day}, today. Show your days and guesses`}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onOpen}
    >
      <img className={styles.outline} src={outline} width={49} height={49} alt="" />
      {/* Time until the reveal: fills clockwise from the top centre. */}
      <span ref={progressRef} className={styles.progress} aria-hidden="true" />
      <span className={styles.day} aria-hidden="true">
        {String(day).padStart(2, '0')}
      </span>
    </button>
  );
}
