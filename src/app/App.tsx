import { useEffect, useMemo, useRef, useState } from 'react';
import { Login } from './components/Login';
import { Topbar } from './components/Topbar';
import { BranchDashboard } from './components/BranchDashboard';
import { MobileDashboard } from './components/MobileDashboard';
import { HistoryModal } from './components/HistoryModal';
import { EarningsModal } from './components/EarningsModal';
import { WasherLeaveModal } from './components/WasherLeaveModal';
import { Job, JobStatus } from './components/JobCard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import {
  apiListBranches,
  apiMobileAcceptJob,
  apiMobilePatchJob,
  apiMobileWasherAvailableJobs,
  apiMobileWasherHistory,
  apiMobileWasherJobs,
  apiMobileWasherLogin,
  apiPatchWasherJob,
  apiWasherJobs,
  apiWasherLogin,
} from './lib/api';
import { clearSession, readSession, writeSession, type WasherSession } from './lib/session';

function format12h(hhmm: string): string {
  const [hRaw, m] = hhmm.split(':');
  let h = Number.parseInt(hRaw, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h)}:${m} ${suffix}`;
}

function mapBookingToJob(raw: any): Job {
  const id = String(raw.id ?? '');
  const slotDate = String(raw.slot_date ?? raw.slotDate ?? '');
  const st = String(raw.start_time ?? raw.startTime ?? '');
  const et = String(raw.end_time ?? raw.endTime ?? '');
  const statusRaw = String(raw.status ?? 'scheduled').toLowerCase();
  let status: JobStatus;
  if (statusRaw === 'checked_in' || statusRaw === 'arrived') {
    status = 'arrived';
  } else if (statusRaw === 'in_progress' || statusRaw === 'completed' || statusRaw === 'cancelled') {
    status = statusRaw as JobStatus;
  } else {
    status = 'scheduled';
  }
  const dmRaw = raw.duration_minutes ?? raw.durationMinutes;
  const durationMinutes =
    typeof dmRaw === 'number' && Number.isFinite(dmRaw) ? Math.round(dmRaw) : undefined;
  return {
    id,
    slotDate,
    customerName: String(raw.customer_name ?? raw.customerName ?? '—'),
    address: String(raw.address ?? '—'),
    vehicleType: String(raw.vehicle_type ?? raw.vehicleType ?? '—'),
    vehicleName: raw.vehicle_model ? String(raw.vehicle_model) : undefined,
    registrationNumber: raw.registration_number ? String(raw.registration_number) : undefined,
    serviceType: String(
      raw.service_summary ?? raw.serviceSummary ?? raw.vehicle_summary ?? raw.vehicleSummary ?? '—',
    ),
    addons: Array.isArray(raw.addon_names)
      ? (raw.addon_names as unknown[]).map(String).filter(Boolean)
      : Array.isArray(raw.addonNames)
        ? (raw.addonNames as unknown[]).map(String).filter(Boolean)
        : [],
    pinCode: String(raw.city_pin_code ?? raw.pin_code ?? ''),
    timeSlot: slotDate && st && et ? `${format12h(st)} - ${format12h(et)}` : `${st} - ${et}`,
    ...(durationMinutes != null ? { durationMinutes } : {}),
    tip: Number(raw.tip_cents ?? 0) > 0 ? Math.round(Number(raw.tip_cents ?? 0) / 100) : undefined,
    serviceTotal: Number(raw.customer_service_total_cents ?? 0) > 0
      ? Math.round(Number(raw.customer_service_total_cents)) / 100
      : undefined,
    status,
  };
}

export default function App() {
  const [session, setSession] = useState<WasherSession | null>(() => readSession());
  const [userRole, setUserRole] = useState<'branch' | 'mobile'>(() => readSession()?.mode ?? 'mobile');
  const [mobileLoggedIn, setMobileLoggedIn] = useState(() => readSession()?.mode === 'mobile');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [historyJobs, setHistoryJobs] = useState<Job[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);
  const [showLeaveRequests, setShowLeaveRequests] = useState(false);
  const [pinCodeSearch, setPinCodeSearch] = useState('');
  const [selectedPinCode, setSelectedPinCode] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [jobRefreshBusy, setJobRefreshBusy] = useState(false);

  const loadBranchJobs = async (accessToken: string) => {
    const rows = await apiWasherJobs(accessToken);
    setJobs(rows.map(mapBookingToJob));
  };

  const recentStatusUpdates = useRef<Map<string, { status: JobStatus; ts: number }>>(new Map());

  const loadMobileData = async (accessToken: string, pinCode: string) => {
    const [assigned, available, history] = await Promise.all([
      apiMobileWasherJobs(accessToken),
      pinCode ? apiMobileWasherAvailableJobs(accessToken, pinCode) : Promise.resolve([]),
      apiMobileWasherHistory(accessToken),
    ]);
    const now = Date.now();
    // Preserve statuses the washer just changed for 5 seconds so background refresh doesn't flicker.
    setJobs(assigned.map((raw) => {
      const job = mapBookingToJob(raw);
      const recent = recentStatusUpdates.current.get(job.id);
      if (recent && now - recent.ts < 5_000) {
        return { ...job, status: recent.status };
      }
      return job;
    }));
    setAvailableJobs(available.map(mapBookingToJob));
    setHistoryJobs(history.map(mapBookingToJob));
  };

  const handleLogin = async ({ loginId, password }: { loginId: string; password: string }) => {
    setIsSigningIn(true);
    setLoginError('');
    // Prefer branch login first so branch washers with overlapping credentials
    // don't get auto-routed into mobile mode and miss assigned branch jobs.
    try {
      const branches = await apiListBranches();
      for (const b of branches) {
        try {
          const t = await apiWasherLogin(b.id, loginId, password);
          setUserRole('branch');
          const s: WasherSession = { mode: 'branch', branchId: b.id, branchName: b.name, loginId, accessToken: t.access_token };
          writeSession(s);
          setSession(s);
          setMobileLoggedIn(false);
          setAvailableJobs([]);
          setPinCodeSearch('');
          setSelectedPinCode('');
          toast.success('Signed in');
          await loadBranchJobs(t.access_token);
          return;
        } catch {
          // try next branch
        }
      }
    } catch {
      // fall through to mobile login
    }

    try {
      const t = await apiMobileWasherLogin(loginId, password);
      const pin = String(t.city_pin_code ?? '').replace(/\D/g, '').slice(0, 6);
      if (!pin) {
        toast.error('Login succeeded but city PIN was missing; contact support.');
        return;
      }
      const servicePins = Array.from(
        new Set(
          (Array.isArray(t.serviceable_zip_codes) ? t.serviceable_zip_codes : [])
            .map((x) => String(x || '').replace(/\D/g, '').slice(0, 6))
            .filter(Boolean)
            .concat(pin)
        )
      );
      setUserRole('mobile');
      const s: WasherSession = {
        mode: 'mobile',
        cityPinCode: pin,
        servicePinCode: String(t.service_pin_code ?? '').replace(/\D/g, '').slice(0, 6),
        serviceablePinCodes: servicePins,
        loginId,
        accessToken: t.access_token,
      };
      writeSession(s);
      setSession(s);
      setMobileLoggedIn(true);
      const defaultSearchPin = servicePins[0] || pin;
      setPinCodeSearch(defaultSearchPin);
      setSelectedPinCode(defaultSearchPin);
      await loadMobileData(t.access_token, defaultSearchPin);
      toast.success('Signed in');
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid credentials';
      setLoginError(msg);
      toast.error(msg);
      setIsSigningIn(false);
      return;
    }
  };

  useEffect(() => {
    if (session) setIsSigningIn(false);
  }, [session]);

  const handleRefreshJobs = async () => {
    if (!session) return;
    setJobRefreshBusy(true);
    try {
      if (session.mode === 'branch') {
        await loadBranchJobs(session.accessToken);
      } else {
        await loadMobileData(session.accessToken, selectedPinCode || session.cityPinCode || '');
      }
      toast.success('Jobs updated');
    } catch {
      toast.error('Could not refresh jobs');
    } finally {
      setJobRefreshBusy(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setMobileLoggedIn(false);
    setJobs([]);
    setAvailableJobs([]);
    setHistoryJobs([]);
    setPinCodeSearch('');
    setSelectedPinCode('');
    toast.success('Logged out successfully');
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job)));
    if (userRole === 'branch') {
      if (!session) return;
      try {
        await apiPatchWasherJob(session.accessToken, jobId, { status: newStatus });
        await loadBranchJobs(session.accessToken);
      } catch {
        toast.error('Failed to update job. Refreshing...');
        await loadBranchJobs(session.accessToken);
        return;
      }
    } else if (session?.mode === 'mobile') {
      recentStatusUpdates.current.set(jobId, { status: newStatus, ts: Date.now() });
      try {
        const backendStatus =
          newStatus === 'arrived' ? 'checked_in' : newStatus;
        await apiMobilePatchJob(session.accessToken, jobId, { status: backendStatus });
        // Do NOT call loadMobileData here — the background refresh will pick it up.
        // Calling it immediately would race with the optimistic update and cause flickering.
      } catch {
        // Revert optimistic update on failure.
        recentStatusUpdates.current.delete(jobId);
        toast.error('Failed to update mobile job. Refreshing...');
        await loadMobileData(session.accessToken, selectedPinCode || session.cityPinCode || '');
        return;
      }
    }

    const statusMessages: Record<JobStatus, string> = {
      scheduled: 'Job scheduled',
      arrived: 'Marked as arrived',
      in_progress: 'Job started',
      completed: 'Job completed',
      cancelled: 'Job cancelled',
    };

    toast.success(statusMessages[newStatus]);
  };

  const handleAcceptJob = (jobId: string) => {
    if (!session || session.mode !== 'mobile') return;
    void (async () => {
      try {
        await apiMobileAcceptJob(session.accessToken, jobId);
        await loadMobileData(session.accessToken, selectedPinCode || session.cityPinCode || '');
        toast.success('Job accepted!');
      } catch {
        toast.error('Failed to accept job');
      }
    })();
  };

  const handleNavigate = (address: string, coordinates?: { lat: number; lng: number }) => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(url, '_blank');
    }
    toast.success('Opening navigation...');
  };

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayEarnings = useMemo(
    () =>
      jobs
        .filter((j) => j.status === 'completed' && j.slotDate === todayISO)
        .reduce((sum, j) => sum + (j.serviceTotal ?? 0) + (j.tip ?? 0), 0),
    [jobs, todayISO],
  );

  const pinCodeOptions = useMemo(() => {
    if (session?.mode !== 'mobile') return [];
    const all = Array.from(new Set((session.serviceablePinCodes ?? []).filter(Boolean)));
    const term = pinCodeSearch.trim();
    if (!term) return all;
    return all.filter((x) => x.includes(term));
  }, [pinCodeSearch, session]);

  const mobileAvailableJobs = useMemo(() => availableJobs, [availableJobs]);

  useEffect(() => {
    if (!session) return;
    if (session.mode === 'branch') {
      void loadBranchJobs(session.accessToken).catch(() => {});
      return;
    }
    const targetPin = selectedPinCode || session.cityPinCode || '';
    void loadMobileData(session.accessToken, targetPin).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, session?.mode, selectedPinCode, session?.cityPinCode]);

  // Auto-refresh jobs every 20 seconds so manager status changes are reflected promptly.
  useEffect(() => {
    if (!session) return;
    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (session.mode === 'branch') {
        void loadBranchJobs(session.accessToken).catch(() => {});
      } else {
        const targetPin = selectedPinCode || session.cityPinCode || '';
        void loadMobileData(session.accessToken, targetPin).catch(() => {});
      }
    }, 20_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, session?.mode, selectedPinCode, session?.cityPinCode]);

  const isLoggedIn =
    userRole === 'branch'
      ? Boolean(session && session.mode === 'branch')
      : Boolean((session && session.mode === 'mobile') || mobileLoggedIn);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} signingIn={isSigningIn} error={loginError} onClearError={() => setLoginError('')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        washerName={session?.loginId?.trim() || 'Washer'}
        todayEarnings={todayEarnings}
        showPinSearch={false}
        jobRefreshBusy={jobRefreshBusy}
        onRefreshJobs={handleRefreshJobs}
        pinCodeSearch={pinCodeSearch}
        pinCodeOptions={pinCodeOptions}
        selectedPinCode={selectedPinCode}
        onPinCodeSearchChange={setPinCodeSearch}
        onPinCodeSelect={setSelectedPinCode}
        onShowHistory={() => setShowHistory(true)}
        onShowTotalEarnings={() => setShowEarnings(true)}
        onShowLeaveRequests={() => {
          window.setTimeout(() => setShowLeaveRequests(true), 50);
        }}
        onLogout={handleLogout}
      />

      {userRole === 'branch' ? (
        <BranchDashboard jobs={jobs} onStatusChange={handleStatusChange} />
      ) : (
        <MobileDashboard
          jobs={jobs}
          availableJobs={mobileAvailableJobs}
          onStatusChange={handleStatusChange}
          onAcceptJob={handleAcceptJob}
          onNavigate={handleNavigate}
        />
      )}

      <HistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        jobs={userRole === 'mobile' ? [...jobs, ...historyJobs] : jobs}
        hideCustomerAddress={userRole === 'branch'}
      />

      <EarningsModal
        open={showEarnings}
        onClose={() => setShowEarnings(false)}
        jobs={jobs}
      />

      {session && (
        <WasherLeaveModal
          open={showLeaveRequests}
          onClose={() => setShowLeaveRequests(false)}
          accessToken={session.accessToken}
          mode={session.mode}
        />
      )}

      <Toaster />
    </div>
  );
}