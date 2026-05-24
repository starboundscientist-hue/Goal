import type { ClusterId, ClusterState, LogEntry, Progress, ParsedLogEntry } from './types';

export function computeClusterProgress(cluster: ClusterState): number {
  const topicsTotal = cluster.topics.length;
  const resourcesTotal = cluster.resources.length;
  const projectsTotal = cluster.projects.length;
  const total = topicsTotal + resourcesTotal + projectsTotal;
  if (total === 0) return 0;

  const topicsDone = cluster.topics.filter(t => t.done).length;
  const resourcesDone = cluster.resources.filter(r => r.done).length;
  const projectsDone = cluster.projects.filter(p => p.status === 'done').length;
  const done = topicsDone + resourcesDone + projectsDone;

  const basePercent = (done / total) * 100;

  const checklistBonus =
    (cluster.checklist.study ? 10 : 0) +
    (cluster.checklist.experiment ? 10 : 0) +
    (cluster.checklist.artifact ? 10 : 0);

  return Math.min(100, Math.round(basePercent * 0.7 + checklistBonus));
}

export function computePhaseProgress(
  clusters: Record<string, ClusterState>,
  phase: number
): number {
  const phaseClusters = Object.values(clusters).filter(c => c.phase === phase);
  if (phaseClusters.length === 0) return 0;
  const avg = phaseClusters.reduce((sum, c) => sum + computeClusterProgress(c), 0) / phaseClusters.length;
  return Math.round(avg);
}

export function getLastWorkedDate(clusterId: string, logs: LogEntry[]): Date | null {
  const clusterLogs = logs.filter(l => l.cluster === clusterId);
  if (clusterLogs.length === 0) return null;
  const sorted = [...clusterLogs].sort((a, b) => b.date.localeCompare(a.date));
  return new Date(sorted[0].date);
}

export function relativeTime(date: Date | null): string {
  if (!date) return '—';
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function daysSince(date: Date | null): number {
  if (!date) return 9999;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeWeeklyAvgHours(logs: LogEntry[], weeks = 4): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const recent = logs.filter(l => new Date(l.date) >= cutoff && l.cluster !== 'work');
  const total = recent.reduce((sum, l) => sum + l.hours, 0);
  return Math.round((total / weeks) * 10) / 10;
}

export function computeProjectedCompletion(
  startDate: string,
  targetYears: number,
  currentProgress: number,
  weeklyAvgHours: number,
  weeklyGoalHours: number
): { label: string; onTrack: boolean } {
  if (weeklyAvgHours === 0) return { label: 'No data yet', onTrack: false };
  if (weeklyGoalHours === 0) return { label: 'No goal set', onTrack: false };

  const targetDate = new Date(startDate);
  targetDate.setFullYear(targetDate.getFullYear() + targetYears);

  const progressRatio = weeklyAvgHours / weeklyGoalHours;
  const onTrack = progressRatio >= 0.85;

  const weeksRemaining = ((100 - currentProgress) / 100) * (targetYears * 52);
  const adjustedWeeks = weeksRemaining / progressRatio;
  const projected = new Date();
  projected.setDate(projected.getDate() + adjustedWeeks * 7);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const label = `${monthNames[projected.getMonth()]} ${projected.getFullYear()}`;

  return { label, onTrack };
}

export function buildHeatmapData(logs: LogEntry[]): Array<{
  date: string;
  clusterId: string | null;
  hours: number;
}> {
  const today = new Date();
  const cells: Array<{ date: string; clusterId: string | null; hours: number }> = [];

  const dateMap = new Map<string, { hours: Record<string, number>; total: number }>();
  for (const log of logs) {
    if (!dateMap.has(log.date)) dateMap.set(log.date, { hours: {}, total: 0 });
    const entry = dateMap.get(log.date)!;
    entry.hours[log.cluster] = (entry.hours[log.cluster] || 0) + log.hours;
    entry.total += log.hours;
  }

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const entry = dateMap.get(key);
    if (!entry) {
      cells.push({ date: key, clusterId: null, hours: 0 });
    } else {
      const dominant = Object.entries(entry.hours).sort((a, b) => b[1] - a[1])[0];
      cells.push({ date: key, clusterId: dominant[0], hours: entry.total });
    }
  }

  return cells;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${h}h`;
}

export function clusterStatus(
  cluster: ClusterState,
  logs: LogEntry[]
): { label: string; color: string } {
  const progress = computeClusterProgress(cluster);
  if (progress === 100) return { label: 'Closed', color: 'text-zinc-500' };

  const last = getLastWorkedDate(cluster.id, logs);
  if (!last) return { label: 'Not started', color: 'text-zinc-600' };

  const days = daysSince(last);
  if (days > 14) return { label: 'Stale', color: 'text-amber-400' };
  if (days > 7) return { label: 'Slow', color: 'text-orange-400' };
  return { label: 'Active', color: 'text-emerald-400' };
}

export function parseLLMResponse(rawText: string, fallback: ParsedLogEntry | null): ParsedLogEntry | null {
  try {
    let text = rawText.trim();
    const block = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (block?.[1]) text = block[1].trim();
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) text = text.slice(first, last + 1);
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return {
        cluster_id: parsed.cluster_id || 'unknown',
        topic_guess: parsed.topic_guess || 'Study session',
        hours: typeof parsed.hours === 'number' ? parsed.hours : 1.0,
        is_completed: Boolean(parsed.is_completed)
      };
    }
  } catch { /* fall through */ }
  return fallback;
}

export function buildCoachContext(progress: Progress): string {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = progress.logs
    .filter(l => new Date(l.date) >= sevenDaysAgo && l.cluster !== 'work')
    .sort((a, b) => a.date.localeCompare(b.date));

  const logLines = recentLogs.map(l =>
    `${l.date} | ${l.cluster} | ${l.topic} | ${l.hours}h | ${l.is_completed ? 'done' : 'in-progress'}`
  ).join('\n');

  const clusterSummary = Object.entries(progress.clusters).map(([_id, c]) => {
    const prog = computeClusterProgress(c);
    return `${c.id}: ${prog}% (study:${c.checklist.study}, experiment:${c.checklist.experiment}, artifact:${c.checklist.artifact})`;
  }).join('\n');

  const weeklyHours = recentLogs.reduce((sum, l) => sum + l.hours, 0);
  const avgHours = computeWeeklyAvgHours(progress.logs);

  return `
RECENT LOGS (last 7 days):
${logLines || 'No sessions logged this week.'}

CLUSTER STATE:
${clusterSummary}

STATS:
- This week: ${weeklyHours}h
- 4-week avg: ${avgHours}h/week
- weekly goal: ${progress.meta.weekly_goal_hours}h/week
  `.trim();
}
