import { getCountdownRange } from '../../lib/calendar';
import styles from './TitleList.module.css';

interface TitleListProps {
  /** Number of calendar days, counting down to Christmas Eve. */
  days: number;
  /** Movie titles, index 0 = 1 December. */
  titles: readonly string[];
  onChangeTitle: (index: number, title: string) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** List view of the calendar: one row per day, each with its movie title. */
export function TitleList({ days, titles, onChangeTitle }: TitleListProps) {
  const { first } = getCountdownRange(days);

  return (
    <div className={styles.wrapper}>
      <ol className={styles.list}>
        {Array.from({ length: days }, (_, row) => {
          const day = first + row;
          const index = day - 1;
          return (
            <li key={day} className={styles.row}>
              <div className={styles.date} aria-hidden="true">
                <span className={styles.dayNumber}>{pad(day)}</span>
                <span className={styles.month}>DEC</span>
              </div>
              <input
                className={styles.input}
                type="text"
                placeholder={`Add movie title for Dec ${day}`}
                aria-label={`Movie title for December ${day}`}
                autoComplete="off"
                value={titles[index] ?? ''}
                onChange={(event) => onChangeTitle(index, event.target.value)}
              />
            </li>
          );
        })}
      </ol>

      <p className={styles.scrollHint} aria-hidden="true">
        Scroll
      </p>
    </div>
  );
}
