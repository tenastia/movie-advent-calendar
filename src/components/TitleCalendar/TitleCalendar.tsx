import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import dayCheck from '../../assets/ui/day-check.svg';
import dayFilled from '../../assets/ui/day-filled.svg';
import dayRing from '../../assets/ui/day-ring.svg';
import { getCountdownRange, getMonthWeeks } from '../../lib/calendar';
import styles from './TitleCalendar.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DECEMBER = 11;

interface TitleCalendarProps {
  year: number;
  /** Number of calendar days, counting down to Christmas Eve; earlier days are shown dimmed. */
  days: number;
  /** Movie titles, index 0 = 1 December. */
  titles: readonly string[];
  onChangeTitle: (index: number, title: string) => void;
}

/** Tooltips on the outer columns anchor to that side so long titles stay inside the panel. */
const tooltipAlign = (column: number) =>
  column <= 1 ? styles.tooltipStart : column >= 5 ? styles.tooltipEnd : '';

export function TitleCalendar({ year, days, titles, onChangeTitle }: TitleCalendarProps) {
  const monthId = useId();
  const inputId = useId();
  const weeks = useMemo(() => getMonthWeeks(year, DECEMBER), [year]);
  const [selected, setSelected] = useState<number | null>(null);
  // What's being typed. It only becomes the day's title (and marks the day as
  // done) on Enter or when focus leaves the field; Escape discards it.
  const [draft, setDraft] = useState('');
  const discardOnBlur = useRef(false);
  const dayButtons = useRef(new Map<number, HTMLButtonElement>());
  const { first, last } = getCountdownRange(days);

  // Close the title field if the selected day falls outside a shortened calendar.
  const selectedDay = selected !== null && selected >= first && selected <= last ? selected : null;
  const selectedRow =
    selectedDay === null
      ? -1
      : weeks.findIndex((week) => week.some((cell) => cell.inMonth && cell.day === selectedDay));

  const open = (day: number) => {
    setSelected(day);
    setDraft(titles[day - 1] ?? '');
  };

  const commit = (day: number) => onChangeTitle(day - 1, draft.trim());

  /** Close the field and return focus to its day, without saving again on blur. */
  const closeAndFocus = (day: number) => {
    discardOnBlur.current = true;
    setSelected(null);
    dayButtons.current.get(day)?.focus();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (selectedDay === null || event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      commit(selectedDay);
      // Save-and-continue: move on to the next day, or finish on the last one.
      if (selectedDay < last) open(selectedDay + 1);
      else closeAndFocus(selectedDay);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocus(selectedDay);
    }
  };

  const handleInputBlur = () => {
    // Clicking or tabbing anywhere else saves what was typed.
    if (selectedDay !== null && !discardOnBlur.current) commit(selectedDay);
    discardOnBlur.current = false;
    setSelected(null);
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
        {weeks.flat().map((cell, index) => {
          const key = cell.date.toISOString();
          if (!cell.inMonth || cell.day < first || cell.day > last) {
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
              onClick={() => open(cell.day)}
            >
              {filled ? (
                <>
                  <img className={styles.marker} src={dayFilled} width={25} height={25} alt="" />
                  <img className={styles.check} src={dayCheck} width={11.5} height={8.5} alt="" />
                  {!isSelected && (
                    // The title is already in the button's accessible name.
                    <span className={`${styles.tooltip} ${tooltipAlign(index % 7)}`} aria-hidden="true">
                      {title}
                    </span>
                  )}
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
            enterKeyHint={selectedDay < last ? 'next' : 'done'}
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
          />
        )}
      </div>
    </div>
  );
}
