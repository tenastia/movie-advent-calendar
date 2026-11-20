import { useId, type KeyboardEvent } from 'react';
import { getCountdownRange } from '../../lib/calendarGrid';
import text from '../../styles/text.module.css';
import styles from './DayList.module.css';

const shortMonthFormat = new Intl.DateTimeFormat('en', { month: 'short' });
const longDayFormat = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric' });

interface DayListProps {
  year: number;
  /** 0-based month. */
  month: number;
  /** Number of calendar days, counting down to Christmas Eve. */
  days: number;
  titles: Record<number, string>;
  onTitleChange: (day: number, title: string) => void;
}

/** List view of the day picker: one `InputList` row per day, in a scrolling panel. */
export function DayList({ year, month, days, titles, onTitleChange }: DayListProps) {
  const idPrefix = useId();
  const inputId = (day: number) => `${idPrefix}day-${day}`;
  const monthShort = shortMonthFormat.format(new Date(year, month, 1));
  const { first, last } = getCountdownRange(days);

  // Enter moves on to the next day, so titles can be typed in one go; the last day just closes.
  const handleKeyDown = (day: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const next = document.getElementById(inputId(day + 1));
    if (next) next.focus();
    else event.currentTarget.blur();
  };

  return (
    <div className={styles.wrapper}>
      <ol className={styles.list}>
        {Array.from({ length: last - first + 1 }, (_, index) => first + index).map((day) => (
          <li key={day} className={styles.row}>
            <label className={styles.date} htmlFor={inputId(day)} aria-hidden="true">
              <span className={styles.dayNumber}>{String(day).padStart(2, '0')}</span>
              <span className={styles.month}>{monthShort.toUpperCase()}</span>
            </label>
            <input
              id={inputId(day)}
              className={styles.input}
              type="text"
              aria-label={`Movie title for ${longDayFormat.format(new Date(year, month, day))}`}
              placeholder={`Add movie title for ${monthShort} ${day}`}
              autoComplete="off"
              enterKeyHint={day < last ? 'next' : 'done'}
              value={titles[day] ?? ''}
              onChange={(event) => onTitleChange(day, event.target.value)}
              onKeyDown={handleKeyDown(day)}
            />
          </li>
        ))}
      </ol>
      <p className={`${text.fieldLabel} ${styles.hint}`} aria-hidden="true">
        Scroll
      </p>
    </div>
  );
}
