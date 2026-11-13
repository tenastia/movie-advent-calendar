import { BrowserRouter, Navigate, Outlet, Route, Routes, useMatch } from 'react-router';
import { CalendarPicker } from './components/CalendarPicker/CalendarPicker';
import { NavBar } from './components/NavBar/NavBar';
import { CalendarsProvider, useCalendars } from './data/CalendarsContext';
import { CreatePage } from './pages/CreatePage/CreatePage';
import { HomePage } from './pages/HomePage/HomePage';

/**
 * The home page, with the Calendars screen layered over it at /calendars.
 * Home stays mounted underneath (and inert while covered), so opening and
 * closing the Calendars screen doesn't reset it.
 */
function HomeLayout() {
  const { active } = useCalendars();
  const calendarsOpen = useMatch('/calendars') !== null;

  return (
    <>
      <div inert={calendarsOpen}>
        {/* Keyed by calendar so switching calendars starts that day fresh. */}
        <HomePage key={active.id} />
      </div>
      <Outlet />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <CalendarsProvider>
        <NavBar />
        <Routes>
          <Route element={<HomeLayout />}>
            <Route path="/" element={null} />
            <Route path="/calendars" element={<CalendarPicker />} />
          </Route>
          <Route path="/create" element={<CreatePage />} />
          {/* No other pages exist yet, so send them home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CalendarsProvider>
    </BrowserRouter>
  );
}
