import { useState } from 'react';
import { CalendarTabs } from '../../components/CalendarTabs/CalendarTabs';
import { CardStack } from '../../components/CardStack/CardStack';
import { GuessForm } from '../../components/GuessForm/GuessForm';
import { ProgressTrack } from '../../components/ProgressTrack/ProgressTrack';
import { SiteHeader } from '../../components/SiteHeader/SiteHeader';
import { TodaysReveal } from '../../components/TodaysReveal/TodaysReveal';
import { mockCalendar } from '../../data/mockCalendar';
import styles from './HomePage.module.css';

type CalendarTab = 'mine' | 'others';

export function HomePage() {
  const calendar = mockCalendar;
  const [activeTab, setActiveTab] = useState<CalendarTab>('mine');
  const [guesses, setGuesses] = useState<string[]>([]);

  const tabs = [
    { id: 'mine', label: `${calendar.owner}’s Calendar` },
    { id: 'others', label: 'Other Calendars' },
  ] as const;

  const remainingAttempts = Math.max(0, calendar.attemptsPerDay - guesses.length);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <SiteHeader />
      </div>

      <main className={styles.main}>
        <h2 className="visually-hidden">Today’s reveal</h2>
        <TodaysReveal image={calendar.today.reveal} />

        <div className={styles.tabs}>
          <CalendarTabs options={tabs} value={activeTab} onChange={setActiveTab} />
        </div>

        <div className={styles.progress}>
          <ProgressTrack />
        </div>

        <div className={styles.guess}>
          <GuessForm
            remainingAttempts={remainingAttempts}
            onGuess={(guess) => setGuesses((previous) => [...previous, guess])}
          />
        </div>
      </main>

      <CardStack days={calendar.days} today={calendar.today.day} />
    </div>
  );
}
