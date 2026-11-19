/*
 * Maths for an endless carousel built on native scrolling: the slides are
 * rendered several times over, the user always settles in the middle copy, and
 * positions are measured in slides (0 = the first slide of the first copy).
 */

/**
 * How many copies of `count` slides to render so that a fling from the middle
 * copy can travel at least `buffer` px either way before running out. Always odd,
 * so there is a middle copy.
 */
export function loopCopies(count: number, step: number, buffer = 3000): number {
  if (count <= 0 || step <= 0) return 1;
  const perSide = Math.max(1, Math.ceil(buffer / (count * step)));
  return perSide * 2 + 1;
}

/** Index of the middle copy. */
export function middleCopy(copies: number): number {
  return Math.floor(copies / 2);
}

/**
 * Wraps a scroll position (in slides; may be fractional or negative) into
 * [0, count). This is also where the progress bar's thumb sits, in thumb
 * widths: between the last slide and the first it runs off the end of the
 * track and back in at the start.
 */
export function wrapPosition(position: number, count: number): number {
  if (count <= 0) return 0;
  const wrapped = ((position % count) + count) % count;
  // Floating-point remainders can land a hair under `count`.
  return wrapped >= count - 1e-9 ? 0 : wrapped;
}

/** Which slide (0 … count-1) a scroll position shows. */
export function slideAt(position: number, count: number): number {
  return Math.round(wrapPosition(position, count)) % Math.max(count, 1);
}

/**
 * Where to jump once scrolling settles so the same slide shows from the middle
 * copy, keeping clones either side. Null when it's already in the middle copy.
 */
export function recentre(position: number, count: number, copies: number): number | null {
  if (count <= 0) return null;
  const copy = Math.floor(Math.round(position) / count);
  const middle = middleCopy(copies);
  if (copy === middle) return null;
  return position + (middle - copy) * count;
}
