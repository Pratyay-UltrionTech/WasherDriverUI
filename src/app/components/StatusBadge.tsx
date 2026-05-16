type Status = 'scheduled' | 'assigned' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-muted text-muted-foreground',
  },
  assigned: {
    label: 'Assigned',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  arrived: {
    label: 'Arrived',
    className: 'bg-info/10 text-info border-info/20',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </div>
  );
}
