import { useMemo } from 'react';
import { getNextRevealAt } from '../../lib/countdown';
import { Countdown } from '../Countdown/Countdown';
import { Wordmark } from '../Wordmark/Wordmark';
import styles from './SiteHeader.module.css';

interface SiteHeaderProps {
  /** Daily reveal time, "HH:MM" local time; the countdown targets its next occurrence. */
  revealTime: string;
}

export function SiteHeader({ revealTime }: SiteHeaderProps) {
  const nextRevealAt = useMemo(() => getNextRevealAt(new Date(), revealTime), [revealTime]);

  return (
    <header className={styles.header}>
      <Wordmark />
      <Countdown target={nextRevealAt} label="Time until the next reveal" />
    </header>
  );
}
