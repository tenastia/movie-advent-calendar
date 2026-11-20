import { useMemo } from 'react';
import { getChristmasTarget } from '../../lib/countdown';
import { Countdown } from '../Countdown/Countdown';
import { Wordmark } from '../Wordmark/Wordmark';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  const christmas = useMemo(() => getChristmasTarget(new Date()), []);

  return (
    <header className={styles.header}>
      <Wordmark />
      <Countdown target={christmas} label="Time until Christmas" />
    </header>
  );
}
