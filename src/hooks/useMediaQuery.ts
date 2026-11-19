import { useCallback, useSyncExternalStore } from 'react';

/** Phones: the Figma 402px frames. The stylesheets use the same 639px breakpoint. */
export const PHONE_QUERY = '(max-width: 639px)';

/** Whether a media query matches, kept up to date as the window changes. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
