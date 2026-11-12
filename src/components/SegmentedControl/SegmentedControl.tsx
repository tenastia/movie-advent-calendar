import { useId } from 'react';
import styles from './SegmentedControl.module.css';

interface SegmentedControlProps<T extends string | number> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  /** id of the visible element that labels the group. */
  labelledBy?: string;
  /** Accessible name when there is no visible label. */
  label?: string;
}

/** Figma `SegmentedButton` row, built on native radio inputs (arrow keys, form semantics). */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  labelledBy,
  label,
}: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <div className={styles.group} role="radiogroup" aria-labelledby={labelledBy} aria-label={label}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label key={option.value} className={`${styles.option} ${checked ? styles.selected : ''}`}>
            <input
              className={styles.radio}
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
