import type { CSSProperties } from 'react';
import openIcon from '../../assets/ui/open-calendar.svg';
import type { Calendar } from '../../data/types';
import styles from './CalendarCard.module.css';

interface CalendarCardProps {
  calendar: Calendar;
  /** Whether this is the calendar currently open on the home page. */
  isActive: boolean;
  onOpen: () => void;
  /** Position in the row, for the staggered entrance. */
  index: number;
}

/** A calendar on the Calendars screen (Figma "CalCard", 288×293). The whole card opens it. */
export function CalendarCard({ calendar, isActive, onOpen, index }: CalendarCardProps) {
  return (
    <article className={styles.card} style={{ '--index': index } as CSSProperties}>
      <div className={styles.body}>
        <h3 className={styles.name}>{calendar.name}</h3>
        <p className={styles.description}>{calendar.description}</p>
      </div>
      <div className={styles.footer}>
        <p className={styles.count}>Movies: {calendar.length}</p>
        <button
          type="button"
          className={styles.open}
          aria-label={`Open ${calendar.name}`}
          aria-current={isActive ? 'true' : undefined}
          onClick={onOpen}
        >
          <img src={openIcon} width={60} height={60} alt="" />
        </button>
      </div>
    </article>
  );
}
