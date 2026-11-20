import { useEffect, useRef } from 'react';
import todayOutline from '../../assets/ui/today-outline.svg';
import type { DayStatus } from '../../data/types';
import { createDayClock, revealProgress } from '../../motion/reveal';
import { StatusLabel } from '../StatusLabel/StatusLabel';
import styles from './TodayCard.module.css';

interface TodayCardProps {
  day: number;
  title: string;
  status: DayStatus;
  /** Before the reveal the title stays hidden. */
  hidden: boolean;
  /** e.g. "12pm". */
  revealsAt: string;
}

// Stand-in for the hidden title, as in the design: three lines of asterisks
// (enough to fill them in any font; the rest is clipped).
const HIDDEN_TITLE = '*'.repeat(90);

/**
 * Keeps `--progress` (0 → 1) on the element in step with the letter motion:
 * empty when the day's motion starts, full when the title is in place.
 * Updated per frame without re-rendering; pauses with the tab.
 */
function useRevealProgress<T extends HTMLElement>() {
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

/** Today's card in the pile (Figma "CalCard" with the "Today" pill). */
export function TodayCard({ day, title, status, hidden, revealsAt }: TodayCardProps) {
  const progressRef = useRevealProgress<HTMLDivElement>();

  return (
    <article className={styles.card}>
      <img className={styles.outline} src={todayOutline} width={174} height={175} alt="" />
      {/* Time until the reveal: fills clockwise from the top centre. */}
      <div ref={progressRef} className={styles.progress} aria-hidden="true" />

      <div className={styles.body}>
        <div className={styles.top}>
          <p className={styles.day}>
            <span className="visually-hidden">Day </span>
            {String(day).padStart(2, '0')}
          </p>
          <span className={styles.today}>Today</span>
        </div>
        {hidden ? (
          <h3 className={`${styles.title} ${styles.hiddenTitle}`}>
            <span className="visually-hidden">Title hidden until {revealsAt}</span>
            <span aria-hidden="true">{HIDDEN_TITLE}</span>
          </h3>
        ) : (
          <h3 className={styles.title}>{title}</h3>
        )}
      </div>

      {hidden ? <StatusLabel status="upcoming" revealsAt={revealsAt} /> : <StatusLabel status={status} />}
    </article>
  );
}
