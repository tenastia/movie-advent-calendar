import { useRef, useState } from 'react';
import styles from './PhotoTiles.module.css';

export type PhotoSlot =
  | { status: 'empty' }
  | { status: 'uploading' }
  | { status: 'ready'; key: string; url: string }
  | { status: 'error'; message: string };

interface PhotoTilesProps {
  /** The calendar's days, first to last (e.g. 13–24). */
  days: number[];
  photos: Record<number, PhotoSlot>;
  selected: number;
  onSelect: (day: number) => void;
  onPick: (day: number, file: File) => void;
}

/** Image style: one tile per day. Tap a tile to add or replace that day's photo. */
export function PhotoTiles({ days, photos, selected, onSelect, onPick }: PhotoTilesProps) {
  const input = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<number | null>(null);
  const done = days.filter((d) => photos[d]?.status === 'ready').length;
  const error = days.map((d) => photos[d]).find((p) => p?.status === 'error');

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>
        Photos: {done} of {days.length}
        {error?.status === 'error' && <span className={styles.errorText}> · {error.message}</span>}
      </p>
      <ul className={styles.tiles}>
        {days.map((day) => {
          const photo = photos[day] ?? { status: 'empty' };
          return (
            <li key={day}>
              <button
                type="button"
                className={`${styles.tile} ${styles[photo.status]} ${day === selected ? styles.selected : ''}`}
                style={photo.status === 'ready' ? { backgroundImage: `url(${photo.url})` } : undefined}
                aria-label={`December ${day}: ${photo.status === 'ready' ? 'replace the photo' : 'add a photo'}`}
                aria-busy={photo.status === 'uploading' || undefined}
                onClick={() => {
                  onSelect(day);
                  setTarget(day);
                  input.current?.click();
                }}
              >
                <span className={styles.day}>{day}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && target !== null) onPick(target, file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
