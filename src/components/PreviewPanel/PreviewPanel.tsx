import { useId } from 'react';
import { PHONE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import type { RevealImage } from '../../data/types';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { RevealArt } from '../RevealArt/RevealArt';
import styles from './PreviewPanel.module.css';

export type RevealStyle = 'drifting' | 'blizzard' | 'image';

const REVEAL_STYLES = [
  { value: 'drifting', label: 'Drifting' },
  { value: 'blizzard', label: 'Blizzard' },
  { value: 'image', label: 'Image' },
] as const;

interface PreviewPanelProps {
  image: RevealImage;
  revealStyle: RevealStyle;
  onRevealStyleChange: (style: RevealStyle) => void;
  onShare: () => void;
}

export function PreviewPanel({ image, revealStyle, onRevealStyleChange, onShare }: PreviewPanelProps) {
  const styleLabelId = useId();
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
        <button type="button" className={styles.share} onClick={onShare}>
          Share the Calendar
        </button>
      </div>

      <div className={styles.stage}>
        <RevealArt image={image} width={isPhone ? 144 : 233} />
      </div>
    </section>
  );
}
