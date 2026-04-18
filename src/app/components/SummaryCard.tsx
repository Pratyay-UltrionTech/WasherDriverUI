interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

export function SummaryCard({ icon, label, value }: SummaryCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <div className="text-primary w-5 h-5">{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
