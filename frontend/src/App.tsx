import './App.css';
import { DashboardPage } from './pages/DashboardPage';
import { LeafletPage } from './pages/LeafletPage';
import { AdminLoginPage, LoginPage } from './pages/LoginPage';
import { DistributorDashboardPage } from './pages/DistributorDashboardPage';
import { getToken, getDistributorSession } from './lib/auth';

function parseRoute(pathname: string) {
  if (pathname.startsWith('/l/')) {
    const code = decodeURIComponent(pathname.slice('/l/'.length)).trim();
    return { name: 'leaflet' as const, code };
  }
  if (pathname === '/login') return { name: 'login-distributor' as const };
  if (pathname === '/admin/login') return { name: 'login-admin' as const };
  if (pathname === '/admin') return { name: 'admin-dashboard' as const };
  return { name: 'distributor-dashboard' as const };
}

export default function App() {
  const route = parseRoute(window.location.pathname);

  if (route.name === 'login-distributor') return <LoginPage />;
  if (route.name === 'login-admin') return <AdminLoginPage />;

  if (route.name === 'leaflet') {
    const token = getToken();
    if (!token) {
      localStorage.setItem('returnTo', window.location.pathname + window.location.search);
      window.location.replace('/admin/login');
      return null;
    }
    return <LeafletPage code={route.code} />;
  }

  if (route.name === 'admin-dashboard') {
    const token = getToken();
    if (!token) {
      localStorage.setItem('returnTo', window.location.pathname + window.location.search);
      window.location.replace('/admin/login');
      return null;
    }
    return <DashboardPage />;
  }

  // Раздатчик по умолчанию
  const session = getDistributorSession();
  if (!session) return <LoginPage />;
  return <DistributorDashboardPage />;
}

