import { useSyncExternalStore } from 'react';
import type { SharedCalendar } from '../shared/sharedCalendar';

/** Calendars opened from a share link, kept in this browser so they stay in the Calendars list. */
type Store = Record<string, SharedCalendar>;

const KEY = 'movie-advent:shared:v1';
const listeners = new Set<() => void>();
let cache: Store | undefined;

function read(): Store {
  if (!cache) {
    try {
      cache = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
    } catch {
      cache = {};
    }
  }
  return cache;
}

export function saveSharedCalendar(calendar: SharedCalendar) {
  cache = { ...read(), [calendar.id]: calendar };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage unavailable: it stays for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function getSavedSharedCalendar(id: string): SharedCalendar | undefined {
  return read()[id];
}

export function useSharedCalendars(): Store {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => ({}),
  );
}
