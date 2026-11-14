// Kept as separate files (not inlined) so <use> can reference their glyph layers by id.
import iconCalendar from '../../assets/ui/icon-calendar.svg?no-inline';
import iconList from '../../assets/ui/icon-list.svg?no-inline';
import styles from './ViewToggle.module.css';

export type TitlesView = 'calendar' | 'list';

/**
 * The Figma icons are exported as glyph + (for the selected one) a 5% white
 * circle. Each button renders the glyph layer from the designed SVG by id and
 * draws that selection circle in CSS, so either view can be shown as selected.
 */
const VIEWS = [
  { id: 'calendar', label: 'Calendar view', src: iconCalendar, layer: 'art', w: 24, h: 24.5 },
  { id: 'list', label: 'List view', src: iconList, layer: 'Vector', w: 24, h: 24 },
] as const;

interface ViewToggleProps {
  value: TitlesView;
  onChange: (view: TitlesView) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="How to add titles">
      {VIEWS.map((view) => (
        <button
          key={view.id}
          type="button"
          className={styles.button}
          aria-label={view.label}
          aria-pressed={value === view.id}
          onClick={() => onChange(view.id)}
        >
          <svg width={view.w} height={view.h} viewBox={`0 0 ${view.w} ${view.h}`} aria-hidden="true">
            <use href={`${view.src}#${view.layer}`} />
          </svg>
        </button>
      ))}
    </div>
  );
}
