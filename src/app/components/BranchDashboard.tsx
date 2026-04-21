import { SummaryCard } from './SummaryCard';
import { JobCard, Job, JobStatus } from './JobCard';

interface BranchDashboardProps {
  jobs: Job[];
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

function toDateOnly(value?: string): Date | null {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const mmddyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, m, d, y] = mmddyyyy;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function BranchDashboard({ jobs, onStatusChange }: BranchDashboardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeJobs = jobs
    .filter((j) => j.status !== 'completed' && j.status !== 'cancelled')
    .filter((j) => {
      const d = toDateOnly(j.slotDate);
      return d ? d >= today : true;
    });
  const jobsByDate = activeJobs.reduce<Record<string, Job[]>>((acc, job) => {
    const key = String(job.slotDate || '').trim() || 'Scheduled';
    if (!acc[key]) acc[key] = [];
    acc[key].push(job);
    return acc;
  }, {});
  const orderedDateKeys = Object.keys(jobsByDate).sort((a, b) => {
    const da = toDateOnly(a);
    const db = toDateOnly(b);
    if (da && db) return da.getTime() - db.getTime();
    if (da) return -1;
    if (db) return 1;
    return a.localeCompare(b);
  });
  const todayJobsCount = activeJobs.filter((j) => {
    const d = toDateOnly(j.slotDate);
    return d ? d.getTime() === today.getTime() : false;
  }).length;
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const totalTips = jobs
    .filter((j) => j.status === 'completed')
    .reduce((sum, j) => sum + (j.tip || 0), 0);

  return (
    <div className="pb-6">
      <div className="p-4 space-y-4">
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
            value={todayJobsCount}
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
                        role="branch"
                        onStatusChange={onStatusChange}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p>No active jobs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
