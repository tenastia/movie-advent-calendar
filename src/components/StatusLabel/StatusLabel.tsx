import type { DayStatus } from '../../data/types';
import styles from './StatusLabel.module.css';

const STATUS_CONTENT: Record<DayStatus, { emoji: string; text: string }> = {
  guessed: { emoji: '😃', text: 'Guessed' },
  missed: { emoji: '😓', text: 'Missed' },
};

interface StatusLabelProps {
  status: DayStatus;
}

export function StatusLabel({ status }: StatusLabelProps) {
  const { emoji, text } = STATUS_CONTENT[status];
  return (
    <span className={styles.label}>
      <span className={styles.emoji} aria-hidden="true">
        {emoji}
      </span>
      <span className={styles.text}>{text}</span>
    </span>
  );
}
