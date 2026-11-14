import { useId } from 'react';
import type { RevealImage } from '../../data/types';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { TodaysReveal } from '../TodaysReveal/TodaysReveal';
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

  return (
    <section className={styles.panel} aria-label="Preview">
      <div className={styles.header}>
        <div className={styles.picker}>
          <p id={styleLabelId} className={styles.label}>
            Select reveal style
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
        <TodaysReveal image={image} width={233} />
      </div>
    </section>
  );
}
