const TOKEN_KEY = 'token';
const DISTRIBUTOR_ID_KEY = 'distributorId';
const DISTRIBUTOR_NAME_KEY = 'distributorName';
const DISTRIBUTOR_PHONE_KEY = 'distributorPhone';

// --- АДМИНСКИЙ JWT ---
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// --- СЕССИЯ РАЗДАТЧИКА (БЕЗ JWT) ---
export function getDistributorSession() {
  const id = localStorage.getItem(DISTRIBUTOR_ID_KEY);
  if (!id) return null;
  return {
    id,
    fullName: localStorage.getItem(DISTRIBUTOR_NAME_KEY) ?? '',
    phone: localStorage.getItem(DISTRIBUTOR_PHONE_KEY) ?? '',
  };
}

export function setDistributorSession(args: { id: string; fullName: string; phone: string }) {
  localStorage.setItem(DISTRIBUTOR_ID_KEY, args.id);
  localStorage.setItem(DISTRIBUTOR_NAME_KEY, args.fullName);
  localStorage.setItem(DISTRIBUTOR_PHONE_KEY, args.phone);
}

export function clearDistributorSession() {
  localStorage.removeItem(DISTRIBUTOR_ID_KEY);
  localStorage.removeItem(DISTRIBUTOR_NAME_KEY);
  localStorage.removeItem(DISTRIBUTOR_PHONE_KEY);
}


