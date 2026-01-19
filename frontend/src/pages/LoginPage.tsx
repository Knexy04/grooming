import { useState } from 'react';
import { apiLogin } from '../lib/api';
import { setToken } from '../lib/auth';
import { Button, Card, Input, Page } from '../ui/Ui';

export function LoginPage() {
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
      const returnTo = localStorage.getItem('returnTo') || '/';
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
    </Page>
  );
}


