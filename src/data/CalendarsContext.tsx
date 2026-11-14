import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { mockCalendars } from './mockCalendar';
import type { Calendar } from './types';

interface CalendarsState {
  calendars: Calendar[];
  /** The calendar shown on the home page. */
  active: Calendar;
  setActiveId: (id: string) => void;
}

const CalendarsContext = createContext<CalendarsState | null>(null);

/** The user's calendars and which one is open, shared across pages. */
export function CalendarsProvider({ children }: { children: ReactNode }) {
  const calendars = mockCalendars;
  const [activeId, setActiveId] = useState(calendars[0].id);

  const value = useMemo(
    () => ({
      calendars,
      active: calendars.find((calendar) => calendar.id === activeId) ?? calendars[0],
      setActiveId,
    }),
    [calendars, activeId],
  );

  return <CalendarsContext.Provider value={value}>{children}</CalendarsContext.Provider>;
}

export function useCalendars(): CalendarsState {
  const state = useContext(CalendarsContext);
  if (!state) throw new Error('useCalendars must be used inside <CalendarsProvider>');
  return state;
}
