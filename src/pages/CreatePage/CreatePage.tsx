import { useId, useState } from 'react';
import { ListNameField } from '../../components/ListNameField/ListNameField';
import { PreviewPanel, type RevealStyle } from '../../components/PreviewPanel/PreviewPanel';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { SiteHeader } from '../../components/SiteHeader/SiteHeader';
import { TitleCalendar } from '../../components/TitleCalendar/TitleCalendar';
import { TitleList } from '../../components/TitleList/TitleList';
import { ViewToggle, type TitlesView } from '../../components/ViewToggle/ViewToggle';
import { mockCalendar } from '../../data/mockCalendar';
import { moveItem } from '../../lib/calendar';
import styles from './CreatePage.module.css';

const MAX_DAYS = 24;

const DURATIONS = [
  { value: 6, label: '6 Days' },
  { value: 12, label: '12 Days' },
  { value: 18, label: '18 Days' },
  { value: 24, label: '24 Days' },
] as const;

type Duration = (typeof DURATIONS)[number]['value'];

export function CreatePage() {
  const headingId = useId();
  const nameId = useId();
  const daysLabelId = useId();
  const titlesLabelId = useId();

  const [name, setName] = useState('');
  const [days, setDays] = useState<Duration>(24);
  // Titles for all 24 possible days; shortening the calendar hides, but keeps, the rest.
  const [titles, setTitles] = useState<string[]>(() => Array<string>(MAX_DAYS).fill(''));
  const [view, setView] = useState<TitlesView>('calendar');
  const [revealStyle, setRevealStyle] = useState<RevealStyle>('drifting');
  const [year] = useState(() => new Date().getFullYear());

  const setTitle = (index: number, title: string) =>
    setTitles((previous) => previous.map((t, i) => (i === index ? title : t)));

  const handleShare = () => {
    // Sharing has its own design (recipient email + note) and isn't built yet.
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <SiteHeader />
      </div>

      <main className={styles.content}>
        <section className={styles.builder} aria-labelledby={headingId}>
          <h2 id={headingId} className="visually-hidden">
            Create a calendar
          </h2>
          <p className={styles.intro}>Create a movie list for a friend and let them guess movies in it</p>

          <div className={`${styles.field} ${styles.nameField}`}>
            <label htmlFor={nameId} className={styles.label}>
              Name your list
            </label>
            <ListNameField id={nameId} value={name} onChange={setName} />
          </div>

          <div className={`${styles.field} ${styles.daysField}`}>
            <p id={daysLabelId} className={styles.label}>
              For how many days
            </p>
            <SegmentedControl labelledBy={daysLabelId} options={DURATIONS} value={days} onChange={setDays} />
          </div>

          <div className={styles.titles}>
            <div className={styles.titlesHeader}>
              <p id={titlesLabelId} className={styles.label}>
                Add movie titles to each day
              </p>
              <ViewToggle value={view} onChange={setView} />
            </div>

            {view === 'calendar' ? (
              <TitleCalendar year={year} days={days} titles={titles} onChangeTitle={setTitle} />
            ) : (
              <TitleList
                days={days}
                titles={titles}
                onChangeTitle={setTitle}
                onMove={(from, to) => setTitles((previous) => moveItem(previous, from, to))}
              />
            )}
          </div>
        </section>

        <PreviewPanel
          image={mockCalendar.today.reveal}
          revealStyle={revealStyle}
          onRevealStyleChange={setRevealStyle}
          onShare={handleShare}
        />
      </main>
    </div>
  );
}
