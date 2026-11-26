import { lazy, Suspense, useId, useState } from 'react';
import { PHONE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import type { RevealImage } from '../../data/types';
import { RevealArt } from '../RevealArt/RevealArt';
import styles from './PreviewPanel.module.css';

// Three.js only downloads when the motion preview is shown.
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
  /** Static artwork, shown where the letter motion can't run. */
  image: RevealImage;
  onShare: () => void;
  share: ShareState;
  /** The day and movie the preview plays (the calendar's first day). */
  previewDay: number;
  previewTitle: string;
}

/**
 * A preview of how each day is revealed (the letter motion, sped up), and the
 * Share button. Other reveal styles (e.g. a photo per day) come in a later version.
 */
export function PreviewPanel({ image, onShare, share, previewDay, previewTitle }: PreviewPanelProps) {
  const labelId = useId();
  const shareStatusId = useId();
  const [webgl] = useState(hasWebGL);
  // The artwork is 144px wide in the phone preview (Figma "Frame 25"), 233px on wider screens.
  const isPhone = useMediaQuery(PHONE_QUERY);

  return (
    <section className={styles.panel} aria-labelledby={labelId}>
      <div className={styles.header}>
        <p id={labelId} className={styles.label}>
          Preview
        </p>
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
        {webgl ? (
          <Suspense fallback={<RevealArt image={image} width={isPhone ? 144 : 233} />}>
            <MotionPreview style="drifting" day={previewDay} title={previewTitle} background={STAGE_BACKGROUND} />
          </Suspense>
        ) : (
          <RevealArt image={image} width={isPhone ? 144 : 233} />
        )}
      </div>
    </section>
  );
}
