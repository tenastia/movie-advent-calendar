import { useEffect, useRef } from 'react';
import { createDayClock, revealProgress } from '../motion/reveal';

/**
 * Keeps `--progress` (0 → 1) on the element in step with the letter motion:
 * empty when the day's motion starts, full when the title is in place.
 * Updated per frame without re-rendering; pauses with the tab.
 */
export function useRevealProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const dayTime = createDayClock();
    let frame = 0;
    let last = -1;
    const tick = () => {
      const progress = revealProgress(dayTime());
      if (Math.abs(progress - last) > 0.0002) {
        ref.current?.style.setProperty('--progress', progress.toFixed(4));
        last = progress;
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, []);

  return ref;
}
