import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  apiWasherListLeaveRequests,
  apiWasherSubmitLeaveRequest,
  apiWasherCancelLeaveRequest,
  apiMobileDriverListLeaveRequests,
  apiMobileDriverSubmitLeaveRequest,
  apiMobileDriverCancelLeaveRequest,
  type WasherLeaveRequest,
  type MobileDriverLeaveRequest,
} from '../lib/api';

type AnyLeaveRequest = WasherLeaveRequest | MobileDriverLeaveRequest;

type Props = {
  open: boolean;
  onClose: () => void;
  accessToken: string;
  mode?: 'branch' | 'mobile';
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const TODAY = new Date().toISOString().slice(0, 10);

export function WasherLeaveModal({ open, onClose, accessToken, mode = 'branch' }: Props) {
  const [requests, setRequests] = useState<AnyLeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [leaveDate, setLeaveDate] = useState('');
  const [leaveType, setLeaveType] = useState<'full_day' | 'partial_day'>('full_day');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = mode === 'mobile'
        ? await apiMobileDriverListLeaveRequests(accessToken)
        : await apiWasherListLeaveRequests(accessToken);
      setRequests(data);
    } catch {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetForm = () => {
    setLeaveDate('');
    setLeaveType('full_day');
    setStartTime('');
    setEndTime('');
    setReason('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate) {
      toast.error('Please select a leave date');
      return;
    }
    if (leaveType === 'partial_day' && (!startTime || !endTime || startTime >= endTime)) {
      toast.error('Please enter valid start and end times for partial day leave');
      return;
    }
    setSubmitting(true);
    try {
      const submitFn = mode === 'mobile' ? apiMobileDriverSubmitLeaveRequest : apiWasherSubmitLeaveRequest;
      const newReq = await submitFn(accessToken, {
        leave_date: leaveDate,
        leave_type: leaveType,
        start_time: leaveType === 'partial_day' ? startTime : '',
        end_time: leaveType === 'partial_day' ? endTime : '',
        reason: reason.trim(),
      });
      setRequests((prev) => [newReq, ...prev]);
      resetForm();
      setShowForm(false);
      toast.success('Leave request submitted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      const cancelFn = mode === 'mobile' ? apiMobileDriverCancelLeaveRequest : apiWasherCancelLeaveRequest;
      await cancelFn(accessToken, id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success('Leave request cancelled');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel request');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave Requests</DialogTitle>
          <DialogDescription className="sr-only">
            Submit and track your leave requests
          </DialogDescription>
        </DialogHeader>

        {/* Submit form toggle */}
        {!showForm ? (
          <Button
            type="button"
            className="w-full"
            onClick={() => setShowForm(true)}
          >
            + Apply for Leave
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">New Leave Request</p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="leave-date">
                Leave Date <span className="text-destructive">*</span>
              </label>
              <input
                id="leave-date"
                type="date"
                min={TODAY}
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                required
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Leave Type</p>
              <div className="flex gap-3">
                {(['full_day', 'partial_day'] as const).map((t) => (
                  <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="leave-type"
                      value={t}
                      checked={leaveType === t}
                      onChange={() => setLeaveType(t)}
                      className="accent-primary"
                    />
                    {t === 'full_day' ? 'Full Day' : 'Partial Day'}
                  </label>
                ))}
              </div>
            </div>

            {leaveType === 'partial_day' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="start-time">
                    Start Time
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="end-time">
                    End Time
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="reason">
                Reason (optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Medical appointment"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Submitting…' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Leave history */}
        <div className="mt-4">
          <p className="mb-3 text-sm font-semibold text-foreground">My Requests</p>

          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : requests.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No leave requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{r.leave_date}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.leave_type === 'full_day'
                          ? 'Full Day'
                          : `Partial Day${r.start_time && r.end_time ? ` · ${r.start_time} – ${r.end_time}` : ''}`}
                      </p>
                      {r.reason && (
                        <p className="mt-1 text-xs text-muted-foreground italic">"{r.reason}"</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[r.status] ?? 'bg-slate-100 text-slate-700'}`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </div>

                  {r.status === 'pending' && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={cancelling === r.id}
                        onClick={() => void handleCancel(r.id)}
                      >
                        {cancelling === r.id ? 'Cancelling…' : 'Cancel request'}
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
