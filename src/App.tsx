import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { NavBar } from './components/NavBar/NavBar';
import { CreatePage } from './pages/CreatePage/CreatePage';
import { HomePage } from './pages/HomePage/HomePage';

export function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        {/* No other pages exist yet (e.g. /calendars), so send them home. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
