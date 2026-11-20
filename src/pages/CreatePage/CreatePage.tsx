import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { Countdown } from '../../components/Countdown/Countdown';
import { DayList } from '../../components/DayList/DayList';
import { InputField } from '../../components/InputField/InputField';
import { MonthCalendar } from '../../components/MonthCalendar/MonthCalendar';
import { NavBar } from '../../components/NavBar/NavBar';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { TodaysReveal } from '../../components/TodaysReveal/TodaysReveal';
import { ViewToggle, type DayPickerView } from '../../components/ViewToggle/ViewToggle';
import { Wordmark } from '../../components/Wordmark/Wordmark';
import { mockCalendar } from '../../data/mockCalendar';
import type { RevealStyle } from '../../data/types';
import { getNextRevealAt } from '../../lib/countdown';
import text from '../../styles/text.module.css';
import styles from './CreatePage.module.css';

const DECEMBER = 11;

const DAY_OPTIONS = [6, 12, 18, 24].map((days) => ({ value: days, label: `${days} Days` }));

const REVEAL_STYLE_OPTIONS: ReadonlyArray<{ value: RevealStyle; label: string }> = [
  { value: 'drifting', label: 'Drifting' },
  { value: 'blizzard', label: 'Blizzard' },
  { value: 'image', label: 'Image' },
];

export function CreatePage() {
  const nameId = useId();
  const pickerLabelId = useId();
  const year = useMemo(() => new Date().getFullYear(), []);

  const [name, setName] = useState('');
  const [days, setDays] = useState(24);
  const [view, setView] = useState<DayPickerView>('calendar');
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [revealStyle, setRevealStyle] = useState<RevealStyle>('drifting');
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  const nextRevealAt = useMemo(
    () => getNextRevealAt(new Date(), mockCalendar.revealTime),
    [],
  );

  const setTitle = (day: number, title: string) =>
    setTitles((previous) => ({ ...previous, [day]: title }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  // There is no backend yet, so sharing hands out the app's own link.
  const handleShare = async () => {
    const url = window.location.href.split('#')[0];
    const shareData = { title: name.trim() || 'Movie Advent Calendar', url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // The person dismissed the share sheet, or the clipboard is unavailable.
    }
  };

  return (
    <div className={styles.page}>
      <NavBar active="create" />

      <header className={styles.header}>
        <Wordmark />
        <Countdown target={nextRevealAt} label="Time until the next reveal" />
      </header>

      <main className={styles.main}>
        <h2 className="visually-hidden">Create a calendar</h2>
        <form className={styles.form} aria-label="Create a calendar" onSubmit={handleSubmit}>
          <section className={`${styles.section} ${styles.setup}`}>
            <div className={styles.fields}>
              <p className={styles.intro}>
                Hide a movie behind each day. Your friend opens one a day and guesses the title.
              </p>

              <div className={styles.field}>
                <label className={text.fieldLabel} htmlFor={nameId}>
                  Calendar Name
                </label>
                <InputField
                  id={nameId}
                  placeholder="e.g. Winter movies for Ana"
                  autoComplete="off"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <SegmentedControl
                legend="Days"
                name="days"
                options={DAY_OPTIONS}
                value={days}
                onChange={setDays}
                segmentWidth={78}
              />
            </div>

            <div className={styles.field} role="group" aria-labelledby={pickerLabelId}>
              <div className={styles.pickerHeader}>
                <p id={pickerLabelId} className={text.fieldLabel}>
                  Pick a day to add its movie
                </p>
                <ViewToggle value={view} onChange={setView} />
              </div>

              {view === 'calendar' ? (
                <MonthCalendar
                  year={year}
                  month={DECEMBER}
                  activeDays={days}
                  titles={titles}
                  onTitleChange={setTitle}
                />
              ) : (
                <DayList
                  year={year}
                  month={DECEMBER}
                  days={days}
                  titles={titles}
                  onTitleChange={setTitle}
                />
              )}
            </div>
          </section>

          <section className={`${styles.section} ${styles.finish}`}>
            <SegmentedControl
              legend="Select reveal style"
              name="reveal-style"
              options={REVEAL_STYLE_OPTIONS}
              value={revealStyle}
              onChange={setRevealStyle}
              segmentWidth={86}
            />

            <div className={styles.preview}>
              <div className={styles.previewImage}>
                <TodaysReveal
                  image={{ ...mockCalendar.today.reveal, alt: 'Preview of how a day is revealed' }}
                />
              </div>
            </div>

            <button type="button" className={styles.share} onClick={handleShare}>
              {copied ? 'Link copied' : 'Share the Calendar'}
            </button>
            <p className="visually-hidden" aria-live="polite">
              {copied ? 'Link copied to the clipboard' : ''}
            </p>
          </section>
        </form>
      </main>
    </div>
  );
}
