import viewCalendar from '../../assets/create/view-calendar.svg';
import viewList from '../../assets/create/view-list.svg';
import styles from './ViewToggle.module.css';

export type DayPickerView = 'calendar' | 'list';

interface ViewToggleProps {
  value: DayPickerView;
  onChange: (value: DayPickerView) => void;
}

/** The IconCalendar / IconList pair; the selected view gets the round highlight. */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Day picker view">
      <button
        type="button"
        className={styles.button}
        aria-label="Calendar view"
        aria-pressed={value === 'calendar'}
        onClick={() => onChange('calendar')}
      >
        <img src={viewCalendar} width={14} height={14} alt="" />
      </button>
      <button
        type="button"
        className={styles.button}
        aria-label="List view"
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
      >
        <img src={viewList} width={26} height={26} alt="" />
      </button>
    </div>
  );
}
