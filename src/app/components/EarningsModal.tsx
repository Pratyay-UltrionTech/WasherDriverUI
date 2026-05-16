import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Job } from './JobCard';

interface EarningsModalProps {
  open: boolean;
  onClose: () => void;
  jobs: Job[];
}

export function EarningsModal({ open, onClose, jobs }: EarningsModalProps) {
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const totalService = completedJobs.reduce((sum, j) => sum + (j.serviceTotal ?? 0), 0);
  const totalTips = completedJobs.reduce((sum, j) => sum + (j.tip || 0), 0);
  const grandTotal = totalService + totalTips;

  const fmt = (n: number) => n.toFixed(2);

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
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Total Earnings</DialogTitle>
          <DialogDescription className="sr-only">
            Breakdown of completed job payments and tips.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="bg-card rounded-xl p-5 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Tips</p>
              <p className="text-3xl font-semibold text-success">${fmt(totalTips)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                from {completedJobs.filter((j) => (j.tip || 0) > 0).length} jobs
              </p>
            </div>

            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-primary">${fmt(grandTotal)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                From {completedJobs.length} completed job{completedJobs.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">All Transactions</h4>
              <span className="text-xs text-muted-foreground">{completedJobs.length} entries</span>
            </div>

            {completedJobs.length > 0 ? (
              <div className="space-y-2">
                {completedJobs.map((job, index) => {
                  const tip = job.tip || 0;
                  const service = job.serviceTotal ?? 0;
                  const jobTotal = service + tip;
                  return (
                    <div
                      key={job.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-primary font-medium">Txn #{index + 1}</p>
                        <p className="font-medium truncate">{job.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          #{job.id} · Service ${fmt(service)}{tip > 0 ? ` + Tip $${fmt(tip)}` : ''}
                        </p>
                      </div>
                      <p className="font-semibold text-primary shrink-0">${fmt(jobTotal)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No completed transactions yet.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
