import { useNavigate } from 'react-router-dom';
import type { ClusterState, LogEntry } from '../../lib/types';
import { CLUSTER_COLORS } from '../../lib/types';
import { computeClusterProgress, clusterStatus, relativeTime, getLastWorkedDate } from '../../lib/utils';

interface Props {
  cluster: ClusterState;
  logs: LogEntry[];
}

export function ClusterCard({ cluster, logs }: Props) {
  const navigate = useNavigate();
  const progress = computeClusterProgress(cluster);
  const status = clusterStatus(cluster, logs);
  const lastWorked = getLastWorkedDate(cluster.id, logs);
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      onClick={() => navigate(`/cluster/${cluster.id}`)}
      className="relative flex items-start gap-4 p-4 rounded-xl bg-surface-card/90 backdrop-blur-xl border border-surface-border/60 hover:border-surface-border hover:bg-surface-card/80 transition-all cursor-pointer group"
      style={{ '--status-color': CLUSTER_COLORS[cluster.id] } as React.CSSProperties}
    >
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: CLUSTER_COLORS[cluster.id] }}
      />

      <div className="relative w-12 h-12 flex-shrink-0">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="var(--surface-border)" strokeWidth="4" />
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke={CLUSTER_COLORS[cluster.id]}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            transform="rotate(-90 24 24)"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
          {progress}%
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">{cluster.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status.color === 'text-emerald-400' ? 'bg-emerald-500/10 text-emerald-400' : status.color === 'text-amber-400' ? 'bg-amber-500/10 text-amber-400' : status.color === 'text-orange-400' ? 'bg-orange-500/10 text-orange-400' : 'bg-surface-muted/80 text-muted-foreground'}`}>
            {status.label}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {lastWorked ? relativeTime(lastWorked) : '\u2014'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {(['study', 'experiment', 'artifact'] as const).map((field) => (
            <span
              key={field}
              className={`w-2 h-2 rounded-full transition-colors ${cluster.checklist[field] ? 'bg-emerald-400/80' : 'bg-surface-muted/80'}`}
              title={field.charAt(0).toUpperCase() + field.slice(1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
