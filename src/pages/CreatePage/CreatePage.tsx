import { useEffect, useId, useRef, useState } from 'react';
import { ListNameField } from '../../components/ListNameField/ListNameField';
import { PreviewPanel, type ShareState } from '../../components/PreviewPanel/PreviewPanel';
import type { RevealStyle } from '../../data/types';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { SiteHeader } from '../../components/SiteHeader/SiteHeader';
import { TitleCalendar } from '../../components/TitleCalendar/TitleCalendar';
import { TitleList } from '../../components/TitleList/TitleList';
import { ViewToggle, type TitlesView } from '../../components/ViewToggle/ViewToggle';
import { sampleReveal } from '../../data/sampleReveal';
import { createCalendar, uploadImage } from '../../data/sharedApi';
import type { PhotoSlot } from '../../components/PhotoTiles/PhotoTiles';
import { getCountdownRange } from '../../lib/calendar';
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
  const daysField = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [days, setDays] = useState<Duration>(24);
  // Titles for all 24 possible days; shortening the calendar hides, but keeps, the rest.
  const [titles, setTitles] = useState<string[]>(() => Array<string>(MAX_DAYS).fill(''));
  const [view, setView] = useState<TitlesView>('calendar');
  const [revealStyle, setRevealStyle] = useState<RevealStyle>('drifting');
  const [year] = useState(() => new Date().getFullYear());

  const setTitle = (index: number, title: string) =>
    setTitles((previous) => previous.map((t, i) => (i === index ? title : t)));

  const [share, setShare] = useState<ShareState>({ status: 'idle' });
  // Image style: each December day's photo, uploaded as soon as it's picked.
  const [photos, setPhotos] = useState<Record<number, PhotoSlot>>({});
  const range = getCountdownRange(days);
  const calendarDays = Array.from({ length: range.last - range.first + 1 }, (_, i) => range.first + i);

  const pickPhoto = async (day: number, file: File) => {
    setPhotos((current) => ({ ...current, [day]: { status: 'uploading' } }));
    try {
      const { key, url } = await uploadImage(file);
      setPhotos((current) => ({ ...current, [day]: { status: 'ready', key, url } }));
    } catch (error) {
      setPhotos((current) => ({ ...current, [day]: { status: 'error', message: (error as Error).message } }));
    }
  };
  const nameInput = () => document.getElementById(nameId) as HTMLInputElement | null;

  // Any edit after sharing means the link no longer matches what's on screen.
  useEffect(() => {
    setShare((current) => (current.status === 'saving' ? current : { status: 'idle' }));
  }, [name, days, titles, revealStyle, photos]);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };

  // Saves the calendar and hands out a link (/c/<id>). Sharing by email has its own design and comes later.
  const handleShare = async () => {
    if (share.status === 'done') {
      setShare({ ...share, copied: await copy(share.url) });
      return;
    }
    if (!name.trim()) {
      setShare({ status: 'error', message: 'Give the calendar a name first.' });
      nameInput()?.focus();
      return;
    }
    const { first, last } = getCountdownRange(days);
    const movies = titles.slice(first - 1, last).map((t) => t.trim());
    const missing = movies.filter((t) => !t).length;
    if (missing) {
      setShare({ status: 'error', message: `Add a movie for each day first (${missing} to go).` });
      return;
    }

    let images: (string | null)[] | undefined;
    if (revealStyle === 'image') {
      const slots = calendarDays.map((d) => photos[d]);
      if (slots.some((p) => p?.status === 'uploading')) {
        setShare({ status: 'error', message: 'Wait for the photos to finish uploading.' });
        return;
      }
      images = slots.map((p) => (p?.status === 'ready' ? p.key : null));
      const missingPhotos = images.filter((k) => !k).length;
      if (missingPhotos) {
        setShare({ status: 'error', message: `Add a photo for each day first (${missingPhotos} to go).` });
        return;
      }
    }

    setShare({ status: 'saving' });
    try {
      const id = await createCalendar({ name: name.trim(), length: days, revealStyle, movies, images });
      const url = `${window.location.origin}/c/${id}`;
      setShare({ status: 'done', url, copied: await copy(url) });
    } catch (error) {
      setShare({ status: 'error', message: (error as Error).message });
    }
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
          <p className={styles.intro}>
            Hide a movie behind each day. Your friend opens one a day and guesses the title.
          </p>

          <div className={`${styles.field} ${styles.nameField}`}>
            <label htmlFor={nameId} className={styles.label}>
              Calendar Name
            </label>
            <ListNameField
              id={nameId}
              value={name}
              onChange={setName}
              // Enter confirms the name and moves on to the Days picker.
              onEnter={() => daysField.current?.querySelector<HTMLInputElement>('input:checked')?.focus()}
            />
          </div>

          <div className={`${styles.field} ${styles.daysField}`} ref={daysField}>
            <p id={daysLabelId} className={styles.label}>
              Days
            </p>
            <SegmentedControl fill labelledBy={daysLabelId} options={DURATIONS} value={days} onChange={setDays} />
          </div>

          <div className={styles.titles}>
            <div className={styles.titlesHeader}>
              <p id={titlesLabelId} className={styles.label}>
                Pick a day to add its movie
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
              />
            )}
          </div>
        </section>

        <PreviewPanel
          image={sampleReveal}
          revealStyle={revealStyle}
          onRevealStyleChange={setRevealStyle}
          onShare={handleShare}
          share={share}
          previewDay={range.first}
          previewTitle={titles[range.first - 1]?.trim() || 'The Holdovers'}
          photoDays={calendarDays}
          photos={photos}
          onPickPhoto={pickPhoto}
        />
      </main>
    </div>
  );
}
