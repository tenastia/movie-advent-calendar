import type { CSSProperties } from 'react';
import type { CalendarDay } from '../../data/types';
import { CalCard } from '../CalCard/CalCard';
import styles from './CardStack.module.css';

/**
 * Position (top-left of the unrotated 167×168 card) and rotation of each card
 * in the pile, bottom to top, taken from the Figma "Frame 47" layout.
 */
const PILE_LAYOUT = [
  { x: 9, y: 4.88, rotate: -3.45 },
  { x: 12.91, y: 16.76, rotate: 3.45 },
  { x: 5.46, y: 27.3, rotate: -3.85 },
  { x: 16, y: 32.88, rotate: 3.75 },
] as const;

interface CardStackProps {
  /** Revealed days, oldest first. Only the most recent few are shown. */
  days: CalendarDay[];
  today: number;
}

export function CardStack({ days, today }: CardStackProps) {
  const visible = days.slice(-PILE_LAYOUT.length);
  const layout = PILE_LAYOUT.slice(PILE_LAYOUT.length - visible.length);

  return (
    <aside className={styles.stack} aria-labelledby="card-stack-heading">
      <h2 id="card-stack-heading" className="visually-hidden">
        Your calendar so far
      </h2>
      <ol className={styles.pile}>
        {visible.map((day, index) => {
          const { x, y, rotate } = layout[index];
          const style = {
            '--x': `${x}px`,
            '--y': `${y}px`,
            '--rotate': `${rotate}deg`,
          } as CSSProperties;
          return (
            <li key={day.day} className={styles.item} style={style}>
              <CalCard
                day={day.day}
                title={day.title}
                status={day.status}
                variant={day.day === today ? 'current' : 'past'}
              />
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
