import { useStore } from '../lib/store';
import { PaceBar } from '../components/dashboard/PaceBar';
import { NorthStarCard } from '../components/dashboard/NorthStarCard';
import { ClusterCard } from '../components/dashboard/ClusterCard';
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap';
import { GitPendingCard } from '../components/dashboard/GitPendingCard';
import { CLUSTER_LABELS } from '../lib/types';
import type { ClusterId } from '../lib/types';

export function DashboardPage() {
  const { progress, pendingGitEntries, confirmLogEntry, dismissPendingEntry } = useStore();

  if (!progress) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500/60">
        Loading...
      </div>
    );
  }

  const clusterIds = Object.keys(progress.clusters) as ClusterId[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground/90">Dashboard</h1>
        <span className="text-xs text-muted-foreground/50">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <NorthStarCard />

      <PaceBar progress={progress} />

      {pendingGitEntries.map(entry => (
        <GitPendingCard
          key={entry.id}
          entry={entry}
          onConfirm={(log) => confirmLogEntry(log)}
          onDismiss={() => dismissPendingEntry(entry.id)}
        />
      ))}

      <h2 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium mb-3">Clusters</h2>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        {clusterIds.map(id => (
          <ClusterCard key={id} cluster={progress.clusters[id]} logs={progress.logs} />
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium mt-8 mb-3">Activity</h2>
      <ActivityHeatmap logs={progress.logs} />
    </div>
  );
}
