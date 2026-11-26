import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CalendarTabs } from '../../components/CalendarTabs/CalendarTabs';
import { CardStack } from '../../components/CardStack/CardStack';
import { DaysSheet } from '../../components/DaysSheet/DaysSheet';
import { GuessForm, type GuessOutcome } from '../../components/GuessForm/GuessForm';
import { SiteHeader } from '../../components/SiteHeader/SiteHeader';
import { TodayBox } from '../../components/TodayBox/TodayBox';
import { TodaysReveal } from '../../components/TodaysReveal/TodaysReveal';
import { useCalendars } from '../../data/CalendarsContext';
import { recordGuess, useGuessRecords } from '../../data/guessStore';
import { PHONE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { isCorrectGuess } from '../../lib/guessMatch';
import styles from './HomePage.module.css';

export function HomePage() {
  const { active: calendar } = useCalendars();
  const navigate = useNavigate();
  // Phones show today's date box instead of the pile of cards; it opens the days so far.
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [daysOpen, setDaysOpen] = useState(false);
  const showDays = isPhone && daysOpen;
  const todayBox = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Close the days when leaving the home page (e.g. through the nav).
  useEffect(() => {
    if (pathname !== '/') setDaysOpen(false);
  }, [pathname]);

  const closeDays = () => {
    setDaysOpen(false);
    // The page is inert until this render commits, so focus the box after it.
    requestAnimationFrame(() => todayBox.current?.focus());
  };

  // The first tab is the open calendar; "Other Calendars" opens the Calendars screen.
  const tabs = [
    { id: 'current', label: calendar.name },
    { id: 'others', label: 'Other Calendars' },
  ] as const;

  // Today's guesses are kept in this browser, so a reload doesn't hand out fresh attempts.
  const today = calendar.today.day;
  const record = useGuessRecords(calendar.id)[today];
  const remainingAttempts = Math.max(0, calendar.attemptsPerDay - (record?.guesses.length ?? 0));
  const outcome: GuessOutcome = record?.solved ? 'solved' : remainingAttempts === 0 ? 'out' : 'playing';
  const guess = (text: string) => recordGuess(calendar.id, today, text, isCorrectGuess(text, calendar.today.title));

  return (
    <div className={styles.page}>
      {/* Header to guess field: exactly one screen tall. */}
      <div className={styles.screen} inert={showDays}>
        <div className={styles.header}>
          <SiteHeader />
        </div>

        <main className={styles.main}>
          <h2 className="visually-hidden">Today’s reveal</h2>
          <div className={styles.reveal}>
            <TodaysReveal
              day={calendar.today.day}
              title={calendar.today.title}
              nextTitle={calendar.today.nextTitle}
              image={calendar.today.reveal}
            />
          </div>

          {isPhone && (
            <div className={styles.today}>
              <TodayBox
                ref={todayBox}
                day={calendar.today.day}
                expanded={showDays}
                onOpen={() => setDaysOpen(true)}
              />
            </div>
          )}

          <div className={styles.tabs}>
            <CalendarTabs
              options={tabs}
              value="current"
              onChange={(id) => {
                if (id === 'others') navigate('/calendars');
              }}
            />
          </div>

          <div className={styles.guess}>
            <GuessForm remainingAttempts={remainingAttempts} outcome={outcome} onGuess={guess} />
          </div>
        </main>
      </div>

      {!isPhone && <CardStack days={calendar.days} today={calendar.today.day} />}
      {showDays && <DaysSheet days={calendar.days} today={calendar.today.day} onClose={closeDays} />}
    </div>
  );
}
