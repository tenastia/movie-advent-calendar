import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { CalendarDay } from '../../data/types';
import { moveItem } from '../../lib/calendar';
import { CalCard } from '../CalCard/CalCard';
import styles from './CardStack.module.css';

/**
 * Position (top-left of the unrotated 167×168 card) and rotation of each
 * visible card, from the back of the pile to the front, as in the Figma
 * "Frame 47" layout. Further cards wait, hidden, in the back position.
 */
const PILE_LAYOUT = [
  { x: 9, y: 4.88, rotate: -3.45 },
  { x: 12.91, y: 16.76, rotate: 3.45 },
  { x: 5.46, y: 27.3, rotate: -3.85 },
  { x: 16, y: 32.88, rotate: 3.75 },
] as const;
const VISIBLE = PILE_LAYOUT.length;
const FRONT = PILE_LAYOUT[VISIBLE - 1];

/** Where a tossed card is lifted to before it drops in behind the pile. */
const TOSS = { x: FRONT.x + 36, y: FRONT.y - 150, rotate: 14 };
/** Matches the `.tossing` transition in the stylesheet. */
const TOSS_LIFT_MS = 220;

/** Position for the card `slot` places from the front (0 = front). */
function slotStyle(slot: number, total: number): CSSProperties {
  const { x, y, rotate } = PILE_LAYOUT[VISIBLE - 1 - Math.min(slot, VISIBLE - 1)];
  return {
    '--x': `${x}px`,
    '--y': `${y}px`,
    '--rotate': `${rotate}deg`,
    zIndex: total - slot,
    opacity: slot < VISIBLE ? 1 : 0,
  } as CSSProperties;
}

const tossStyle = (total: number) =>
  ({
    '--x': `${TOSS.x}px`,
    '--y': `${TOSS.y}px`,
    '--rotate': `${TOSS.rotate}deg`,
    zIndex: total + 1,
  }) as CSSProperties;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface CardStackProps {
  /** Revealed days, in any order. */
  days: CalendarDay[];
  today: number;
}

/**
 * Carousel of every revealed day, newest on top. Clicking (or tapping) the
 * front card tosses it behind the deck, revealing the day before; after the
 * first day it wraps back round to the newest.
 */
export function CardStack({ days, today }: CardStackProps) {
  const headingId = useId();
  const byDay = useMemo(() => new Map(days.map((day) => [day.day, day])), [days]);
  // Day numbers, front of the deck first.
  const [order, setOrder] = useState(() => days.map((d) => d.day).sort((a, b) => b - a));
  // The card currently being lifted off the top; it drops behind the pile once this clears.
  const [tossing, setTossing] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const total = order.length;
  const next = total > 1 ? byDay.get(order[1]) : undefined;

  const toss = () => {
    if (!next) return;
    const tossed = order[0];
    setOrder((current) => moveItem(current, 0, current.length - 1));
    setAnnouncement(`December ${next.day}: ${next.title}, ${next.status}`);

    window.clearTimeout(timer.current);
    if (prefersReducedMotion()) {
      setTossing(null);
      return;
    }
    setTossing(tossed);
    timer.current = window.setTimeout(() => setTossing(null), TOSS_LIFT_MS);
  };

  return (
    <section className={styles.stack} aria-roledescription="carousel" aria-labelledby={headingId}>
      <h2 id={headingId} className="visually-hidden">
        Your calendar so far
      </h2>

      <div className={styles.pile}>
        {/* Rendered in a fixed (day) order so cards animate between slots instead of re-mounting. */}
        {days.map((day) => {
          const slot = order.indexOf(day.day);
          const isFront = slot === 0;
          const isTossing = tossing === day.day;
          return (
            <div
              key={day.day}
              className={`${styles.item} ${isFront ? styles.front : ''} ${isTossing ? styles.tossing : ''}`}
              style={isTossing ? tossStyle(total) : slotStyle(slot, total)}
              role="group"
              aria-roledescription="slide"
              aria-label={`December ${day.day}`}
              aria-hidden={isFront ? undefined : true}
              inert={!isFront}
            >
              <CalCard
                day={day.day}
                title={day.title}
                status={day.status}
                variant={day.day === today ? 'current' : 'past'}
              />
            </div>
          );
        })}

        {next && (
          <button
            type="button"
            className={styles.next}
            style={{ ...slotStyle(0, total), zIndex: total + 2 }}
            aria-label={`Show December ${next.day}`}
            onClick={toss}
          />
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
