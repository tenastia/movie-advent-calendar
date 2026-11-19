import type { DayStatus } from '../../data/types';
import styles from './StatusLabel.module.css';

const STATUS_CONTENT: Record<DayStatus, { emoji: string; text: string }> = {
  guessed: { emoji: '😃', text: 'Guessed' },
  missed: { emoji: '😓', text: 'Missed' },
};

type StatusLabelProps =
  | { status: DayStatus }
  /** Today, before the reveal (Figma StatusLabel "Status3"). */
  | { status: 'upcoming'; revealsAt: string };

export function StatusLabel(props: StatusLabelProps) {
  const { emoji, text } =
    props.status === 'upcoming'
      ? { emoji: '🤫', text: `Reveals at ${props.revealsAt}` }
      : STATUS_CONTENT[props.status];

  return (
    <span className={styles.label}>
      <span className={styles.emoji} aria-hidden="true">
        {emoji}
      </span>
      <span className={styles.text}>{text}</span>
    </span>
  );
}
