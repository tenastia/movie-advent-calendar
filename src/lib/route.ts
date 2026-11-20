export type Route = 'home' | 'create';

/**
 * Maps a location hash to a page. Routes are plain hash names (`#create`) so the
 * static build works on any host without server rewrites, embedded previews included.
 * The older `#/create` form is still understood.
 */
export function parseRoute(hash: string): Route {
  const [segment] = hash.replace(/^#\/?/, '').split(/[/?]/);
  return segment === 'create' ? 'create' : 'home';
}
