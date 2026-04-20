import { useEffect, useMemo, useState } from 'react';
import { Login } from './components/Login';
import { Topbar } from './components/Topbar';
import { BranchDashboard } from './components/BranchDashboard';
import { MobileDashboard } from './components/MobileDashboard';
import { HistoryModal } from './components/HistoryModal';
import { EarningsModal } from './components/EarningsModal';
import {
  ConfigureCalendarModal,
  type CalendarInactiveEntry,
} from './components/ConfigureCalendarModal';
import { Job, JobStatus } from './components/JobCard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import {
  apiListBranches,
  apiMobileAcceptJob,
  apiMobilePatchJob,
  apiMobileWasherAvailableJobs,
  apiMobileWasherEarnings,
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
    customerName: String(raw.customer_name ?? raw.customerName ?? '—'),
    address: String(raw.address ?? '—'),
    vehicleType: String(raw.vehicle_type ?? raw.vehicleType ?? '—'),
    serviceType: String(
      raw.service_summary ?? raw.serviceSummary ?? raw.vehicle_summary ?? raw.vehicleSummary ?? '—',
    ),
    pinCode: String(raw.city_pin_code ?? raw.pin_code ?? ''),
    timeSlot: slotDate && st && et ? `${format12h(st)} - ${format12h(et)}` : `${st} - ${et}`,
    ...(durationMinutes != null ? { durationMinutes } : {}),
    tip: Number(raw.tip_cents ?? 0) > 0 ? Math.round(Number(raw.tip_cents ?? 0) / 100) : undefined,
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
  const [showConfigureCalendar, setShowConfigureCalendar] = useState(false);
  const [pinCodeSearch, setPinCodeSearch] = useState('');
  const [selectedPinCode, setSelectedPinCode] = useState('');
  const [calendarInactiveEntries, setCalendarInactiveEntries] = useState<CalendarInactiveEntry[]>(
    [],
  );

  const loadBranchJobs = async (accessToken: string) => {
    const rows = await apiWasherJobs(accessToken);
    setJobs(rows.map(mapBookingToJob));
  };

  const loadMobileData = async (accessToken: string, pinCode: string) => {
    const [assigned, available, history] = await Promise.all([
      apiMobileWasherJobs(accessToken),
      pinCode ? apiMobileWasherAvailableJobs(accessToken, pinCode) : Promise.resolve([]),
      apiMobileWasherHistory(accessToken),
    ]);
    setJobs(assigned.map(mapBookingToJob));
    setAvailableJobs(available.map(mapBookingToJob));
    setHistoryJobs(history.map(mapBookingToJob));
  };

  const handleLogin = async ({ loginId, password }: { loginId: string; password: string }) => {
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
      setUserRole('mobile');
      const s: WasherSession = { mode: 'mobile', cityPinCode: pin, loginId, accessToken: t.access_token };
      writeSession(s);
      setSession(s);
      setMobileLoggedIn(true);
      setPinCodeSearch(pin);
      setSelectedPinCode(pin);
      await loadMobileData(t.access_token, pin);
      toast.success('Signed in');
      return;
    } catch {
      // branch + mobile both failed
    }
    setMobileLoggedIn(false);
    toast.error('No active washer matches those credentials.');
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setMobileLoggedIn(false);
    setJobs([]);
    setAvailableJobs([]);
    setHistoryJobs([]);
    setEarningsTotal(null);
    setPinCodeSearch('');
    setSelectedPinCode('');
    setCalendarInactiveEntries([]);
    toast.success('Logged out successfully');
  };

  const handleAddCalendarInactive = (entry: Omit<CalendarInactiveEntry, 'id'>) => {
    if (
      entry.scope === 'custom_hours' &&
      calendarInactiveEntries.some((p) => p.date === entry.date && p.scope === 'full_day')
    ) {
      toast.error('That date is already marked inactive for the full day.');
      return;
    }
    setCalendarInactiveEntries((prev) => {
      const base =
        entry.scope === 'full_day' ? prev.filter((p) => p.date !== entry.date) : prev;
      return [...base, { ...entry, id: crypto.randomUUID() }];
    });
    toast.success('Inactive period saved');
  };

  const handleRemoveCalendarInactive = (id: string) => {
    setCalendarInactiveEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success('Removed inactive period');
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
      try {
        const backendStatus =
          newStatus === 'arrived' ? 'checked_in' : newStatus;
        await apiMobilePatchJob(session.accessToken, jobId, { status: backendStatus });
        await loadMobileData(session.accessToken, selectedPinCode || session.cityPinCode || '');
      } catch {
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

  const [earningsTotal, setEarningsTotal] = useState<number | null>(null);
  const todayEarnings = earningsTotal ?? jobs
    .filter((j) => j.status === 'completed')
    .reduce((sum, j) => sum + 25 + (j.tip || 0), 0);

  const pinCodeOptions = useMemo(() => {
    const term = pinCodeSearch.trim();
    if (!term) return selectedPinCode ? [selectedPinCode] : [];
    return [term];
  }, [pinCodeSearch, selectedPinCode]);

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

  useEffect(() => {
    if (!session || session.mode !== 'mobile') {
      setEarningsTotal(null);
      return;
    }
    void apiMobileWasherEarnings(session.accessToken)
      .then((x) => setEarningsTotal(Math.round(Number(x.total_tip_amount ?? 0))))
      .catch(() => setEarningsTotal(null));
  }, [session?.accessToken, session?.mode, jobs.length]);

  const isLoggedIn =
    userRole === 'branch'
      ? Boolean(session && session.mode === 'branch')
      : Boolean((session && session.mode === 'mobile') || mobileLoggedIn);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        washerName={session?.loginId?.trim() || 'Washer'}
        todayEarnings={todayEarnings}
        showPinSearch={userRole === 'mobile'}
        pinCodeSearch={pinCodeSearch}
        pinCodeOptions={pinCodeOptions}
        selectedPinCode={selectedPinCode}
        onPinCodeSearchChange={setPinCodeSearch}
        onPinCodeSelect={setSelectedPinCode}
        onShowHistory={() => setShowHistory(true)}
        onShowTotalEarnings={() => setShowEarnings(true)}
        onShowConfigureCalendar={() => {
          // Defer until after the menu sheet finishes closing (same z-index layer as Radix Dialog).
          window.setTimeout(() => setShowConfigureCalendar(true), 50);
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

      <ConfigureCalendarModal
        open={showConfigureCalendar}
        onClose={() => setShowConfigureCalendar(false)}
        entries={calendarInactiveEntries}
        onAddEntry={handleAddCalendarInactive}
        onRemoveEntry={handleRemoveCalendarInactive}
      />

      <Toaster />
    </div>
  );
}