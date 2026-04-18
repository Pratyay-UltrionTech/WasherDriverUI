import { SummaryCard } from './SummaryCard';
import { JobCard, Job, JobStatus } from './JobCard';

interface BranchDashboardProps {
  jobs: Job[];
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export function BranchDashboard({ jobs, onStatusChange }: BranchDashboardProps) {
  const todayJobs = jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled');
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
            value={todayJobs.length}
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
          <h2 className="mb-3">Today's Jobs</h2>
          <div className="space-y-3">
            {todayJobs.length > 0 ? (
              todayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  role="branch"
                  onStatusChange={onStatusChange}
                />
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
