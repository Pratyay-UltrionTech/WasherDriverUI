import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';

export type JobStatus = 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  slotDate?: string;
  customerName: string;
  address: string;
  pinCode?: string;
  vehicleType: string;
  serviceType: string;
  timeSlot: string;
  /** Total scheduled minutes when returned by the API. */
  durationMinutes?: number;
  tip?: number;
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
        <Button
          onClick={() => onAccept?.(job.id)}
          className="w-full h-11 bg-primary hover:bg-primary/90"
        >
          Accept Job
        </Button>
      );
    }

    if (role === 'branch') {
      switch (job.status) {
        case 'scheduled':
        case 'arrived':
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onStatusChange?.(job.id, 'in_progress')}
                className="min-h-11 min-w-0 flex-1 bg-primary hover:bg-primary/90"
              >
                Start Job
              </Button>
              <Button
                onClick={() => onStatusChange?.(job.id, 'cancelled')}
                variant="outline"
                className="min-h-11 shrink-0 px-4"
              >
                Cancel
              </Button>
            </div>
          );
        case 'in_progress':
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onStatusChange?.(job.id, 'completed')}
                className="min-h-11 min-w-0 flex-1 bg-success hover:bg-success/90"
              >
                Complete
              </Button>
              <Button
                onClick={() => onStatusChange?.(job.id, 'cancelled')}
                variant="outline"
                className="min-h-11 shrink-0 px-4"
              >
                Cancel
              </Button>
            </div>
          );
        default:
          return null;
      }
    }

    if (role === 'mobile') {
      switch (job.status) {
        case 'scheduled':
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onStatusChange?.(job.id, 'arrived')}
                className="min-h-11 min-w-0 flex-1 bg-primary hover:bg-primary/90"
              >
                Mark Arrived
              </Button>
              <Button
                onClick={() => onNavigate?.(job.address, job.coordinates)}
                variant="outline"
                className="min-h-11 shrink-0 gap-1.5 px-3"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Maps
              </Button>
            </div>
          );
        case 'arrived':
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onStatusChange?.(job.id, 'in_progress')}
                className="min-h-11 min-w-0 flex-1 bg-primary hover:bg-primary/90"
              >
                Start Job
              </Button>
              <Button
                onClick={() => onNavigate?.(job.address, job.coordinates)}
                variant="outline"
                className="min-h-11 shrink-0 gap-1.5 px-3"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Maps
              </Button>
            </div>
          );
        case 'in_progress':
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onStatusChange?.(job.id, 'completed')}
                className="min-h-11 min-w-0 flex-1 bg-success hover:bg-success/90"
              >
                Complete
              </Button>
              <Button
                onClick={() => onStatusChange?.(job.id, 'cancelled')}
                variant="outline"
                className="min-h-11 shrink-0 px-4"
              >
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

  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">#{job.id}</p>
            <p className="text-xs text-muted-foreground">{job.timeSlot}</p>
            {job.durationMinutes != null && Number.isFinite(job.durationMinutes) && (
              <p className="text-xs text-muted-foreground">{job.durationMinutes} min</p>
            )}
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div>
          <h3 className="font-semibold mb-1">{job.customerName}</h3>
          {role === 'mobile' && (
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground flex items-start gap-1">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="flex-1">{job.address}</span>
              </p>
              {job.pinCode && (
                <p className="text-xs text-muted-foreground">Pin code: {job.pinCode}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            {job.vehicleType}
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {job.serviceType}
          </div>

          {job.tip && job.tip > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success border border-success/20 text-xs font-medium">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tip: ${job.tip}
            </div>
          )}
        </div>

        {getNextAction()}
      </div>
    </div>
  );
}
