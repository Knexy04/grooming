import './App.css';
import { DashboardPage } from './pages/DashboardPage';
import { LeafletPage } from './pages/LeafletPage';
import { LoginPage } from './pages/LoginPage';
import { getToken } from './lib/auth';

function parseRoute(pathname: string) {
  if (pathname.startsWith('/l/')) {
    const code = decodeURIComponent(pathname.slice('/l/'.length)).trim();
    return { name: 'leaflet' as const, code };
  }
  if (pathname === '/login') return { name: 'login' as const };
  return { name: 'dashboard' as const };
}

export default function App() {
  const route = parseRoute(window.location.pathname);
  const token = getToken();

  if (!token && route.name !== 'login') {
    // сохраняем куда хотели попасть и уводим на логин
    localStorage.setItem('returnTo', window.location.pathname + window.location.search);
    window.location.replace('/login');
    return null;
  }

  if (route.name === 'login') return <LoginPage />;
  if (route.name === 'leaflet') return <LeafletPage code={route.code} />;
  return <DashboardPage />;
}
