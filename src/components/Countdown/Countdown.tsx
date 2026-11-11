import { useEffect, useState } from 'react';
import { formatCountdown, toIsoDuration } from '../../lib/countdown';
import styles from './Countdown.module.css';

interface CountdownProps {
  target: Date;
  /** Accessible name, e.g. "Time until the next reveal". */
  label: string;
}

export function Countdown({ target, label }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = target.getTime() - now;

  return (
    <div className={styles.pill} role="timer" aria-label={label}>
      <time dateTime={toIsoDuration(remaining)}>{formatCountdown(remaining)}</time>
    </div>
  );
}
