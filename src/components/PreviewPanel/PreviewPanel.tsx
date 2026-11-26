import { useId } from 'react';
import { PHONE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import type { RevealImage, RevealStyle } from '../../data/types';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { RevealArt } from '../RevealArt/RevealArt';
import styles from './PreviewPanel.module.css';


const REVEAL_STYLES = [
  { value: 'drifting', label: 'Drifting' },
  { value: 'blizzard', label: 'Blizzard' },
  { value: 'image', label: 'Image' },
] as const;

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
}

export function PreviewPanel({ image, revealStyle, onRevealStyleChange, onShare, share }: PreviewPanelProps) {
  const styleLabelId = useId();
  const shareStatusId = useId();
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
        <RevealArt image={image} width={isPhone ? 144 : 233} />
      </div>
    </section>
  );
}
