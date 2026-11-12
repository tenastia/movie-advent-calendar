import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import dayCheck from '../../assets/ui/day-check.svg';
import dayFilled from '../../assets/ui/day-filled.svg';
import dayRing from '../../assets/ui/day-ring.svg';
import { getMonthWeeks } from '../../lib/calendar';
import styles from './TitleCalendar.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DECEMBER = 11;

interface TitleCalendarProps {
  year: number;
  /** Number of calendar days (from 1 December); later days are shown dimmed. */
  days: number;
  /** Movie titles, index 0 = 1 December. */
  titles: readonly string[];
  onChangeTitle: (index: number, title: string) => void;
}

export function TitleCalendar({ year, days, titles, onChangeTitle }: TitleCalendarProps) {
  const monthId = useId();
  const inputId = useId();
  const weeks = useMemo(() => getMonthWeeks(year, DECEMBER), [year]);
  const [selected, setSelected] = useState<number | null>(null);
  const dayButtons = useRef(new Map<number, HTMLButtonElement>());

  // Close the title field if the selected day falls outside a shortened calendar.
  const selectedDay = selected !== null && selected <= days ? selected : null;
  const selectedRow =
    selectedDay === null
      ? -1
      : weeks.findIndex((week) => week.some((cell) => cell.inMonth && cell.day === selectedDay));

  const closeAndFocus = (day: number) => {
    setSelected(null);
    dayButtons.current.get(day)?.focus();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (selectedDay === null) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      // Save-and-continue: move on to the next day, or finish on the last one.
      if (selectedDay < days) setSelected(selectedDay + 1);
      else closeAndFocus(selectedDay);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocus(selectedDay);
    }
  };

  return (
    <div className={styles.calendar}>
      <p id={monthId} className={styles.month}>
        December {year}
      </p>

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className={styles.grid} role="group" aria-labelledby={monthId}>
        {weeks.flat().map((cell) => {
          const key = cell.date.toISOString();
          if (!cell.inMonth || cell.day > days) {
            return (
              <span key={key} className={`${styles.cell} ${styles.muted}`} aria-hidden="true">
                {cell.day}
              </span>
            );
          }

          const title = titles[cell.day - 1] ?? '';
          const filled = title.trim() !== '';
          const isSelected = selectedDay === cell.day;

          return (
            <button
              key={key}
              ref={(element) => {
                if (element) dayButtons.current.set(cell.day, element);
                else dayButtons.current.delete(cell.day);
              }}
              type="button"
              className={`${styles.cell} ${styles.day}`}
              aria-label={`December ${cell.day}: ${filled ? title : 'no movie yet'}`}
              aria-expanded={isSelected}
              aria-controls={isSelected ? inputId : undefined}
              onClick={() => setSelected(cell.day)}
            >
              {filled ? (
                <>
                  <img className={styles.marker} src={dayFilled} width={25} height={25} alt="" />
                  <img className={styles.check} src={dayCheck} width={11.5} height={8.5} alt="" />
                </>
              ) : (
                <>
                  {isSelected && (
                    <img className={styles.marker} src={dayRing} width={23} height={23} alt="" />
                  )}
                  <span className={styles.number}>{cell.day}</span>
                </>
              )}
            </button>
          );
        })}

        {selectedDay !== null && (
          <input
            id={inputId}
            className={styles.titleInput}
            style={{ '--row': selectedRow } as CSSProperties}
            type="text"
            placeholder="Enter Movie Title"
            aria-label={`Movie title for December ${selectedDay}`}
            autoComplete="off"
            autoFocus
            value={titles[selectedDay - 1] ?? ''}
            onChange={(event) => onChangeTitle(selectedDay - 1, event.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
