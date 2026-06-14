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

  if (!progress) return <div className="text-muted-foreground/50">Loading...</div>;

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
        <h1 className="text-lg font-semibold text-foreground/90">Weekly Review</h1>
            <span className="text-xs text-muted-foreground/50">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium mb-3">Suggested Focus</h2>
      <div className="space-y-2 mb-8">
        {focusQueue.map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-3 border-l-2 bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 transition-all hover:bg-surface-card/90"
            style={{
              borderLeftColor:
                item.type === 'warning' ? '#fbbf24' :
                item.type === 'unlock' ? '#60a5fa' :
                item.cluster ? CLUSTER_COLORS[item.cluster] : '#52525b'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/40 text-xs font-mono">{i + 1}</span>
              {item.cluster && (
                <span className="w-2 h-2 rounded-full opacity-70" style={{ backgroundColor: CLUSTER_COLORS[item.cluster] }} />
              )}
              <span className="text-sm text-foreground/80 font-medium">{item.reason}</span>
            </div>
            {item.detail && (
              <p className="text-xs text-muted-foreground/50 mt-1 ml-6">{item.detail}</p>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium mb-3">Systems Coach</h2>
      <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          {progress.meta.last_coach_run && (
        <span className="text-xs text-muted-foreground/50">
              Last run: {new Date(progress.meta.last_coach_run).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={runCoach}
            disabled={coachRunning}
            className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors ml-auto"
          >
            {coachRunning ? 'Running...' : 'Run Coach'}
          </button>
        </div>

        {progress.meta.last_coach_output ? (
          <CoachOutput key={progress.meta.last_coach_run || 'coach'} text={progress.meta.last_coach_output} />
        ) : (
          <p className="text-sm text-muted-foreground/50">Click "Run Coach" to get a weekly diagnosis.</p>
        )}
      </div>

      <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium mb-3">Stats</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-4">
          <div className="text-xs text-muted-foreground/50 mb-1">This week</div>
          <div className="text-lg font-semibold text-foreground/90">{weeklyHours}h</div>
        </div>
        <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-4">
          <div className="text-xs text-muted-foreground/50 mb-1">4-week avg</div>
          <div className="text-lg font-semibold text-foreground/90">{avgHours}h</div>
        </div>
        <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-4">
          <div className="text-xs text-muted-foreground/50 mb-1">Target</div>
          <div className="text-lg font-semibold text-foreground/90">{progress.meta.weekly_goal_hours}h</div>
        </div>
      </div>
    </div>
  );
}
