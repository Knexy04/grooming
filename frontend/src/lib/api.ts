import { getToken } from './auth';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    localStorage.setItem('returnTo', window.location.pathname + window.location.search);
    window.location.replace('/login');
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

export type LoginResponse = { token: string; user: { id: string; email: string } };

export async function apiLogin(email: string, password: string) {
  return await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export type LeafletByCodeResponse = {
  leaflet: {
    id: string;
    publicCode: string;
    printCount: number;
    status: string;
    note: string | null;
    createdAt: string;
  };
  campaign: { id: string; name: string; status: string; note: string | null };
  currentAssignment:
    | null
    | {
        id: string;
        assignedAt: string;
        rewardPerClient: number;
        note: string | null;
        distributor: { id: string; fullName: string; phone: string };
      };
};

export async function apiLeafletByCode(code: string) {
  return await request<LeafletByCodeResponse>(`/leaflets/by-code/${encodeURIComponent(code)}`);
}

export async function apiAssignLeafletByCode(
  code: string,
  body: { fullName: string; phone: string; rewardPerClient: number; note?: string },
) {
  return await request(`/leaflets/by-code/${encodeURIComponent(code)}/assign`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiReassignLeafletByCode(
  code: string,
  body: { fullName: string; phone: string; rewardPerClient: number; note?: string },
) {
  return await request(`/leaflets/by-code/${encodeURIComponent(code)}/reassign`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiActivateLeafletByCode(code: string, body: { note?: string }) {
  return await request(`/leaflets/by-code/${encodeURIComponent(code)}/activate`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiDownloadLeafletPdf(code: string): Promise<Blob> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}/leaflets/by-code/${encodeURIComponent(code)}/pdf`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.blob();
}

export async function apiListCampaigns() {
  return await request<Array<{ id: string; name: string; status: string; note: string | null; createdAt: string }>>(
    '/campaigns',
  );
}

export async function apiCreateCampaign(body: { name: string; note?: string }) {
  return await request('/campaigns', { method: 'POST', body: JSON.stringify(body) });
}

export async function apiGetCampaign(id: string) {
  return await request(`/campaigns/${encodeURIComponent(id)}`);
}

export async function apiCreateLeaflets(campaignId: string, body: { count: number; note?: string }) {
  return await request(`/campaigns/${encodeURIComponent(campaignId)}/leaflets`, {
    method: 'POST',
    body: JSON.stringify({ printCount: body.count, note: body.note }),
  });
}

export async function apiDashboardSummary() {
  return await request<{ campaigns: number; batches: number; activations: number; totalPayout: number }>(
    '/dashboard/summary',
  );
}

export async function apiDashboardCampaigns() {
  return await request<
    Array<{
      id: string;
      name: string;
      status: string;
      note: string | null;
      createdAt: string;
      batches: number;
      activations: number;
    }>
  >('/dashboard/campaigns');
}

export async function apiDashboardBatches(campaignId?: string) {
  const qs = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : '';
  return await request<
    Array<{
      id: string;
      publicCode: string;
      printCount: number;
      status: string;
      note: string | null;
      createdAt: string;
      activations: number;
      campaign: { id: string; name: string };
      currentDistributor:
        | null
        | { id: string; fullName: string; phone: string; rewardPerClient: number };
    }>
  >(`/dashboard/batches${qs}`);
}

export async function apiDashboardDistributors() {
  return await request<
    Array<{
      id: string;
      fullName: string;
      phone: string;
      note: string | null;
      createdAt: string;
      activeBatches: number;
      activations: number;
      payout: number;
    }>
  >('/dashboard/distributors');
}

export async function apiDashboardActivations(take = 100) {
  return await request<
    Array<{
      id: string;
      activatedAt: string;
      note: string | null;
      campaign: { id: string; name: string };
      batch: { id: string; publicCode: string };
      distributor: null | { id: string; fullName: string; phone: string };
      rewardPerClient: number;
      activatedBy: { id: string; email: string };
    }>
  >(`/dashboard/activations?take=${encodeURIComponent(String(take))}`);
}


