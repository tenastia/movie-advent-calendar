import { lazy, Suspense, useId, useState } from 'react';
import { PHONE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import type { RevealImage, RevealStyle } from '../../data/types';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { PhotoTiles, type PhotoSlot } from '../PhotoTiles/PhotoTiles';
import { RevealArt } from '../RevealArt/RevealArt';
import styles from './PreviewPanel.module.css';


const REVEAL_STYLES = [
  { value: 'drifting', label: 'Drifting' },
  { value: 'blizzard', label: 'Blizzard' },
  { value: 'image', label: 'Image' },
] as const;

// Three.js only downloads when a motion preview is shown.
const MotionPreview = lazy(() => import('../MotionPreview/MotionPreview'));

/** The stage's colour: 5% light grey over the panel, for the preview canvas to clear to. */
const STAGE_BACKGROUND = '#212121';

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Where sharing stands, shown under the Share button. */
export type ShareState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'done'; url: string; copied: boolean }
  | { status: 'error'; message: string };

const SHARE_LABEL: Record<ShareState['status'], string> = {
  idle: 'Share the Calendar',
  saving: 'Saving…',
  done: 'Copy the link',
  error: 'Share the Calendar',
};

interface PreviewPanelProps {
  image: RevealImage;
  revealStyle: RevealStyle;
  onRevealStyleChange: (style: RevealStyle) => void;
  onShare: () => void;
  share: ShareState;
  /** The day and movie the motion preview plays (the calendar's first day). */
  previewDay: number;
  previewTitle: string;
  /** Image style: the calendar's days and their photos. */
  photoDays: number[];
  photos: Record<number, PhotoSlot>;
  onPickPhoto: (day: number, file: File) => void;
}

export function PreviewPanel({
  image,
  revealStyle,
  onRevealStyleChange,
  onShare,
  share,
  previewDay,
  previewTitle,
  photoDays,
  photos,
  onPickPhoto,
}: PreviewPanelProps) {
  const styleLabelId = useId();
  const shareStatusId = useId();
  const [webgl] = useState(hasWebGL);
  const [photoDay, setPhotoDay] = useState<number | null>(null);
  // The photo on the stage: the tile picked last, or the first day that has one.
  const shownDay = photoDay !== null && photoDays.includes(photoDay) ? photoDay : photoDays[0];
  const shownPhoto = photos[shownDay];
  // The artwork is 144px wide in the phone preview (Figma "Frame 25"), 233px on wider screens.
  const isPhone = useMediaQuery(PHONE_QUERY);

  return (
    <section className={styles.panel} aria-label="Preview">
      <div className={styles.header}>
        <div className={styles.picker}>
          <p id={styleLabelId} className={styles.label}>
            Select Reveal Style
          </p>
          <SegmentedControl
            labelledBy={styleLabelId}
            options={REVEAL_STYLES}
            value={revealStyle}
            onChange={onRevealStyleChange}
          />
        </div>
        <div className={styles.shareArea}>
          <button
            type="button"
            className={styles.share}
            onClick={onShare}
            disabled={share.status === 'saving'}
            aria-describedby={share.status === 'idle' ? undefined : shareStatusId}
          >
            {share.status === 'done' && share.copied ? 'Link copied' : SHARE_LABEL[share.status]}
          </button>
          <p id={shareStatusId} className={styles.shareStatus} role="status">
            {share.status === 'done' && (
              <>
                Send this link to your friend:{' '}
                <a className={styles.shareLink} href={share.url}>
                  {share.url.replace(/^https?:\/\//, '')}
                </a>
              </>
            )}
            {share.status === 'error' && share.message}
          </p>
        </div>
      </div>

      <div className={styles.stage}>
        {revealStyle === 'image' ? (
          shownPhoto?.status === 'ready' ? (
            <img className={styles.photo} src={shownPhoto.url} alt={`The photo for December ${shownDay}`} />
          ) : (
            <p className={styles.stageHint}>Add a photo for each day: it’s the clue your friend guesses from.</p>
          )
        ) : webgl ? (
          <Suspense fallback={<RevealArt image={image} width={isPhone ? 144 : 233} />}>
            <MotionPreview
              key={revealStyle}
              style={revealStyle}
              day={previewDay}
              title={previewTitle}
              background={STAGE_BACKGROUND}
            />
          </Suspense>
        ) : (
          <RevealArt image={image} width={isPhone ? 144 : 233} />
        )}
      </div>

      {revealStyle === 'image' && (
        <div className={styles.photos}>
          <PhotoTiles
            days={photoDays}
            photos={photos}
            selected={shownDay}
            onSelect={setPhotoDay}
            onPick={onPickPhoto}
          />
        </div>
      )}
    </section>
  );
}
