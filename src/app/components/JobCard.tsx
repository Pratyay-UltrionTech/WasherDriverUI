import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';

export type JobStatus = 'scheduled' | 'assigned' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  slotDate?: string;
  customerName: string;
  address: string;
  pinCode?: string;
  vehicleType: string;
  /** Make/model of vehicle, e.g. "Toyota Corolla". */
  vehicleName?: string;
  /** Vehicle registration plate, e.g. "ABC 123". */
  registrationNumber?: string;
  serviceType: string;
  /** Add-on names (populated when backend returns them). */
  addons?: string[];
  timeSlot: string;
  /** Total scheduled minutes when returned by the API. */
  durationMinutes?: number;
  tip?: number;
  /** Customer-paid service total in dollars (excluding tip). */
  serviceTotal?: number;
  status: JobStatus;
  coordinates?: { lat: number; lng: number };
}

interface JobCardProps {
  job: Job;
  role: 'branch' | 'mobile';
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
  onNavigate?: (address: string, coordinates?: { lat: number; lng: number }) => void;
  onAccept?: (jobId: string) => void;
  isAvailable?: boolean;
}

function formatSlotDate(isoDate?: string): string {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function shortCode(id: string): string {
  return `#${id.replace(/-/g, '').slice(-6).toUpperCase()}`;
}

const PinIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function JobCard({
  job,
  role,
  onStatusChange,
  onNavigate,
  onAccept,
  isAvailable = false,
}: JobCardProps) {
  const getNextAction = () => {
    if (isAvailable) {
      return (
        <Button onClick={() => onAccept?.(job.id)} className="w-full h-10 bg-primary hover:bg-primary/90 text-sm">
          Accept Job
        </Button>
      );
    }

    if (role === 'branch') {
      switch (job.status) {
        case 'scheduled':
        case 'arrived':
          return (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange?.(job.id, 'in_progress')} className="min-h-10 flex-1 bg-primary hover:bg-primary/90 text-sm">
                Start Job
              </Button>
              <Button onClick={() => onStatusChange?.(job.id, 'cancelled')} variant="outline" className="min-h-10 px-4 text-sm">
                Cancel
              </Button>
            </div>
          );
        case 'in_progress':
          return (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange?.(job.id, 'completed')} className="min-h-10 flex-1 bg-success hover:bg-success/90 text-sm">
                Complete
              </Button>
              <Button onClick={() => onStatusChange?.(job.id, 'cancelled')} variant="outline" className="min-h-10 px-4 text-sm">
                Cancel
              </Button>
            </div>
          );
        default:
          return null;
      }
    }

    if (role === 'mobile') {
      const MapsBtn = (
        <Button onClick={() => onNavigate?.(job.address, job.coordinates)} variant="outline" className="min-h-10 shrink-0 gap-1.5 px-3 text-sm">
          <PinIcon />
          Maps
        </Button>
      );
      switch (job.status) {
        case 'scheduled':
        case 'assigned':
          return (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange?.(job.id, 'arrived')} className="min-h-10 flex-1 bg-primary hover:bg-primary/90 text-sm">
                Mark Arrived
              </Button>
              {MapsBtn}
            </div>
          );
        case 'arrived':
          return (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange?.(job.id, 'in_progress')} className="min-h-10 flex-1 bg-primary hover:bg-primary/90 text-sm">
                Start Job
              </Button>
              {MapsBtn}
            </div>
          );
        case 'in_progress':
          return (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange?.(job.id, 'completed')} className="min-h-10 flex-1 bg-success hover:bg-success/90 text-sm">
                Complete
              </Button>
              <Button onClick={() => onStatusChange?.(job.id, 'cancelled')} variant="outline" className="min-h-10 px-4 text-sm">
                Cancel
              </Button>
            </div>
          );
        default:
          return null;
      }
    }

    return null;
  };

  const formattedDate = formatSlotDate(job.slotDate);
  const code = shortCode(job.id);
  const addons = (job.addons ?? []).filter(Boolean);

  return (
    <div className="bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
      {/* ── Row 1: code + status ── */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-border/50">
        <span className="text-[11px] font-medium text-muted-foreground">
          Booking ID - {code}
        </span>
        <StatusBadge status={job.status} />
      </div>

      <div className="px-3 py-2.5 space-y-2">
        {/* ── Row 2: customer + date/time side by side ── */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm leading-snug">{job.customerName}</h3>
          {(formattedDate || job.timeSlot) && (
            <div className="text-right shrink-0">
              {formattedDate && (
                <p className="text-[11px] font-medium text-foreground">{formattedDate}</p>
              )}
              <p className="text-[11px] text-muted-foreground leading-tight">
                {job.timeSlot}
                {job.durationMinutes != null && Number.isFinite(job.durationMinutes)
                  ? ` · ${job.durationMinutes}m`
                  : ''}
              </p>
            </div>
          )}
        </div>

        {/* ── Row 3: address (mobile only) ── */}
        {role === 'mobile' && (
          <div className="flex items-start gap-1 text-xs text-muted-foreground">
            <PinIcon />
            <span className="flex-1 leading-snug">{job.address}</span>
            {job.pinCode && (
              <span className="shrink-0 font-medium text-foreground/70">
                {job.pinCode}
              </span>
            )}
          </div>
        )}

        {/* ── Row 4: chips ── */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/70 text-[11px] text-foreground/75">
            {job.vehicleType}
          </span>
          {job.vehicleName ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/70 text-[11px] text-foreground/75">
              {job.vehicleName}
            </span>
          ) : null}
          {job.registrationNumber ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono font-medium text-foreground/70 border border-slate-200">
              {job.registrationNumber}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/70 text-[11px] text-foreground/75">
            {job.serviceType}
          </span>
          {addons.map((addon) => (
            <span key={addon} className="inline-flex px-2 py-0.5 rounded-md bg-secondary/70 text-[11px] text-foreground/75">
              {addon}
            </span>
          ))}
          {job.tip != null && job.tip > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20 text-[11px] font-medium">
              Tip ${job.tip}
            </span>
          )}
        </div>

        {/* ── Row 5: actions ── */}
        {getNextAction()}
      </div>
    </div>
  );
}
