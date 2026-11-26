import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useCalendars } from '../../data/CalendarsContext';
import { CalendarNotFound, fetchSharedCalendar } from '../../data/sharedApi';
import { getSavedSharedCalendar } from '../../data/sharedStore';
import styles from './OpenSharedCalendar.module.css';

type State = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

/**
 * /c/:id — a calendar someone shared. Fetches it (titles up to tomorrow), adds
 * it to this browser's calendars and shows it on the home page underneath.
 * Offline, a copy opened before is shown instead.
 */
export function OpenSharedCalendar() {
  const { id = '' } = useParams();
  const { currentDay, openShared } = useCalendars();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetchSharedCalendar(id, currentDay)
      .then((calendar) => {
        if (cancelled) return;
        openShared(calendar);
        setState({ status: 'ready' });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        const saved = error instanceof CalendarNotFound ? undefined : getSavedSharedCalendar(id);
        if (saved) {
          openShared(saved);
          setState({ status: 'ready' });
        } else {
          setState({ status: 'error', message: error.message });
        }
      });
    return () => {
      cancelled = true;
    };
    // Refetch only for a different calendar or day; openShared just stores and selects.
  }, [id, currentDay]);

  if (state.status === 'ready') return null;

  return (
    <div className={styles.screen}>
      {state.status === 'loading' ? (
        <p className={styles.message} role="status">
          Opening the calendar…
        </p>
      ) : (
        <div className={styles.error} role="alert">
          <p className={styles.message}>{state.message}</p>
          <Link className={styles.link} to="/">
            Go to your calendars
          </Link>
        </div>
      )}
    </div>
  );
}
