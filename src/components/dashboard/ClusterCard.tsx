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
      className="relative flex items-start gap-4 p-4 rounded-lg bg-surface-card border border-surface-border hover:bg-surface-hover transition-colors cursor-pointer"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg"
        style={{ backgroundColor: CLUSTER_COLORS[cluster.id] }}
      />

      <div className="relative w-12 h-12 flex-shrink-0">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#27272a" strokeWidth="4" />
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke={CLUSTER_COLORS[cluster.id]}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            transform="rotate(-90 24 24)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-zinc-100">
          {progress}%
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-zinc-100">{cluster.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs ${status.color === 'text-emerald-400' ? 'bg-emerald-950 text-emerald-400' : status.color === 'text-amber-400' ? 'bg-amber-950 text-amber-400' : status.color === 'text-orange-400' ? 'bg-orange-950 text-orange-400' : 'bg-zinc-900 text-zinc-500'}`}>
            {status.label}
          </span>
          <span className="text-xs text-zinc-500">
            {lastWorked ? relativeTime(lastWorked) : '\u2014'}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          {(['study', 'experiment', 'artifact'] as const).map((field) => (
            <span
              key={field}
              className={`w-2 h-2 rounded-full ${cluster.checklist[field] ? 'bg-emerald-400' : 'bg-zinc-700'}`}
              title={field.charAt(0).toUpperCase() + field.slice(1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
