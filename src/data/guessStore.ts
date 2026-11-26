import { useCallback, useSyncExternalStore } from 'react';

/** One day's play: the guesses so far, and whether one was right. */
export interface DayRecord {
  guesses: string[];
  solved: boolean;
}

/** calendar id → December day → record */
type Store = Record<string, Record<number, DayRecord>>;

const KEY = 'movie-advent:guesses:v1';
const EMPTY: Record<number, DayRecord> = {};
const listeners = new Set<() => void>();
let cache: Store | undefined;

function read(): Store {
  if (!cache) {
    try {
      // `?reset` starts with no guesses, for testing.
      if (new URLSearchParams(window.location.search).has('reset')) localStorage.removeItem(KEY);
      cache = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
    } catch {
      cache = {};
    }
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: guesses still count for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Every day's record for a calendar, kept in this browser. */
export function useGuessRecords(calendarId: string): Record<number, DayRecord> {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => read()[calendarId] ?? EMPTY, [calendarId]),
    () => EMPTY,
  );
}

/** Every calendar's records (for building the list of calendars). */
export function useAllGuessRecords(): Store {
  return useSyncExternalStore(subscribe, read, () => ({}));
}

export function recordGuess(calendarId: string, day: number, guess: string, correct: boolean) {
  const store = read();
  const days = store[calendarId] ?? {};
  const previous = days[day] ?? { guesses: [], solved: false };
  if (previous.solved) return;
  write({
    ...store,
    [calendarId]: { ...days, [day]: { guesses: [...previous.guesses, guess], solved: correct } },
  });
}
