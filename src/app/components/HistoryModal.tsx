import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { StatusBadge } from './StatusBadge';
import { Job } from './JobCard';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  jobs: Job[];
  /** When true, customer address is omitted (e.g. branch washer). */
  hideCustomerAddress?: boolean;
}

export function HistoryModal({ open, onClose, jobs, hideCustomerAddress }: HistoryModalProps) {
  const completedJobs = jobs.filter((j) => j.status === 'completed' || j.status === 'cancelled');

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle>Job History</DialogTitle>
          <DialogDescription className="sr-only">
            List of completed and cancelled jobs with details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-xs text-muted-foreground">Total Jobs</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{completedJobs.length}</p>
          </div>

          {completedJobs.length > 0 ? (
            completedJobs.map((job, index) => (
              <div
                key={job.id}
                className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-medium">{job.customerName}</p>
                    <p className="text-xs text-muted-foreground">{'Booking ID - #' + job.id.replace(/-/g, '').slice(-6).toUpperCase()}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {job.slotDate
                        ? new Date(job.slotDate + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · '
                        : ''}
                      {job.timeSlot}
                    </span>
                  </div>

                  {!hideCustomerAddress && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <svg
                        className="w-4 h-4 shrink-0 mt-0.5"
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
                      </svg>
                      <span className="break-words">{job.address}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border space-y-1.5">
                    {/* Row 1: vehicle */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary/70 text-xs text-foreground/75">
                        {job.vehicleType}
                      </span>
                      {job.vehicleName ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary/70 text-xs text-foreground/75">
                          {job.vehicleName}
                        </span>
                      ) : null}
                      {job.registrationNumber ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary/70 text-xs text-foreground/75">
                          {job.registrationNumber}
                        </span>
                      ) : null}
                    </div>
                    {/* Row 2: service + addons (no duplicates) */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary/70 text-xs text-foreground/75">
                        {job.serviceType}
                      </span>
                      {(job.addons ?? []).filter(Boolean).filter((a) => !job.serviceType.toLowerCase().includes(a.toLowerCase())).map((addon) => (
                        <span key={addon} className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary/70 text-xs text-foreground/75">
                          {addon}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg
                className="w-12 h-12 mx-auto mb-3 opacity-40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No completed jobs yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
