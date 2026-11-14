import { NavLink } from 'react-router';
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

interface NavItem {
  id: string;
  label: string;
  href: string;
  /** One SVG per Figma `NavIcons` variant state. */
  icons: { action: string; disabled: string; hover: string };
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icons: { action: homeAction, disabled: homeDisabled, hover: homeHover },
  },
  {
    id: 'create',
    label: 'Create a calendar',
    href: '/create',
    icons: { action: plusAction, disabled: plusDisabled, hover: plusHover },
  },
  {
    id: 'calendars',
    label: 'Calendars',
    href: '/calendars',
    icons: { action: calendarAction, disabled: calendarDisabled, hover: calendarHover },
  },
];

export function NavBar() {
  return (
    <nav className={styles.nav} aria-label="Main">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            {/* NavLink sets aria-current="page" on the link for the current route. */}
            <NavLink className={styles.link} to={item.href} end aria-label={item.label}>
              {({ isActive }) => (
                <>
                  <img
                    className={styles.icon}
                    src={isActive ? item.icons.action : item.icons.disabled}
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
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
