import { SummaryCard } from './SummaryCard';
import { JobCard, Job, JobStatus } from './JobCard';

interface MobileDashboardProps {
  jobs: Job[];
  availableJobs: Job[];
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onAcceptJob: (jobId: string) => void;
  onNavigate: (address: string, coordinates?: { lat: number; lng: number }) => void;
}

export function MobileDashboard({
  jobs,
  availableJobs,
  onStatusChange,
  onAcceptJob,
  onNavigate,
}: MobileDashboardProps) {
  const activeJobs = jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const totalTips = jobs
    .filter((j) => j.status === 'completed')
    .reduce((sum, j) => sum + (j.tip || 0), 0);

  const jobsByDate = activeJobs.reduce<Record<string, Job[]>>((acc, job) => {
    const dateKey = String(job.slotDate || '').trim() || 'Scheduled';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(job);
    return acc;
  }, {});
  const orderedDateKeys = Object.keys(jobsByDate).sort((a, b) => a.localeCompare(b));

  return (
    <div className="pb-6">
      <div className="p-4 space-y-4">
        {availableJobs.length > 0 && (
          <div>
            <h2 className="mb-3">Available Jobs</h2>
            <div className="space-y-3 mb-4">
              {availableJobs.length > 0 ? (
                availableJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    role="mobile"
                    onAccept={onAcceptJob}
                    isAvailable
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
                  No jobs found for selected pin code.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            label="Jobs Today"
            value={activeJobs.length}
          />
          <SummaryCard
            icon={
              <svg
                className="w-5 h-5"
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
            }
            label="Completed"
            value={completedJobs.length}
          />
          <SummaryCard
            icon={
              <svg
                className="w-5 h-5"
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
            }
            label="Tips"
            value={`$${totalTips}`}
          />
        </div>

        <div>
          <h2 className="mb-3">Today's + Upcoming Jobs</h2>
          <div className="space-y-3">
            {orderedDateKeys.length > 0 ? (
              orderedDateKeys.map((dateKey) => (
                <div key={dateKey} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">{dateKey}</p>
                  <div className="space-y-3">
                    {jobsByDate[dateKey].map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        role="mobile"
                        onStatusChange={onStatusChange}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p>No active jobs</p>
                <p className="text-sm mt-1">Accept jobs from the list when they appear</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
