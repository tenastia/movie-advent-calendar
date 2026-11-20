import homeAction from '../../assets/icons/home-action.svg';
import homeDisabled from '../../assets/icons/home-disabled.svg';
import homeHover from '../../assets/icons/home-hover.svg';
import plusAction from '../../assets/icons/plus-action.svg';
import plusDisabled from '../../assets/icons/plus-disabled.svg';
import plusHover from '../../assets/icons/plus-hover.svg';
import calendarAction from '../../assets/icons/calendar-action.svg';
import calendarDisabled from '../../assets/icons/calendar-disabled.svg';
import calendarHover from '../../assets/icons/calendar-hover.svg';
import styles from './NavBar.module.css';

export type NavItemId = 'home' | 'create' | 'calendars';

type IconState = 'action' | 'disabled' | 'hover';

interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  /** False while the page isn't built yet. */
  available: boolean;
  /** One SVG per Figma `NavIcons` variant state. */
  icons: Record<IconState, string>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '#home',
    available: true,
    icons: { action: homeAction, disabled: homeDisabled, hover: homeHover },
  },
  {
    id: 'create',
    label: 'Create a calendar',
    href: '#create',
    available: true,
    icons: { action: plusAction, disabled: plusDisabled, hover: plusHover },
  },
  {
    id: 'calendars',
    label: 'Calendars',
    href: '#calendars',
    available: false,
    icons: { action: calendarAction, disabled: calendarDisabled, hover: calendarHover },
  },
];

/**
 * Variant per item, as in the mobile designs: `Hover` (highlighted tile) marks the
 * current page, `Action` a page you can go to, `Disabled` one that isn't built yet.
 */
function getIconState(item: NavItem, active: NavItemId): IconState {
  if (item.id === active) return 'hover';
  return item.available ? 'action' : 'disabled';
}

interface NavBarProps {
  active: NavItemId;
}

export function NavBar({ active }: NavBarProps) {
  return (
    <nav className={styles.nav} aria-label="Main">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                className={styles.link}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <img
                  className={styles.icon}
                  src={item.icons[getIconState(item, active)]}
                  width={38}
                  height={38}
                  alt=""
                />
                <img
                  className={`${styles.icon} ${styles.hover}`}
                  src={item.icons.hover}
                  width={38}
                  height={38}
                  alt=""
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
