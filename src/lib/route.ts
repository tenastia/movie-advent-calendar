export type Route = 'home' | 'create';

/**
 * Maps a location hash to a page. Routing is hash-based (`#/create`) so the
 * static build works on any host without server rewrites.
 */
export function parseRoute(hash: string): Route {
  const [segment] = hash.replace(/^#\/?/, '').split(/[/?]/);
  return segment === 'create' ? 'create' : 'home';
}
