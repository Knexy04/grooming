import { useEffect, useMemo, useState } from 'react';
import {
  apiActivateLeafletByCode,
  apiAssignLeafletByCode,
  apiDownloadLeafletPdf,
  apiLeafletByCode,
  apiReassignLeafletByCode,
  type LeafletByCodeResponse,
} from '../lib/api';
import { clearToken } from '../lib/auth';
import { Badge, Button, Card, Divider, Header, Input, Page, Textarea } from '../ui/Ui';

export function LeafletPage({ code }: { code: string }) {
  const [data, setData] = useState<LeafletByCodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [reward, setReward] = useState('200');
  const [assignNote, setAssignNote] = useState('');

  const [activationNote, setActivationNote] = useState('');
  const [reassignOpen, setReassignOpen] = useState(false);

  const title = useMemo(() => (code ? `Пачка ${code}` : 'Пачка'), [code]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiLeafletByCode(code);
      setData(res);
      // если уже закреплена — подставим в форму перезакрепления
      if (res.currentAssignment) {
        setFullName(res.currentAssignment.distributor.fullName);
        setPhone(res.currentAssignment.distributor.phone);
        setReward(String(res.currentAssignment.rewardPerClient));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!code) return;
    void load();
  }, [code]);

  async function doAssign(mode: 'assign' | 'reassign') {
    setError(null);
    try {
      const payload = {
        fullName,
        phone,
        rewardPerClient: Number(reward || 0),
        note: assignNote || undefined,
      };
      if (mode === 'assign') await apiAssignLeafletByCode(code, payload);
      else await apiReassignLeafletByCode(code, payload);

      setAssignNote('');
      setReassignOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  async function doActivate() {
    setError(null);
    try {
      await apiActivateLeafletByCode(code, { note: activationNote || undefined });
      setActivationNote('');
      await load();
      alert('Активировано: клиент пришел');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    }
  }

  async function downloadPdf() {
    setError(null);
    try {
      const blob = await apiDownloadLeafletPdf(code);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaflet-${code}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF failed');
    }
  }

  return (
    <Page>
      <Header
        title={title}
        actions={
          <div className="header-buttons">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.assign('/');
              }}
            >
              На главную
            </Button>
            <Button variant="secondary" onClick={downloadPdf} disabled={!code}>
              Скачать PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearToken();
                window.location.replace('/login');
              }}
            >
              Выйти
            </Button>
          </div>
        }
      />

      <Card>
        {loading ? <div className="muted">Загрузка…</div> : null}
        {error ? (
          <div style={{ color: 'rgba(255, 77, 109, 0.95)', fontSize: 13, whiteSpace: 'pre-wrap' }}>{error}</div>
        ) : null}

        {data ? (
          <>
            <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge>Кампания: {data.campaign.name}</Badge>
                <Badge>
                  Код: <span className="mono">{data.leaflet.publicCode}</span>
                </Badge>
                <Badge>{data.leaflet.printCount} шт.</Badge>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                {new Date(data.leaflet.createdAt).toLocaleString()}
              </div>
            </div>

            <Divider />

            {!data.currentAssignment ? (
              <>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Закрепление листовки за раздатчиком</div>
                <div className="row">
                  <div style={{ flex: '1 1 240px' }}>
                    <Input label="ФИО" value={fullName} onChange={setFullName} placeholder="Иванов Иван" />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <Input label="Телефон" value={phone} onChange={setPhone} placeholder="+7..." />
                  </div>
                  <div style={{ width: 160 }}>
                    <Input label="Вознаграждение (₽)" value={reward} onChange={setReward} placeholder="200" />
                  </div>
                </div>
                <Textarea
                  label="Примечание"
                  value={assignNote}
                  onChange={setAssignNote}
                  placeholder='Напр.: "4 лапы, консультант Ирина"'
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Button onClick={() => void doAssign('assign')}>Закрепить</Button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700 }}>Закреплена за:</div>
                  <Badge>{data.currentAssignment.distributor.fullName}</Badge>
                  <Badge>{data.currentAssignment.distributor.phone}</Badge>
                  <Badge>{data.currentAssignment.rewardPerClient} ₽ / клиент</Badge>
                </div>

                <Divider />

                <div style={{ fontWeight: 700, marginBottom: 10 }}>Активация (клиент пришел)</div>
                <Textarea
                  label="Примечание к активации"
                  value={activationNote}
                  onChange={setActivationNote}
                  placeholder="Опционально: что за клиент/услуга/контекст"
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <Button onClick={() => void doActivate()}>Активировать</Button>
                  <Button variant="secondary" onClick={() => setReassignOpen((v) => !v)}>
                    Перезакрепить
                  </Button>
                </div>

                {reassignOpen ? (
                  <>
                    <Divider />
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Перезакрепление</div>
                    <div className="row">
                      <div style={{ flex: '1 1 240px' }}>
                        <Input label="ФИО" value={fullName} onChange={setFullName} placeholder="Иванов Иван" />
                      </div>
                      <div style={{ flex: '1 1 200px' }}>
                        <Input label="Телефон" value={phone} onChange={setPhone} placeholder="+7..." />
                      </div>
                      <div style={{ width: 160 }}>
                        <Input label="Вознаграждение (₽)" value={reward} onChange={setReward} placeholder="200" />
                      </div>
                    </div>
                    <Textarea
                      label="Примечание"
                      value={assignNote}
                      onChange={setAssignNote}
                      placeholder='Напр.: "Теперь раздает Кирилл, рядом с кассой"'
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <Button onClick={() => void doAssign('reassign')}>Перезакрепить</Button>
                      <Button variant="secondary" onClick={() => setReassignOpen(false)}>
                        Отмена
                      </Button>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </Card>
    </Page>
  );
}


