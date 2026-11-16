import todayGlow from '../../assets/ui/today-glow.svg';
import todayOutline from '../../assets/ui/today-outline.svg';
import type { DayStatus } from '../../data/types';
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

/** Today's card in the pile (Figma "CalCard" with the "Today" pill). */
export function TodayCard({ day, title, status, hidden, revealsAt }: TodayCardProps) {
  return (
    <article className={styles.card}>
      <img className={styles.outline} src={todayOutline} width={174} height={175} alt="" />
      <img className={styles.glow} src={todayGlow} width={115} height={38.5} alt="" />

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
