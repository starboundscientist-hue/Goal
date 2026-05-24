import type { Progress, FocusItem } from './types';
import { computeClusterProgress, daysSince, getLastWorkedDate } from './utils';

export function computeFocusQueue(progress: Progress): FocusItem[] {
  const items: FocusItem[] = [];
  const clusters = progress.clusters;

  for (const [_id, cluster] of Object.entries(clusters)) {
    if (cluster.checklist.study && cluster.checklist.experiment && !cluster.checklist.artifact) {
      items.push({
        type: 'suggestion',
        cluster: cluster.id,
        reason: 'Ship the artifact',
        detail: 'Experiment done but no public artifact yet. Publish the repo or blog post.',
        priority: 1
      });
    }
  }

  const foundationsProgress = computeClusterProgress(clusters.foundations);
  const alphaProgress = computeClusterProgress(clusters.alpha);
  if (foundationsProgress < 50 && alphaProgress > 60) {
    items.push({
      type: 'warning',
      cluster: 'foundations',
      reason: 'Foundations gate: below 50%',
      detail: 'You are doing advanced AI work without solidifying the math foundation. Bring Foundations above 50% first.',
      priority: 2
    });
  }

  for (const [_id, cluster] of Object.entries(clusters)) {
    const prog = computeClusterProgress(cluster);
    if (prog > 0 && prog < 100) {
      const last = getLastWorkedDate(_id, progress.logs);
      if (last) {
        const dd = daysSince(last);
        if (dd > 10) {
          items.push({
            type: 'suggestion',
            cluster: cluster.id,
            reason: `${dd}d stale`,
            detail: `Log at least one session this week to prevent decay.`,
            priority: 3
          });
        }
      }
    }
  }

  for (const [_id, cluster] of Object.entries(clusters)) {
    const inProgress = cluster.projects.filter(p => p.status === 'in_progress');
    for (const project of inProgress) {
      items.push({
        type: 'suggestion',
        cluster: cluster.id,
        reason: `Continue: ${project.label.slice(0, 50)}`,
        detail: 'Project in progress — close it before starting the next one.',
        priority: 4
      });
    }
  }

  const phase1Clusters = Object.values(clusters).filter(c => c.phase === 1);
  const phase1Avg = phase1Clusters.length > 0
    ? phase1Clusters.reduce((sum, c) => sum + computeClusterProgress(c), 0) / phase1Clusters.length
    : 0;
  if (phase1Avg < 60) {
    const lowestCluster = phase1Clusters.sort((a, b) =>
      computeClusterProgress(a) - computeClusterProgress(b)
    )[0];
    items.push({
      type: 'unlock',
      cluster: lowestCluster?.id,
      reason: `Phase 2 locked — Phase 1 avg: ${Math.round(phase1Avg)}%`,
      detail: `${lowestCluster?.name} is the weakest Phase 1 cluster. Bring it up to unblock Phase 2.`,
      priority: 5
    });
  }

  const seen = new Set<string>();
  return items
    .sort((a, b) => a.priority - b.priority)
    .filter(item => {
      if (!item.cluster) return true;
      if (seen.has(item.cluster)) return false;
      seen.add(item.cluster);
      return true;
    })
    .slice(0, 5);
}
