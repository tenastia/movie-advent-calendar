import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useCalendars } from '../../data/CalendarsContext';
import { CalendarCard } from '../CalendarCard/CalendarCard';
import styles from './CalendarPicker.module.css';

/**
 * Figma "Calendars" screen: the user's calendars over a blurred home page.
 * Opening one switches the home page to it; Escape or a click on the
 * backdrop goes back without changing anything.
 */
export function CalendarPicker() {
  const { calendars, active, setActiveId } = useCalendars();
  const navigate = useNavigate();
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Whatever opened the screen (the "Other Calendars" tab or the nav icon) still
  // has focus during the first render; focus goes back there on close.
  const [opener] = useState(() => document.activeElement as HTMLElement | null);
  const [restore] = useState(() => ({ focus: false }));

  // Focus the dialog itself (no visible ring); Tab then moves to the first card.
  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  // Runs when this screen unmounts, by which point the home page is no longer inert.
  useEffect(
    () => () => {
      if (restore.focus && opener && opener !== document.body && opener.isConnected) opener.focus();
    },
    [opener, restore],
  );

  const close = () => {
    restore.focus = true;
    navigate('/');
  };

  // Latest close() for the document-level Escape listener.
  const closeRef = useLatest(close);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeRef]);

  return (
    // The home page behind is made inert while this is open (see App), so the
    // dialog and the side nav are what remain reachable.
    <div
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-labelledby={headingId}
      tabIndex={-1}
      onClick={(event) => {
        if (!(event.target as Element).closest('article')) close();
      }}
    >
      <h2 id={headingId} className="visually-hidden">
        Calendars
      </h2>
      <div className={styles.cards}>
        {calendars.map((calendar, index) => (
          <CalendarCard
            key={calendar.id}
            calendar={calendar}
            index={index}
            isActive={calendar.id === active.id}
            onOpen={() => {
              setActiveId(calendar.id);
              navigate('/');
            }}
          />
        ))}
      </div>
    </div>
  );
}

function useLatest<T>(value: T) {
  const [ref] = useState(() => ({ current: value }));
  ref.current = value;
  return ref;
}
