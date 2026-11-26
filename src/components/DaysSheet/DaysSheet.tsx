import { useEffect, useId, useRef } from 'react';
import type { CalendarDay } from '../../data/types';
import { CardStack } from '../CardStack/CardStack';
import styles from './DaysSheet.module.css';

interface DaysSheetProps {
  days: CalendarDay[];
  today: number;
  onClose: () => void;
}

/**
 * The days so far, opened from today's date box on phones: the deck of day
 * cards (tap to flip back through earlier days and how they were guessed) over
 * the dimmed home page, as the Calendars screen does. A tap outside the deck or
 * Escape closes it.
 */
export function DaysSheet({ days, today, onClose }: DaysSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  // Start on the deck, so the next tap or Enter flips to the day before.
  useEffect(() => {
    const sheet = sheetRef.current;
    const flip = sheet?.querySelector<HTMLButtonElement>('button');
    (flip ?? sheet)?.focus({ preventScroll: true });
  }, []);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      ref={sheetRef}
      className={styles.sheet}
      role="dialog"
      aria-labelledby={headingId}
      tabIndex={-1}
      onClick={(event) => {
        if (!(event.target as Element).closest('section')) onClose();
      }}
    >
      <h2 id={headingId} className="visually-hidden">
        Your days and guesses
      </h2>
      <CardStack days={days} today={today} className={styles.deck} />
    </div>
  );
}
