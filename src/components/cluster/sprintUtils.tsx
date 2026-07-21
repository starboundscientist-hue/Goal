import type { SprintGoal, SprintGoalSource, SprintData } from '../../lib/types';

function matchesSource(goal: SprintGoal, source: SprintGoalSource): boolean {
  if (!goal.source) return false;
  return goal.source.clusterId === source.clusterId &&
    goal.source.topicId === source.topicId &&
    goal.source.subtopicId === source.subtopicId;
}

export function findMatchingSprintGoal(
  source: SprintGoalSource,
  sprintData: SprintData
): { goal: SprintGoal; sprintLabel: string } | null {
  for (const g of sprintData.backlog) {
    if (matchesSource(g, source)) return { goal: g, sprintLabel: 'Backlog' };
  }
  for (const sprint of sprintData.sprints.slice().reverse()) {
    for (const g of sprint.goals) {
      if (matchesSource(g, source)) {
        return { goal: g, sprintLabel: sprint.closed ? `${sprint.name} (closed)` : sprint.name };
      }
    }
  }
  return null;
}

export function SprintBadge({ goal, sprintLabel }: { goal: SprintGoal; sprintLabel: string }) {
  const isDone = goal.status === 'done';
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 whitespace-nowrap ${
        isDone ? 'bg-emerald-500/15 text-emerald-400/70' : 'bg-amber-500/15 text-amber-400/70'
      }`}
      title={`${sprintLabel} \u00b7 ${goal.status}`}
    >
      {goal.status === 'done' ? '\u2713 ' : '\u25cf '}
      {sprintLabel.length > 12 ? sprintLabel.slice(0, 10) + '\u2026' : sprintLabel}
    </span>
  );
}
