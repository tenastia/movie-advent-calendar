import type { CSSProperties } from 'react';
import text from '../../styles/text.module.css';
import styles from './SegmentedControl.module.css';

interface SegmentedControlProps<T extends string | number> {
  legend: string;
  /** Shared `name` of the radio inputs. */
  name: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  /** Width of each segment in the design, in px. Segments shrink to fit narrower screens. */
  segmentWidth: number;
}

/** Figma `SegmentedButton` row: a single-choice radio group styled as joined pills. */
export function SegmentedControl<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
  segmentWidth,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={`${text.fieldLabel} ${styles.legend}`}>{legend}</legend>
      <div className={styles.segments} style={{ '--segment-width': `${segmentWidth}px` } as CSSProperties}>
        {options.map((option) => (
          <label key={option.value} className={styles.segment}>
            <input
              className={styles.radio}
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
