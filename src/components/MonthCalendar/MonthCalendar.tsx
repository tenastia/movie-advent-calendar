import { useEffect, useId, useMemo, useRef, useState } from 'react';
import dayCheck from '../../assets/create/day-check.svg';
import dayFilled from '../../assets/create/day-filled.svg';
import daySelected from '../../assets/create/day-selected.svg';
import { getCountdownRange, getMonthWeeks } from '../../lib/calendarGrid';
import text from '../../styles/text.module.css';
import { InputField } from '../InputField/InputField';
import styles from './MonthCalendar.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Row pitch (32px row + 8px gap) and the title field's offset from its row's top, per the design. */
const ROW_PITCH = 40;
const POPOVER_OFFSET = 37;

const monthFormat = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
const dayFormat = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' });

interface MonthCalendarProps {
  year: number;
  /** 0-based month. */
  month: number;
  /** Number of calendar days, counting down to Christmas Eve; the rest of the month is dimmed. */
  days: number;
  titles: Record<number, string>;
  onTitleChange: (day: number, title: string) => void;
}

/**
 * The "December 2026 Calendar" picker. Tapping a day opens a title field under
 * its week; days that already have a movie show the check mark. Only the days
 * counting down to Christmas Eve can be picked.
 */
export function MonthCalendar({ year, month, days, titles, onTitleChange }: MonthCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dayButtons = useRef(new Map<number, HTMLButtonElement>());
  const monthId = useId();
  const popoverId = useId();

  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month]);
  const { first, last } = getCountdownRange(days);
  // Close the title field if the selected day falls outside a shortened calendar.
  const openDay = selectedDay !== null && selectedDay >= first && selectedDay <= last ? selectedDay : null;
  const openRow =
    openDay === null
      ? -1
      : weeks.findIndex((week) => week.some((cell) => cell.inMonth && cell.date.getDate() === openDay));

  useEffect(() => {
    if (openDay !== null) inputRef.current?.focus();
  }, [openDay]);

  const close = () => {
    if (openDay !== null) dayButtons.current.get(openDay)?.focus();
    setSelectedDay(null);
  };

  return (
    <div className={styles.calendar} role="group" aria-labelledby={monthId}>
      <p id={monthId} className={text.fieldLabel}>
        {monthFormat.format(new Date(year, month, 1))}
      </p>

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className={styles.weekday}>
            {weekday}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {weeks.map((week) => (
          <div key={week[0].date.toISOString()} className={styles.week}>
            {week.map(({ date, inMonth }) => {
              const day = date.getDate();
              if (!inMonth || day < first || day > last) {
                return (
                  <span key={date.toISOString()} className={`${styles.day} ${styles.dim}`} aria-hidden="true">
                    {day}
                  </span>
                );
              }

              const title = titles[day]?.trim();
              const isOpen = day === openDay;
              const showCheck = Boolean(title) && !isOpen;
              return (
                <button
                  key={date.toISOString()}
                  ref={(node) => {
                    if (node) dayButtons.current.set(day, node);
                    else dayButtons.current.delete(day);
                  }}
                  type="button"
                  className={styles.day}
                  aria-label={`${dayFormat.format(date)}${title ? `: ${title}` : ', no movie yet'}`}
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? popoverId : undefined}
                  // Keep focus in the open title field so switching days doesn't blur-close it first.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => (isOpen ? close() : setSelectedDay(day))}
                >
                  {isOpen && (
                    <img className={styles.marker} src={daySelected} width={23} height={23} alt="" />
                  )}
                  {showCheck && (
                    <img className={styles.marker} src={dayFilled} width={25} height={25} alt="" />
                  )}
                  {showCheck ? (
                    <img className={styles.check} src={dayCheck} alt="" />
                  ) : (
                    <span className={styles.number}>{day}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {openDay !== null && (
          <div
            id={popoverId}
            className={styles.popover}
            style={{ top: openRow * ROW_PITCH + POPOVER_OFFSET }}
          >
            <InputField
              ref={inputRef}
              className={styles.titleInput}
              aria-label={`Movie title for ${dayFormat.format(new Date(year, month, openDay))}`}
              placeholder="Enter Movie Title"
              autoComplete="off"
              enterKeyHint="done"
              value={titles[openDay] ?? ''}
              onChange={(event) => onTitleChange(openDay, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === 'Escape') {
                  event.preventDefault();
                  close();
                }
              }}
              onBlur={() => setSelectedDay(null)}
            />
            {(titles[openDay] ?? '') !== '' && (
              <button
                type="button"
                className={styles.clear}
                aria-label="Clear title"
                // Out of the tab order (Tab leaving the field closes it); select-all + delete does the same.
                tabIndex={-1}
                // Keep focus, and the on-screen keyboard, in the field.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onTitleChange(openDay, '');
                  inputRef.current?.focus();
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
