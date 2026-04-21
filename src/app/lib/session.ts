const SESSION_KEY = 'carwash_washerdriver_session_v1';

export type WasherSession = {
  mode: 'branch' | 'mobile';
  branchId?: string;
  branchName?: string;
  cityPinCode?: string;
  servicePinCode?: string;
  serviceablePinCodes?: string[];
  loginId: string;
  accessToken: string;
};

export function readSession(): WasherSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as WasherSession;
    if (!p?.mode || !p?.loginId || !p?.accessToken) return null;
    if (p.mode === 'branch' && !p.branchId) return null;
    if (p.mode === 'mobile' && !p.cityPinCode) return null;
    return p;
  } catch {
    return null;
  }
}

export function writeSession(s: WasherSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

