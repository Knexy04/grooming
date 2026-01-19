import { useEffect, useMemo, useState } from 'react';
import {
  apiCreateCampaign,
  apiCreateLeaflets,
  apiDashboardActivations,
  apiDashboardBatches,
  apiDashboardCampaigns,
  apiDashboardDistributors,
  apiDashboardSummary,
  apiGetCampaign,
  apiListCampaigns,
} from '../lib/api';
import { clearToken } from '../lib/auth';
import { Badge, Button, Card, Divider, Header, Input, Page, Textarea } from '../ui/Ui';

type Campaign = { id: string; name: string; status: string; note: string | null; createdAt: string };

export function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [tab, setTab] = useState<
    'overview' | 'campaigns' | 'batches' | 'distributors' | 'activations' | 'manage'
  >('overview');

  const [summary, setSummary] = useState<any>(null);
  const [campaignRows, setCampaignRows] = useState<any[]>([]);
  const [batchRows, setBatchRows] = useState<any[]>([]);
  const [distributorRows, setDistributorRows] = useState<any[]>([]);
  const [activationRows, setActivationRows] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [leafletNote, setLeafletNote] = useState('');
  const [leafletCount, setLeafletCount] = useState('1');

  const title = useMemo(() => 'Кампании', []);

  async function load() {
    const list = await apiListCampaigns();
    setCampaigns(list);
    if (!selectedId && list[0]) setSelectedId(list[0].id);
  }

  async function loadSelected(id: string) {
    const res = await apiGetCampaign(id);
    setSelected(res);
  }

  async function loadDashboard() {
    const [s, cs, bs, ds, as] = await Promise.all([
      apiDashboardSummary(),
      apiDashboardCampaigns(),
      apiDashboardBatches(),
      apiDashboardDistributors(),
      apiDashboardActivations(150),
    ]);
    setSummary(s);
    setCampaignRows(cs);
    setBatchRows(bs);
    setDistributorRows(ds);
    setActivationRows(as);
  }

  useEffect(() => {
    void load();
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void loadSelected(selectedId);
  }, [selectedId]);

  async function createCampaign() {
    await apiCreateCampaign({ name, note: note || undefined });
    setName('');
    setNote('');
    await load();
    await loadDashboard();
  }

  async function createLeaflets() {
    if (!selectedId) return;
    await apiCreateLeaflets(selectedId, { count: Number(leafletCount || 1), note: leafletNote || undefined });
    setLeafletNote('');
    setLeafletCount('1');
    await loadSelected(selectedId);
    await loadDashboard();
  }

  const q = filterText.trim().toLowerCase();
  const campaignsFiltered = campaignRows.filter((r) =>
    !q ? true : String(r.name ?? '').toLowerCase().includes(q) || String(r.id ?? '').toLowerCase().includes(q),
  );
  const batchesFiltered = batchRows.filter((r) =>
    !q
      ? true
      : String(r.publicCode ?? '').toLowerCase().includes(q) ||
        String(r.campaign?.name ?? '').toLowerCase().includes(q) ||
        String(r.currentDistributor?.fullName ?? '').toLowerCase().includes(q),
  );
  const distributorsFiltered = distributorRows.filter((r) =>
    !q
      ? true
      : String(r.fullName ?? '').toLowerCase().includes(q) ||
        String(r.phone ?? '').toLowerCase().includes(q),
  );
  const activationsFiltered = activationRows.filter((r) =>
    !q
      ? true
      : String(r.batch?.publicCode ?? '').toLowerCase().includes(q) ||
        String(r.campaign?.name ?? '').toLowerCase().includes(q) ||
        String(r.distributor?.fullName ?? '').toLowerCase().includes(q) ||
        String(r.note ?? '').toLowerCase().includes(q),
  );

  return (
    <Page>
      <Header
        title={title}
        actions={
          <div className="header-buttons">
            <Button variant="secondary" onClick={() => void loadDashboard()}>
              Обновить
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
        tabs={
          <div className="header-sub">
            <div className="header-subrow">
              <div className="header-search">
                <Input
                  label=""
                  value={filterText}
                  onChange={setFilterText}
                  placeholder="Поиск: кампания / код / имя / телефон / примечание"
                />
              </div>
            </div>
            <div className="topbar-tabs">
              <Button variant={tab === 'overview' ? 'primary' : 'secondary'} onClick={() => setTab('overview')}>
                Сводка
              </Button>
              <Button variant={tab === 'campaigns' ? 'primary' : 'secondary'} onClick={() => setTab('campaigns')}>
                Кампании
              </Button>
              <Button variant={tab === 'batches' ? 'primary' : 'secondary'} onClick={() => setTab('batches')}>
                Пачки
              </Button>
              <Button
                variant={tab === 'distributors' ? 'primary' : 'secondary'}
                onClick={() => setTab('distributors')}
              >
                Раздатчики
              </Button>
              <Button
                variant={tab === 'activations' ? 'primary' : 'secondary'}
                onClick={() => setTab('activations')}
              >
                Активации
              </Button>
              <Button variant={tab === 'manage' ? 'primary' : 'secondary'} onClick={() => setTab('manage')}>
                Управление
              </Button>
            </div>
          </div>
        }
      />

      {tab === 'overview' ? (
        <div className="row" style={{ marginBottom: 16 }}>
          <div style={{ flex: '1 1 300px' }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Сводка</div>
              {!summary ? (
                <div className="muted">Загрузка…</div>
              ) : (
                <div className="row">
                  <Badge>Кампаний: {summary.campaigns}</Badge>
                  <Badge>Пачек: {summary.batches}</Badge>
                  <Badge>Клиентов: {summary.activations}</Badge>
                  <Badge>Начислено: {summary.totalPayout} ₽</Badge>
                </div>
              )}
              <Divider />
              <div className="muted">
                “Начислено” = сумма по всем активациям (rewardPerClient на момент активации).
              </div>
            </Card>
          </div>
          <div style={{ flex: '2 1 520px' }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Последние активации</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activationsFiltered.slice(0, 12).map((a: any) => (
                  <div key={a.id} className="card" style={{ padding: 12 }}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Badge>
                          Пачка: <span className="mono">{a.batch.publicCode}</span>
                        </Badge>
                        <Badge>Кампания: {a.campaign.name}</Badge>
                        {a.distributor ? <Badge>Раздатчик: {a.distributor.fullName}</Badge> : <Badge>Без раздатчика</Badge>}
                        <Badge>+{a.rewardPerClient} ₽</Badge>
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {new Date(a.activatedAt).toLocaleString()}
                      </div>
                    </div>
                    {a.note ? <div className="muted" style={{ marginTop: 6 }}>{a.note}</div> : null}
                  </div>
                ))}
                {!activationsFiltered.length ? <div className="muted">Пока нет активаций.</div> : null}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === 'campaigns' ? (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Кампании (таблица)</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Название</th>
                  <th>Пачек</th>
                  <th>Клиентов</th>
                  <th>Создана</th>
                </tr>
              </thead>
              <tbody>
                {campaignsFiltered.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      {c.note ? <div className="muted">{c.note}</div> : null}
                      <div className="muted mono" style={{ fontSize: 12 }}>{c.id}</div>
                    </td>
                    <td><Badge>{c.batches}</Badge></td>
                    <td><Badge>{c.activations}</Badge></td>
                    <td className="muted">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'batches' ? (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Пачки (таблица)</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Код</th>
                  <th>Кампания</th>
                  <th>Размер</th>
                  <th>Клиентов</th>
                  <th>Раздает</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {batchesFiltered.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 800 }} className="mono">{b.publicCode}</div>
                      {b.note ? <div className="muted">{b.note}</div> : null}
                      <div className="muted" style={{ fontSize: 12 }}>{new Date(b.createdAt).toLocaleString()}</div>
                    </td>
                    <td>{b.campaign.name}</td>
                    <td><Badge>{b.printCount} шт.</Badge></td>
                    <td><Badge>{b.activations}</Badge></td>
                    <td>
                      {b.currentDistributor ? (
                        <div>
                          <div style={{ fontWeight: 700 }}>{b.currentDistributor.fullName}</div>
                          <div className="muted">{b.currentDistributor.phone}</div>
                          <div className="muted">{b.currentDistributor.rewardPerClient} ₽/клиент</div>
                        </div>
                      ) : (
                        <span className="muted">не закреплена</span>
                      )}
                    </td>
                    <td>
                      <Button variant="secondary" onClick={() => window.location.assign(`/l/${encodeURIComponent(b.publicCode)}`)}>
                        Открыть
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'distributors' ? (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Раздатчики (учёт / выплаты)</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Раздатчик</th>
                  <th>Активных пачек</th>
                  <th>Клиентов</th>
                  <th>Начислено</th>
                </tr>
              </thead>
              <tbody>
                {distributorsFiltered.map((d: any) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{d.fullName}</div>
                      <div className="muted">{d.phone}</div>
                      {d.note ? <div className="muted">{d.note}</div> : null}
                    </td>
                    <td><Badge>{d.activeBatches}</Badge></td>
                    <td><Badge>{d.activations}</Badge></td>
                    <td><Badge>{d.payout} ₽</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'activations' ? (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Активации (лента)</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Когда</th>
                  <th>Пачка</th>
                  <th>Кампания</th>
                  <th>Раздатчик</th>
                  <th>Начисление</th>
                  <th>Примечание</th>
                </tr>
              </thead>
              <tbody>
                {activationsFiltered.map((a: any) => (
                  <tr key={a.id}>
                    <td className="muted">{new Date(a.activatedAt).toLocaleString()}</td>
                    <td className="mono">{a.batch.publicCode}</td>
                    <td>{a.campaign.name}</td>
                    <td>
                      {a.distributor ? (
                        <div>
                          <div style={{ fontWeight: 700 }}>{a.distributor.fullName}</div>
                          <div className="muted">{a.distributor.phone}</div>
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td><Badge>+{a.rewardPerClient} ₽</Badge></td>
                    <td className="muted">{a.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'manage' ? (
        <>
          <div style={{ height: 16 }} />

          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div className="stack">
                <Card>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Создать кампанию</div>
                  <Input label="Название" value={name} onChange={setName} placeholder='Напр.: "4 лапы — январь"' />
                  <Textarea label="Примечание" value={note} onChange={setNote} placeholder="Опционально" />
                  <div style={{ marginTop: 10 }}>
                    <Button onClick={() => void createCampaign()} disabled={!name.trim()}>
                      Создать
                    </Button>
                  </div>
                </Card>

                <Card>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Список кампаний</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {campaigns.map((c) => (
                      <button
                        key={c.id}
                        className="btn btn-secondary"
                        style={{
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                        onClick={() => setSelectedId(c.id)}
                      >
                        <span>{c.name}</span>
                        <span className="mono" style={{ opacity: 0.7 }}>
                          {c.id.slice(c.id.length - 7, c.id.length)}
                        </span>
                      </button>
                    ))}
                    {!campaigns.length ? <div className="muted">Пока нет кампаний.</div> : null}
                  </div>
                </Card>
              </div>
            </div>

            <div style={{ flex: '2 1 520px' }}>
              <Card>
                {!selected ? (
                  <div className="muted">Выбери кампанию слева…</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.name}</div>
                      <Badge>{selected.status}</Badge>
                      <Badge>
                        ID: <span className="mono">{selected.id}</span>
                      </Badge>
                    </div>
                    {selected.note ? <div className="muted" style={{ marginTop: 8 }}>{selected.note}</div> : null}

                    <Divider />

                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Создать пачку листовок в кампании</div>
                    <div className="row" style={{ alignItems: 'flex-end' }}>
                      <div style={{ width: 160 }}>
                        <Input
                          label="Количество листовок"
                          value={leafletCount}
                          onChange={setLeafletCount}
                          placeholder="100"
                        />
                      </div>
                      <div style={{ flex: '1 1 320px' }}>
                        <Input
                          label="Примечание к листовке"
                          value={leafletNote}
                          onChange={setLeafletNote}
                          placeholder="Опционально"
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Button onClick={() => void createLeaflets()}>Создать пачку</Button>
                    </div>

                    <Divider />

                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Пачки листовок</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(selected.leaflets ?? []).map((l: any) => (
                        <div key={l.id} className="card" style={{ padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                Код: <span className="mono">{l.publicCode}</span>
                              </div>
                              {l.note ? <div className="muted">{l.note}</div> : null}
                              <div className="row" style={{ marginTop: 8, gap: 8 }}>
                                <Badge>{(l.printCount ?? 1) + ' шт. в пачке'}</Badge>
                                <Badge>{(l._count?.activations ?? 0) + ' клиентов'}</Badge>
                                {l.assignments?.[0]?.distributor ? (
                                  <Badge>
                                    Раздает: {l.assignments[0].distributor.fullName} ({l.assignments[0].distributor.phone})
                                  </Badge>
                                ) : (
                                  <Badge>Не закреплена</Badge>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button
                                variant="secondary"
                                onClick={() => window.location.assign(`/l/${encodeURIComponent(l.publicCode)}`)}
                              >
                                Открыть
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!(selected.leaflets ?? []).length ? <div className="muted">Листовок пока нет.</div> : null}
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </Page>
  );
}


