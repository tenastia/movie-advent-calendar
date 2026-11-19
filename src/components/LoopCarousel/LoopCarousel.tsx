import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { loopCopies, middleCopy, recentre, wrapPosition } from '../../lib/loop';
import styles from './LoopCarousel.module.css';

/** Card width plus gap in the Figma phone frame (288 + 16). The real step is measured. */
const DESIGN_STEP = 304;
/** Scrolling counts as settled once it has paused this long (and no finger is down). */
const SETTLE_MS = 120;

interface LoopCarouselProps {
  /** Number of distinct slides. */
  count: number;
  /** Draws slide `index`. Clones are the copies either side of the real slides: keep them out of the tab order. */
  renderSlide: (index: number, clone: boolean) => ReactNode;
  /** The slide shown first. */
  startIndex?: number;
  /** Accessible name for the carousel. */
  label: string;
  /** The scrolling element, e.g. to focus it so arrow keys move the slides. */
  trackRef?: RefObject<HTMLDivElement | null>;
}

/** Distance between neighbouring slides. */
function measureStep(track: HTMLElement) {
  const [first, second] = track.children as HTMLCollectionOf<HTMLElement>;
  return (first && second && second.offsetLeft - first.offsetLeft) || DESIGN_STEP;
}

/**
 * A horizontal, endlessly looping row of slides with a progress bar beneath.
 *
 * It scrolls natively (momentum, snapping, arrow keys). The slides are rendered
 * several times over and, whenever scrolling settles, the row jumps invisibly
 * back to the same slide in the middle copy, so there's always more to swipe
 * either way. Only the middle copy is real to assistive tech and the tab order.
 *
 * The progress bar has one thumb-width per slide: the thumb follows the scroll
 * position continuously and, between the last slide and the first, runs off
 * the end of the track and back in at the start.
 */
export function LoopCarousel({ count, renderSlide, startIndex = 0, label, trackRef: externalTrackRef }: LoopCarouselProps) {
  const ownTrackRef = useRef<HTMLDivElement>(null);
  const trackRef = externalTrackRef ?? ownTrackRef;
  const progressRef = useRef<HTMLDivElement>(null);
  const copies = useMemo(() => loopCopies(count, DESIGN_STEP), [count]);
  const middle = middleCopy(copies);

  // Start on `startIndex` in the middle copy, before the first paint.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = (middle * count + startIndex) * measureStep(track);
    progressRef.current?.style.setProperty('--offset', String(wrapPosition(startIndex, count)));
  }, [trackRef, middle, count, startIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = measureStep(track);
    // With equal padding and scroll-padding, slide k snaps at scrollLeft = k × step.
    const position = () => track.scrollLeft / step;
    let touching = false;
    let timer: number | undefined;

    const settle = () => {
      // Never move the row under a finger; touchend tries again.
      if (touching) return;
      const target = recentre(position(), count, copies);
      if (target !== null) track.scrollTo({ left: target * step, behavior: 'instant' });
    };
    const settleSoon = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };
    const onScroll = () => {
      progressRef.current?.style.setProperty('--offset', wrapPosition(position(), count).toFixed(4));
      // Momentum and snapping keep firing scroll events, which keeps pushing this back.
      settleSoon();
    };
    const onTouchStart = () => {
      touching = true;
    };
    const onTouchEnd = () => {
      touching = false;
      settleSoon();
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(timer);
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [trackRef, count, copies]);

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label={label}>
      <div ref={trackRef} className={styles.track} tabIndex={-1}>
        {Array.from({ length: copies }, (_, copy) =>
          Array.from({ length: count }, (_, index) => {
            const clone = copy !== middle;
            return (
              <div
                key={`${copy}-${index}`}
                className={styles.slide}
                {...(clone
                  ? { 'aria-hidden': true }
                  : { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${index + 1} of ${count}` })}
              >
                {renderSlide(index, clone)}
              </div>
            );
          }),
        )}
      </div>

      <div
        ref={progressRef}
        className={styles.progress}
        style={{ '--count': count } as CSSProperties}
        aria-hidden="true"
      >
        <span className={styles.thumb} />
        {/* The part of the thumb that has wrapped round to the start. */}
        <span className={`${styles.thumb} ${styles.wrapped}`} />
      </div>
    </section>
  );
}
