import styles from './CalendarTabs.module.css';

interface CalendarTabsProps<T extends string> {
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

export function CalendarTabs<T extends string>({ options, value, onChange }: CalendarTabsProps<T>) {
  return (
    <div className={styles.tabs} role="group" aria-label="Calendar">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={styles.tab}
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
