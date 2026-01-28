import { useState } from 'react';
import { apiDistributorLogin, apiLogin } from '../lib/api';
import { setDistributorSession, setToken } from '../lib/auth';
import { Button, Card, Input, Page } from '../ui/Ui';

function isValidPhone(value: string) {
  const trimmed = value.trim();
  const digits = value.replace(/\D/g, '');
  return trimmed.startsWith('+7') && digits.length === 11;
}

// Вход раздатчика по номеру телефона (основной сценарий)
export function LoginPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidPhone(phone)) {
      setError('Номер должен начинаться с +7 и содержать 11 цифр.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiDistributorLogin(phone);
      setDistributorSession({
        id: res.distributor.id,
        fullName: res.distributor.fullName,
        phone: res.distributor.phone,
      });
      window.location.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не получилось войти');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Вход для раздатчика</div>
          <Button variant="secondary" onClick={() => window.location.assign('/admin/login')}>
            Зайти как админ
          </Button>
        </div>
        <Card>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              label="Твой номер телефона"
              value={phone}
              onChange={setPhone}
              placeholder="+7 999 123-45-67"
            />
            {error ? (
              <div style={{ color: 'rgba(255, 77, 109, 0.95)', fontSize: 13, whiteSpace: 'pre-wrap' }}>{error}</div>
            ) : (
              <div className="muted" style={{ fontSize: 13 }}>
                Введи тот же номер, который указали при назначении пачки листовок.
              </div>
            )}
            <Button type="submit" disabled={loading || !phone.trim()}>
              Посмотреть мои результаты
            </Button>
          </form>
        </Card>
      </div>
    </Page>
  );
}

// Вход администратора (email + пароль)
export function AdminLoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      setToken(res.token);
      const returnTo = localStorage.getItem('returnTo') || '/admin';
      localStorage.removeItem('returnTo');
      window.location.replace(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Вход администратора</div>
          <Button variant="secondary" onClick={() => window.location.assign('/')}>
            Я раздатчик
          </Button>
        </div>
        <Card>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Email" value={email} onChange={setEmail} placeholder="admin@example.com" />
            <Input label="Пароль" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
            {error ? (
              <div style={{ color: 'rgba(255, 77, 109, 0.95)', fontSize: 13, whiteSpace: 'pre-wrap' }}>{error}</div>
            ) : null}
            <Button type="submit" disabled={loading}>
              Войти
            </Button>
          </form>
        </Card>
      </div>
    </Page>
  );
}

