type Status = 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

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
    className: 'bg-success/10 text-success border-success/20',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
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
