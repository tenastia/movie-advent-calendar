// Kept as separate files (not inlined) so <use> can reference their glyph layers by id.
import iconCalendar from '../../assets/ui/icon-calendar.svg?no-inline';
import iconList from '../../assets/ui/icon-list.svg?no-inline';
import styles from './ViewToggle.module.css';

export type TitlesView = 'calendar' | 'list';

/**
 * The Figma icons are exported as glyph + (for the selected one) a 5% white
 * circle. Each button renders the glyph layer from the designed SVG by id and
 * draws that circle in CSS, so either view can be shown as selected or hovered.
 *
 * `viewBox` crops the export to the glyph's own outline, which is then drawn at
 * the size the design specifies (calendar 14×14; list 14×11, 0.5px low).
 */
const VIEWS = [
  { id: 'calendar', label: 'Calendar view', src: iconCalendar, layer: 'art', viewBox: '6 6.5 12 12', w: 14, h: 14, nudge: 0 },
  { id: 'list', label: 'List view', src: iconList, layer: 'Vector', viewBox: '6 7.5 12 10', w: 14, h: 11, nudge: 0.5 },
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
          <svg
            className={styles.glyph}
            width={view.w}
            height={view.h}
            viewBox={view.viewBox}
            preserveAspectRatio="none"
            style={{ top: view.nudge }}
            aria-hidden="true"
          >
            <use href={`${view.src}#${view.layer}`} />
          </svg>
        </button>
      ))}
    </div>
  );
}
