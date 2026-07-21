import { useEffect, useState } from 'react';
import { loadSprints, saveSprints } from '../lib/api';
import { generateId } from '../lib/utils';
import { CLUSTER_LABELS } from '../lib/types';
import type { Sprint, SprintGoal, SprintGoalStatus, SprintData } from '../lib/types';

const LANE_COLORS: Record<string, string> = {
  main: '#60a5fa',
  dsa: '#94a3b8',
  opensource: '#fb7185',
  automation: '#fbbf24',
  papers: '#a78bfa',
};

const LANE_LABELS: Record<string, string> = {
  main: 'Main',
  dsa: 'DSA',
  opensource: 'Open Source',
  automation: 'Automation',
  papers: 'Papers',
};

const STATUS_CYCLE: SprintGoalStatus[] = ['not_started', 'in_progress', 'done'];

function cycleStatus(current: SprintGoalStatus): SprintGoalStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

const STATUS_META: Record<SprintGoalStatus, { icon: string; className: string }> = {
  not_started: { icon: '\u25cb', className: 'text-muted-foreground/40 hover:text-muted-foreground/60' },
  in_progress: { icon: '\u25cf', className: 'text-blue-400/80 hover:text-blue-400' },
  done: { icon: '\u2713', className: 'text-emerald-400/80 hover:text-emerald-400' },
};

function countDone(goals: SprintGoal[]): number {
  return goals.filter(g => g.status === 'done').length;
}

function GoalRow({
  goal,
  onToggle,
  extraButtons,
}: {
  goal: SprintGoal;
  onToggle: () => void;
  extraButtons?: React.ReactNode;
}) {
  const sm = STATUS_META[goal.status];
  const laneColor = LANE_COLORS[goal.lane] || '#71717a';
  const laneLabel = LANE_LABELS[goal.lane] || goal.lane;
  const clusterLabel = goal.source ? CLUSTER_LABELS[goal.source.clusterId as keyof typeof CLUSTER_LABELS] || goal.source.clusterId : null;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-card/40 hover:bg-surface-card/60 transition-colors group">
      <button onClick={onToggle} className={`text-sm cursor-pointer shrink-0 ${sm.className} transition-colors`} title="Cycle status">
        {sm.icon}
      </button>
      <span className={`flex-1 text-sm ${goal.status === 'done' ? 'line-through text-muted-foreground/50' : 'text-foreground/90'}`}>
        {goal.label}
      </span>
      {clusterLabel && (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-muted/40 text-muted-foreground/50 font-medium shrink-0">
          {clusterLabel}
        </span>
      )}
      <span
        className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
        style={{ backgroundColor: `${laneColor}20`, color: laneColor }}
      >
        {laneLabel}
      </span>
      {extraButtons && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {extraButtons}
        </div>
      )}
    </div>
  );
}

