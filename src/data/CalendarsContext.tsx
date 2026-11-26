import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { getCalendarDay, readDayOverride } from '../lib/calendarDay';
import type { SharedCalendar } from '../shared/sharedCalendar';
import { buildCalendar } from './buildCalendar';
import { useAllGuessRecords } from './guessStore';
import { movieLists, sharedToMovieList } from './movieLists';
import { saveSharedCalendar, useSharedCalendars } from './sharedStore';
import type { Calendar } from './types';

interface CalendarsState {
  calendars: Calendar[];
  /** The calendar shown on the home page. */
  active: Calendar;
  setActiveId: (id: string) => void;
  /** The December day the calendars are on (today, the preview day, or ?day=N). */
  currentDay: number;
  /** Adds (or refreshes) a calendar opened from a share link and shows it. */
  openShared: (calendar: SharedCalendar) => void;
}

const CalendarsContext = createContext<CalendarsState | null>(null);

/** The user's calendars and which one is open, shared across pages. */
export function CalendarsProvider({ children }: { children: ReactNode }) {
  // Today's December day (or ?day=N); read once per visit.
  const [currentDay] = useState(() => getCalendarDay(new Date(), readDayOverride(window.location.search)));
  const records = useAllGuessRecords();
  const shared = useSharedCalendars();
  const calendars = useMemo(
    () =>
      [...movieLists, ...Object.values(shared).map(sharedToMovieList)].map((list) =>
        buildCalendar(list, currentDay, records[list.id] ?? {}),
      ),
    [currentDay, records, shared],
  );
  const [activeId, setActiveId] = useState(calendars[0].id);

  const value = useMemo(
    () => ({
      calendars,
      active: calendars.find((calendar) => calendar.id === activeId) ?? calendars[0],
      setActiveId,
      currentDay,
      openShared: (calendar: SharedCalendar) => {
        saveSharedCalendar(calendar);
        setActiveId(calendar.id);
      },
    }),
    [calendars, activeId, currentDay],
  );

  return <CalendarsContext.Provider value={value}>{children}</CalendarsContext.Provider>;
}

export function useCalendars(): CalendarsState {
  const state = useContext(CalendarsContext);
  if (!state) throw new Error('useCalendars must be used inside <CalendarsProvider>');
  return state;
}
