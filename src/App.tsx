import { useEffect, useSyncExternalStore } from 'react';
import { parseRoute, type Route } from './lib/route';
import { CreatePage } from './pages/CreatePage/CreatePage';
import { HomePage } from './pages/HomePage/HomePage';

const TITLES: Record<Route, string> = {
  home: 'Movie Advent Calendar',
  create: 'Create a calendar · Movie Advent Calendar',
};

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function App() {
  const route = useSyncExternalStore(subscribe, () => parseRoute(window.location.hash));

  useEffect(() => {
    document.title = TITLES[route];
    window.scrollTo(0, 0);
  }, [route]);

  return route === 'create' ? <CreatePage /> : <HomePage />;
}