export function SprintsPage() {
  const [data, setData] = useState<SprintData | null>(null);
  const [dirty, setDirty] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newLane, setNewLane] = useState('main');
  const [backlogLabel, setBacklogLabel] = useState('');
  const [backlogLane, setBacklogLane] = useState('main');
  const [closeMode, setCloseMode] = useState<'idle' | 'confirming'>('idle');

  useEffect(() => {
    loadSprints().then(d => {
      if (d && !d.backlog) (d as SprintData).backlog = [];
      setData(d);
    });
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-64 text-zinc-500/60">Loading...</div>;
  }

  const current = data.sprints.find(s => !s.closed);
  const archived = data.sprints.filter(s => s.closed);

  const sync = (updated: SprintData) => {
    setData(updated);
    setDirty(true);
  };

  const persist = async () => {
    if (!dirty || !data) return;
    const ok = await saveSprints(data);
    if (ok) setDirty(false);
  };

  const toggleGoal = (sprintId: string, goalId: string) => {
    const updated: SprintData = {
      backlog: data.backlog,
      sprints: data.sprints.map(s => {
        if (s.id !== sprintId) return s;
        return {
          ...s,
          goals: s.goals.map(g => g.id === goalId ? { ...g, status: cycleStatus(g.status) } : g),
        };
      })
    };
    sync(updated);
  };

  const removeGoal = (sprintId: string, goalId: string) => {
    const updated: SprintData = {
      backlog: data.backlog,
      sprints: data.sprints.map(s => {
        if (s.id !== sprintId) return s;
        return { ...s, goals: s.goals.filter(g => g.id !== goalId) };
      })
    };
    sync(updated);
  };

  const pushToBacklog = (sprintId: string, goal: SprintGoal) => {
    const updated: SprintData = {
      backlog: [...data.backlog, { ...goal, status: 'not_started' }],
      sprints: data.sprints.map(s => {
        if (s.id !== sprintId) return s;
        return { ...s, goals: s.goals.filter(g => g.id !== goal.id) };
      })
    };
    sync(updated);
  };

  const pullToSprint = (goal: SprintGoal) => {
    if (!current) return;
    const updated: SprintData = {
      backlog: data.backlog.filter(g => g.id !== goal.id),
      sprints: data.sprints.map(s => {
        if (s.id !== current.id) return s;
        return { ...s, goals: [...s.goals, { ...goal, status: 'not_started' }] };
      })
    };
    sync(updated);
  };

  const removeBacklogGoal = (goalId: string) => {
    sync({ backlog: data.backlog.filter(g => g.id !== goalId), sprints: data.sprints });
  };

  const addBacklogGoal = () => {
    if (!backlogLabel.trim()) return;
    const goal: SprintGoal = {
      id: generateId(),
      label: backlogLabel.trim(),
      lane: backlogLane,
      status: 'not_started',
    };
    sync({
      backlog: [...data.backlog, goal],
      sprints: data.sprints,
    });
    setBacklogLabel('');
    setBacklogLane('main');
  };

  const addGoal = () => {
    if (!newLabel.trim() || !current) return;
    const goal: SprintGoal = {
      id: generateId(),
      label: newLabel.trim(),
      lane: newLane,
      status: 'not_started',
    };
    const updated: SprintData = {
      backlog: data.backlog,
      sprints: data.sprints.map(s =>
        s.id === current.id ? { ...s, goals: [...s.goals, goal] } : s
      )
    };
    sync(updated);
    setNewLabel('');
    setNewLane('main');
  };

  const closeSprint = async (carryOver: boolean) => {
    if (!current) return;

    const unfinished = current.goals.filter(g => g.status !== 'done').map(g => ({ ...g, status: 'not_started' as const }));
    const nextNum = data.sprints.length + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + 13);

    const nextSprint: Sprint = {
      id: `sprint_${nextNum}`,
      name: `Sprint ${nextNum}`,
      startDate: todayStr,
      endDate: end.toISOString().split('T')[0],
      goals: carryOver ? unfinished : [],
      closed: false,
    };

    const updated: SprintData = {
      backlog: carryOver ? data.backlog : [...data.backlog, ...unfinished],
      sprints: [
        ...data.sprints.map(s => s.id === current.id ? { ...s, closed: true } : s),
        nextSprint,
      ]
    };
    const ok = await saveSprints(updated);
    if (ok) {
      setData(updated);
      setDirty(false);
    }
    setCloseMode('idle');
  };

  const progressPct = current && current.goals.length > 0
    ? Math.round((countDone(current.goals) / current.goals.length) * 100)
    : 0;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-foreground/90">Sprints</h1>
        {dirty && (
          <button
            onClick={persist}
            className="text-xs px-3 py-1 rounded-md bg-blue-500/20 text-blue-400/90 hover:bg-blue-500/30 transition-colors"
          >
            Save
          </button>
        )}
      </div>

      {/* Backlog */}
      <div className="mb-4 bg-surface-card/60 backdrop-blur-xl border border-dashed border-surface-border/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium">
            Backlog
            <span className="ml-2 text-[10px] text-muted-foreground/30 font-normal normal-case">
              ({data.backlog.length})
            </span>
          </h2>
        </div>

        {data.backlog.length > 0 && (
          <div className="space-y-1 mb-3">
            {data.backlog.map(g => (
              <GoalRow
                key={g.id}
                goal={g}
                onToggle={() => {
                  const updated: SprintData = {
                    backlog: data.backlog.map(bg => bg.id === g.id ? { ...bg, status: cycleStatus(bg.status) } : bg),
                    sprints: data.sprints,
                  };
                  sync(updated);
                }}
                extraButtons={
                  <>
                    {current && (
                      <button
                        onClick={() => pullToSprint(g)}
                        className="text-xs text-blue-400/60 hover:text-blue-400 transition-colors"
                        title="Pull into current sprint"
                      >
                        {'\u2192'}
                      </button>
                    )}
                    <button
                      onClick={() => removeBacklogGoal(g.id)}
                      className="text-xs text-muted-foreground/30 hover:text-red-400/70 transition-colors"
                    >
                      {'\u2715'}
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-muted/30 border border-surface-border/20 rounded-lg px-3 py-1.5 focus-within:border-blue-500/50 transition-colors">
            <span className="text-muted-foreground/30 hover:text-foreground/50 text-xs transition-colors">+</span>
              <input
                className="flex-1 bg-transparent text-sm text-foreground/90 outline-none placeholder:text-muted-foreground/30"
                placeholder={'Add to backlog\u2026'}
              value={backlogLabel}
              onChange={e => setBacklogLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addBacklogGoal(); }}
            />
            <select
              className="text-[10px] bg-surface-muted/60 border border-surface-border/30 rounded px-1.5 py-0.5 text-muted-foreground/70 outline-none"
              value={backlogLane}
              onChange={e => setBacklogLane(e.target.value)}
            >
              <option value="main">Main</option>
              <option value="dsa">DSA</option>
              <option value="opensource">Open Source</option>
              <option value="automation">Automation</option>
              <option value="papers">Papers</option>
            </select>
          </div>
          <button
            onClick={addBacklogGoal}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400/90 hover:bg-blue-500/30 transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      {/* Current Sprint */}
      {current && (
        <div className="mb-6 bg-surface-card/80 backdrop-blur-xl border border-surface-border/40 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium text-foreground/90">{current.name}</h2>
              <span className="text-[11px] text-muted-foreground/50">
                {current.startDate}{'\u2013'}{current.endDate}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-foreground/80">{progressPct}%</span>
              <div className="text-[10px] text-muted-foreground/40">{countDone(current.goals)}/{current.goals.length} goals</div>
            </div>
          </div>

          <div className="w-full h-1.5 bg-surface-muted/60 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: '#60a5fa' }}
            />
          </div>

          {progressPct === 100 && current.goals.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-3">
              <div className="text-xs text-emerald-400/90">
                All goals done! You can close this sprint and start the next one.
              </div>
            </div>
          )}

          {current.goals.length === 0 && (
            <div className="text-xs text-muted-foreground/50 text-center py-4">
              Pull goals from the backlog above, or add them directly.
            </div>
          )}

          <div className="space-y-1">
            {current.goals.map(g => (
              <GoalRow
                key={g.id}
                goal={g}
                onToggle={() => toggleGoal(current.id, g.id)}
                extraButtons={
                  <>
                    <button
                      onClick={() => pushToBacklog(current.id, g)}
                      className="text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                      title="Push to backlog"
                    >
                      {'\u2190'}
                    </button>
                    <button
                      onClick={() => removeGoal(current.id, g.id)}
                      className="text-xs text-muted-foreground/30 hover:text-red-400/70 transition-colors"
                      title="Remove permanently"
                    >
                      {'\u2715'}
                    </button>
                  </>
                }
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 flex items-center gap-2 bg-surface-muted/40 border border-surface-border/30 rounded-lg px-3 py-1.5 focus-within:border-blue-500/50 transition-colors">
              <span className="text-muted-foreground/30 hover:text-foreground/50 text-xs transition-colors">+</span>
              <input
                className="flex-1 bg-transparent text-sm text-foreground/90 outline-none placeholder:text-muted-foreground/30"
                placeholder={'Add a goal\u2026'}
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addGoal(); }}
              />
              <select
                className="text-[10px] bg-surface-muted/60 border border-surface-border/30 rounded px-1.5 py-0.5 text-muted-foreground/70 outline-none"
                value={newLane}
                onChange={e => setNewLane(e.target.value)}
              >
                <option value="main">Main</option>
                <option value="dsa">DSA</option>
                <option value="opensource">Open Source</option>
                <option value="automation">Automation</option>
                <option value="papers">Papers</option>
              </select>
            </div>
            <button
              onClick={addGoal}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400/90 hover:bg-blue-500/30 transition-colors shrink-0"
            >
              Add
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-border/20 flex justify-end gap-2">
            {closeMode === 'idle' ? (
              <button
                onClick={() => setCloseMode('confirming')}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-muted/50 text-muted-foreground/60 hover:text-foreground/80 hover:bg-surface-muted/80 transition-colors"
              >
                Close sprint & start next
              </button>
            ) : (
              <>
                <button
                  onClick={() => closeSprint(false)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  Unfinished → backlog
                </button>
                <button
                  onClick={() => closeSprint(true)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  Unfinished → next sprint
                </button>
                <button
                  onClick={() => setCloseMode('idle')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-surface-muted/50 text-muted-foreground/60 hover:text-foreground/80 hover:bg-surface-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground/40 font-medium mb-2">
            Past sprints
          </h3>
          <div className="space-y-1.5">
            {archived.slice().reverse().map(s => (
              <div
                key={s.id}
                className="px-3 py-2 rounded-lg bg-surface-card/40 border border-surface-border/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground/70">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground/40">{s.startDate}{'\u2013'}{s.endDate}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50">
                    {countDone(s.goals)}/{s.goals.length}
                  </span>
                </div>
                {s.goals.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.goals.slice(0, 5).map(g => (
                      <span
                        key={g.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${g.status === 'done' ? 'bg-emerald-500/15 text-emerald-400/70' : 'bg-surface-muted/40 text-muted-foreground/50'}`}
                      >
                        {g.status === 'done' ? '\u2713 ' : '\u25cb '}{g.label}
                      </span>
                    ))}
                    {s.goals.length > 5 && (
                      <span className="text-[10px] text-muted-foreground/30">+{s.goals.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
