import type { DayStatus } from '../../data/types';
import { StatusLabel } from '../StatusLabel/StatusLabel';
import styles from './CalCard.module.css';

interface CalCardProps {
  day: number;
  title: string;
  status: DayStatus;
  /** Figma `CalCard` variant: `current` is today's card, `past` everything before. */
  variant: 'past' | 'current';
}

export function CalCard({ day, title, status, variant }: CalCardProps) {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.body}>
        <p className={styles.day}>
          <span className="visually-hidden">Day </span>
          {String(day).padStart(2, '0')}
        </p>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <StatusLabel status={status} />
    </article>
  );
}
