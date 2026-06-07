import type { Progress } from '../../lib/types';
import { computePhaseProgress, computeProjectedCompletion, computeWeeklyAvgHours } from '../../lib/utils';

interface Props {
  progress: Progress;
}

export function PaceBar({ progress }: Props) {
  const phase = 1;
  const phaseProgress = computePhaseProgress(progress.clusters, phase);
  const weeklyAvg = computeWeeklyAvgHours(progress.logs);
  const goal = progress.meta.weekly_goal_hours;
  const projection = computeProjectedCompletion(
    progress.meta.start_date,
    progress.meta.target_years,
    computePhaseProgress(progress.clusters, 1),
    weeklyAvg,
    goal
  );

  return (
    <div className="mb-6 bg-surface-card/40 backdrop-blur-xl border border-surface-border/40 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground/70">Phase {phase}: Foundation</span>
        <span className="text-sm text-foreground font-medium">{phaseProgress}%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${phaseProgress}%`, backgroundColor: '#60a5fa' }}
        />
      </div>
      <div className="mt-2 text-sm text-muted-foreground/60">
        At current pace, Phase {phase} closes {projection.label}
        {' \u00b7 '}{weeklyAvg}h/week avg
        {' \u00b7 '}Target: {goal}h
        {projection.onTrack
          ? <span className="text-emerald-400/80">{' \u00b7 '}ON TRACK</span>
          : <span className="text-amber-400/80">{' \u00b7 '}BEHIND</span>
        }
      </div>
    </div>
  );
}
