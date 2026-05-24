import { useState } from 'react';
import { useStore } from '../lib/store';
import { CoachOutput } from '../components/coach/CoachOutput';
import { computeFocusQueue } from '../lib/rules';
import { buildCoachContext, computeWeeklyAvgHours } from '../lib/utils';
import { CLUSTER_COLORS } from '../lib/types';
import * as api from '../lib/api';

export function WeeklyPage() {
  const { progress, setProgress } = useStore();
  const [coachRunning, setCoachRunning] = useState(false);

  if (!progress) return <div className="text-zinc-500">Loading...</div>;

  const focusQueue = computeFocusQueue(progress);
  const weeklyHours = progress.logs
    .filter(l => {
      const d = new Date(l.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && l.cluster !== 'work';
    })
    .reduce((sum, l) => sum + l.hours, 0);
  const avgHours = computeWeeklyAvgHours(progress.logs);

  const runCoach = async () => {
    setCoachRunning(true);
    try {
      const logsText = buildCoachContext(progress);
      const result = await api.runCoach(logsText);
      const updated = {
        ...progress,
        meta: {
          ...progress.meta,
          last_coach_run: new Date().toISOString(),
          last_coach_output: result
        }
      };
      setProgress(updated);
      await api.saveProgress(updated);
    } catch {
      // silent
    }
    setCoachRunning(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-100">Weekly Review</h1>
        <span className="text-xs text-zinc-600">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">Suggested Focus</h2>
      <div className="space-y-2 mb-8">
        {focusQueue.map((item, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 border-l-2 ${
              item.type === 'warning' ? 'border-l-amber-400' :
              item.type === 'unlock' ? 'border-l-blue-400' :
              'border-l-' + (item.cluster ? CLUSTER_COLORS[item.cluster] : 'zinc-500')
            } bg-surface-card border border-surface-border`}
          >
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-mono">{i + 1}</span>
              {item.cluster && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[item.cluster] }} />
              )}
              <span className="text-sm text-zinc-100 font-medium">{item.reason}</span>
            </div>
            {item.detail && (
              <p className="text-xs text-zinc-500 mt-1 ml-6">{item.detail}</p>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">Systems Coach</h2>
      <div className="bg-surface-card border border-surface-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          {progress.meta.last_coach_run && (
            <span className="text-xs text-zinc-600">
              Last run: {new Date(progress.meta.last_coach_run).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={runCoach}
            disabled={coachRunning}
            className="text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1.5 rounded-md ml-auto"
          >
            {coachRunning ? 'Running...' : 'Run Coach'}
          </button>
        </div>

        {progress.meta.last_coach_output ? (
          <CoachOutput key={progress.meta.last_coach_run || 'coach'} text={progress.meta.last_coach_output} />
        ) : (
          <p className="text-sm text-zinc-500">Click "Run Coach" to get a weekly diagnosis.</p>
        )}
      </div>

      <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">Stats</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-card border border-surface-border rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">This week</div>
          <div className="text-lg font-semibold text-zinc-100">{weeklyHours}h</div>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">4-week avg</div>
          <div className="text-lg font-semibold text-zinc-100">{avgHours}h</div>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-1">Target</div>
          <div className="text-lg font-semibold text-zinc-100">{progress.meta.weekly_goal_hours}h</div>
        </div>
      </div>
    </div>
  );
}
