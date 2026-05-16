import { API_BASE } from './apiBase';

export type TokenResponse = { access_token: string; token_type: string };

export type BranchRef = { id: string; name: string };

export async function apiListBranches(): Promise<BranchRef[]> {
  const res = await fetch(`${API_BASE}/public/branches`);
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error('Failed to load branches');
  return (data as any[]).map((b) => ({ id: String(b.id ?? ''), name: String(b.name ?? '') }));
}

export async function apiWasherLogin(branchId: string, loginId: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/washer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ branch_id: branchId, login_id: loginId, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Invalid credentials');
  return data as TokenResponse;
}

function normalizeMobilePin(raw: string): string {
  return String(raw ?? '')
    .replace(/\D/g, '')
    .slice(0, 6);
}

export type MobileWasherLoginResult = TokenResponse & {
  city_pin_code?: string;
  service_pin_code?: string;
  serviceable_zip_codes?: string[];
};

/** Optional PIN; omit to use only login ID + password (response includes city_pin_code for the session). */
export async function apiMobileWasherLogin(
  loginId: string,
  password: string,
  cityPinCode?: string
): Promise<MobileWasherLoginResult> {
  const res = await fetch(`${API_BASE}/auth/mobile/washer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city_pin_code: cityPinCode ? normalizeMobilePin(cityPinCode) : '',
      login_id: loginId.trim(),
      password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof data?.detail === 'string'
        ? data.detail
        : typeof data?.detail?.detail === 'string'
          ? data.detail.detail
          : 'Invalid credentials';
    throw new Error(detail);
  }
  return data as MobileWasherLoginResult;
}

export async function apiWasherJobs(accessToken: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/washer/jobs`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error('Failed to load jobs');
  return data as any[];
}

export async function apiPatchWasherJob(
  accessToken: string,
  bookingId: string,
  patch: { status?: string; notes?: string }
): Promise<any> {
  const res = await fetch(`${API_BASE}/washer/jobs/${bookingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Failed to update job');
  return data;
}

export async function apiMobileWasherJobs(accessToken: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/washer/mobile/jobs`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error('Failed to load mobile jobs');
  return data as any[];
}

export async function apiMobileWasherAvailableJobs(accessToken: string, pinCode: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/washer/mobile/jobs/available?pin_code=${encodeURIComponent(pinCode)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error('Failed to load available mobile jobs');
  return data as any[];
}

export async function apiWasherAddUnavailability(
  accessToken: string,
  entry: { date: string; all_day: boolean; start_time?: string; end_time?: string }
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/washer/unavailability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(entry),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Failed to save unavailability');
  return data as { id: string };
}

export async function apiWasherDeleteUnavailability(
  accessToken: string,
  unavailabilityId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/washer/unavailability/${encodeURIComponent(unavailabilityId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data?.detail === 'string' ? data.detail : 'Failed to delete unavailability');
  }
}

export async function apiMobileSetUnavailableDate(accessToken: string, dateISO: string): Promise<void> {
  const res = await fetch(`${API_BASE}/washer/mobile/availability/unavailable-dates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ date: dateISO }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Failed to save unavailable date');
}

export async function apiMobileAcceptJob(accessToken: string, bookingId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/washer/mobile/jobs/${bookingId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Failed to accept job');
  return data;
}

export async function apiMobilePatchJob(
  accessToken: string,
  bookingId: string,
  patch: { status?: string; notes?: string; tip_cents?: number }
): Promise<any> {
  const res = await fetch(`${API_BASE}/washer/mobile/jobs/${bookingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Failed to update mobile job');
  return data;
}

export async function apiMobileWasherHistory(accessToken: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/washer/mobile/jobs/history`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error('Failed to load mobile history');
  return data as any[];
}

export async function apiMobileWasherEarnings(accessToken: string): Promise<{
  completed_jobs: number;
  total_tip_cents: number;
  total_tip_amount: number;
  total_service_revenue_cents: number;
  total_service_revenue_amount: number;
}> {
  const res = await fetch(`${API_BASE}/washer/mobile/earnings`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Failed to load mobile earnings');
  return data as any;
}

function extractApiError(data: any): string {
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.detail?.detail === 'string') return data.detail.detail;
  return 'Something went wrong.';
}

export async function apiForgotPasswordWasher(identifier: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/washer/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractApiError(data));
}

export async function apiVerifyOtpWasher(identifier: string, otp: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/washer/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractApiError(data));
}

export async function apiResetPasswordWasher(identifier: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/washer/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, new_password: newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractApiError(data));
}

// ---------------------------------------------------------------------------
// Leave requests
// ---------------------------------------------------------------------------

export type WasherLeaveRequest = {
  id: string;
  branch_id: string;
  washer_id: string;
  washer_name: string;
  leave_date: string;
  leave_type: 'full_day' | 'partial_day';
  start_time: string;
  end_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_manager_id: string | null;
  reviewed_at: string | null;
  created_at: string | null;
};

export async function apiWasherListLeaveRequests(accessToken: string): Promise<WasherLeaveRequest[]> {
  const res = await fetch(`${API_BASE}/washer/leave-requests`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(extractApiError(data));
  return data as WasherLeaveRequest[];
}

export async function apiWasherSubmitLeaveRequest(
  accessToken: string,
  body: {
    leave_date: string;
    leave_type: 'full_day' | 'partial_day';
    start_time?: string;
    end_time?: string;
    reason?: string;
  }
): Promise<WasherLeaveRequest> {
  const res = await fetch(`${API_BASE}/washer/leave-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractApiError(data));
  return data as WasherLeaveRequest;
}

export async function apiWasherCancelLeaveRequest(
  accessToken: string,
  leaveRequestId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/washer/leave-requests/${encodeURIComponent(leaveRequestId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(extractApiError(data));
  }
}

// ---------------------------------------------------------------------------
// Mobile driver leave requests
// ---------------------------------------------------------------------------

export type MobileDriverLeaveRequest = {
  id: string;
  mobile_manager_id: string;
  driver_id: string;
  driver_name: string;
  leave_date: string;
  leave_type: 'full_day' | 'partial_day';
  start_time: string;
  end_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_manager_id: string | null;
  reviewed_at: string | null;
  created_at: string | null;
};

export async function apiMobileDriverListLeaveRequests(accessToken: string): Promise<MobileDriverLeaveRequest[]> {
  const res = await fetch(`${API_BASE}/washer/mobile/leave-requests`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(extractApiError(data));
  return data as MobileDriverLeaveRequest[];
}

export async function apiMobileDriverSubmitLeaveRequest(
  accessToken: string,
  body: {
    leave_date: string;
    leave_type: 'full_day' | 'partial_day';
    start_time?: string;
    end_time?: string;
    reason?: string;
  }
): Promise<MobileDriverLeaveRequest> {
  const res = await fetch(`${API_BASE}/washer/mobile/leave-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractApiError(data));
  return data as MobileDriverLeaveRequest;
}

export async function apiMobileDriverCancelLeaveRequest(
  accessToken: string,
  leaveRequestId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/washer/mobile/leave-requests/${encodeURIComponent(leaveRequestId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(extractApiError(data));
  }
}

