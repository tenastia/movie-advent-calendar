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
        <div className={styles.meta}>
          {isActive && <span className={styles.showing}>Currently Showing</span>}
          <p className={styles.count}>Movies: {calendar.length}</p>
        </div>
        <button
          type="button"
          className={styles.open}
          aria-label={isActive ? `${calendar.name}, currently showing` : `Open ${calendar.name}`}
          aria-current={isActive ? 'true' : undefined}
          onClick={onOpen}
        >
          <img src={openIcon} width={60} height={60} alt="" />
        </button>
      </div>
    </article>
  );
}

interface CreateListCardProps {
  onCreate: () => void;
  /** Position in the row, for the staggered entrance. */
  index: number;
}

/** The empty card at the end of the row (Figma "CalCard" Variant2): starts a new list. */
export function CreateListCard({ onCreate, index }: CreateListCardProps) {
  return (
    <article className={`${styles.card} ${styles.create}`} style={{ '--index': index } as CSSProperties}>
      <div className={styles.body}>
        <h3 className={styles.name}>Create Your List</h3>
        <p className={styles.description}>Create your own list and send it to someone special.</p>
      </div>
      <div className={`${styles.footer} ${styles.footerEnd}`}>
        <button type="button" className={styles.open} aria-label="Create your own list" onClick={onCreate}>
          <img src={openIcon} width={60} height={60} alt="" />
        </button>
      </div>
    </article>
  );
}
