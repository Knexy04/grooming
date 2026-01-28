import { useEffect, useState } from 'react';
import { apiDistributorBatches, apiDistributorOverview } from '../lib/api';
import { clearDistributorSession, getDistributorSession } from '../lib/auth';
import { Badge, Button, Card, Divider, Header, Page } from '../ui/Ui';

export function DistributorDashboardPage() {
  const session = getDistributorSession();
  const [overview, setOverview] = useState<any | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([
      apiDistributorOverview(session.id),
      apiDistributorBatches(session.id),
    ])
      .then(([ov, bs]) => {
        setOverview(ov);
        setBatches(bs);
      })
      .finally(() => setLoading(false));
  }, [session?.id]);

  if (!session) {
    // Если по какой‑то причине сессии нет — уводим на упрощённый логин раздатчика
    window.location.replace('/login');
    return null;
  }

  const me = overview?.me;
  const peers = overview?.peers ?? [];

  return (
    <Page>
      <Header
        title="Мои результаты"
        actions={
          <div className="header-buttons">
            <Button variant="secondary" onClick={() => window.location.assign('/admin/login')}>
              Зайти как админ
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearDistributorSession();
                window.location.replace('/login');
              }}
            >
              Выйти
            </Button>
          </div>
        }
      />

      <div style={{ height: 16 }} />

      <div className="row" style={{ marginBottom: 16 }}>
        <div style={{ flex: '1 1 260px' }}>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Ты, как раздатчик</div>
            {!me || loading ? (
              <div className="muted">Загрузка…</div>
            ) : (
              <>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{me.fullName}</div>
                <div className="muted" style={{ marginBottom: 8 }}>
                  {me.phone}
                </div>
                {me.note ? <div className="muted" style={{ marginBottom: 8 }}>{me.note}</div> : null}
                <Divider />
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <Badge>Активных пачек: {me.activeBatches}</Badge>
                  <Badge>Клиентов: {me.activations}</Badge>
                  <Badge>Начислено: {me.payout} ₽</Badge>
                </div>
              </>
            )}
          </Card>
        </div>

        <div style={{ flex: '2 1 420px' }}>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Другие раздатчики</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
              Для прозрачности показываем, как в целом идут дела у команды. Номера телефонов других раздатчиков
              скрыты.
            </div>
            {loading ? (
              <div className="muted">Загрузка…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {peers.map((d: any) => (
                  <div key={d.id} className="card" style={{ padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {d.fullName}
                          {d.id === me?.id ? ' (ты)' : ''}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {d.id === me?.id ? d.phone : 'телефон скрыт'}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Badge>Пачек: {d.activeBatches}</Badge>
                        <Badge>Клиентов: {d.activations}</Badge>
                        <Badge>Начислено: {d.payout} ₽</Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {!peers.length ? <div className="muted">Пока других раздатчиков нет.</div> : null}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Мои пачки листовок</div>
        {loading ? (
          <div className="muted">Загрузка…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Пачка</th>
                  <th>Компания</th>
                  <th>Размер</th>
                  <th>Клиентов</th>
                  <th>Начислено</th>
                  <th>Ставка</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div className="mono" style={{ fontWeight: 700 }}>
                        {b.leaflet.publicCode}
                      </div>
                      {b.note ? <div className="muted">{b.note}</div> : null}
                    </td>
                    <td>{b.leaflet.campaign.name}</td>
                    <td>
                      <Badge>{b.leaflet.printCount} шт.</Badge>
                    </td>
                    <td>
                      <Badge>{b.activations}</Badge>
                    </td>
                    <td>
                      <Badge>{b.payout} ₽</Badge>
                    </td>
                    <td>
                      <span className="muted">{b.rewardPerClient} ₽/клиент</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!batches.length ? <div className="muted">Пока на тебе нет ни одной активной пачки.</div> : null}
          </div>
        )}
      </Card>
    </Page>
  );
}

