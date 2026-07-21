import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { CLUSTER_LABELS } from '../lib/types';
import * as api from '../lib/api';
import type { WorkTask, Subtask, ResourceWithCluster } from '../lib/types';

interface SubWithTask {
  subtask: Subtask;
  task: WorkTask;
}

export function SubtasksPage() {
  const { work, toggleSubtask } = useStore();
  const [allResources, setAllResources] = useState<ResourceWithCluster[]>([]);
  const [showDone, setShowDone] = useState(true);
  const [taskFilter, setTaskFilter] = useState<string>('all');

  useEffect(() => {
    api.loadAllResources().then(setAllResources);
  }, []);

  const tasks = work?.tasks ?? [];

  const allSubtasks: SubWithTask[] = useMemo(() => {
    const subs: SubWithTask[] = [];
    for (const task of tasks) {
      for (const sub of task.subtasks ?? []) {
        subs.push({ subtask: sub, task });
      }
    }
    return subs.sort((a, b) => {
      if (a.task.title !== b.task.title) return a.task.title.localeCompare(b.task.title);
      return a.subtask.order - b.subtask.order;
    });
  }, [tasks]);

  const filtered = useMemo(() => {
    return allSubtasks.filter(({ subtask, task }) => {
      if (taskFilter !== 'all' && task.id !== taskFilter) return false;
      if (!showDone && subtask.done) return false;
      return true;
    });
  }, [allSubtasks, taskFilter, showDone]);

  const unlinkedCount = allSubtasks.filter(({ subtask }) => !subtask.resourceIds || subtask.resourceIds.length === 0).length;
  const linkedCount = allSubtasks.length - unlinkedCount;

  if (!work) return <div className="text-muted-foreground/50 p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground/90">Subtasks</h1>
          <p className="text-xs text-muted-foreground/50 mt-0.5">
            {allSubtasks.length} total · {linkedCount} linked · {unlinkedCount} unlinked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={taskFilter}
            onChange={e => setTaskFilter(e.target.value)}
            className="text-[11px] bg-surface-muted/60 border border-surface-border/30 rounded px-2 py-1 text-muted-foreground/70 outline-none"
          >
            <option value="all">All tasks</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground/60 cursor-pointer">
            <input
              type="checkbox"
              checked={showDone}
              onChange={e => setShowDone(e.target.checked)}
              className="accent-blue-500"
            />
            Show done
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/40 text-sm">
          No subtasks match the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const groups: { taskId: string; taskTitle: string; items: typeof filtered }[] = [];
            const grouped = new Map<string, typeof filtered>();
            for (const item of filtered) {
              const key = item.task.id;
              if (!grouped.has(key)) grouped.set(key, []);
              grouped.get(key)!.push(item);
            }
            for (const [taskId, items] of grouped) {
              groups.push({ taskId, taskTitle: items[0].task.title, items });
            }
            return groups.map(group => (
              <div key={group.taskId}>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    to="/work"
                    className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {group.taskTitle}
                  </Link>
                  <span className="text-[10px] text-muted-foreground/30">{group.items.length}</span>
                </div>
                <div className="space-y-0.5">
                  {group.items.map(({ subtask, task }) => (
                    <div
                      key={subtask.id}
                      className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-card/30 hover:bg-surface-card/50 transition-colors"
                    >
                      <button
                        onClick={() => toggleSubtask(task.id, subtask.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          subtask.done
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-surface-border hover:border-blue-500/60'
                        }`}
                      >
                        {subtask.done && <span className="text-[9px]">{'\u2713'}</span>}
                      </button>

                      <span className={`flex-1 text-sm ${subtask.done ? 'line-through text-muted-foreground/50' : 'text-foreground/80'}`}>
                        {subtask.label}
                      </span>

                      {(() => {
                        const linked = allResources.filter(r => (subtask.resourceIds ?? []).includes(r.resource.id));
                        if (linked.length === 0) return null;
                        return (
                          <div className="flex items-center gap-1 shrink-0">
                            {linked.slice(0, 2).map(r => (
                              <span
                                key={r.resource.id}
                                className="text-[9px] px-1 py-0.5 rounded bg-surface-muted/40 text-muted-foreground/50 font-medium"
                                title={`${CLUSTER_LABELS[r.clusterId as keyof typeof CLUSTER_LABELS] || r.clusterId}: ${r.resource.label}`}
                              >
                                {r.resource.label.length > 10 ? r.resource.label.slice(0, 8) + '\u2026' : r.resource.label}
                              </span>
                            ))}
                            {linked.length > 2 && (
                              <span className="text-[9px] text-muted-foreground/30">+{linked.length - 2}</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
