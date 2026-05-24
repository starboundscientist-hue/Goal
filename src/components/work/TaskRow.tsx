import type { WorkTask, TaskStatus } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  task: WorkTask;
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'wip', 'done', 'stuck', 'waiting'];

const STATUS_META: Record<TaskStatus, { icon: string; color: string }> = {
  todo:     { icon: '\u25cb', color: 'text-zinc-500' },
  wip:      { icon: '\u25cf', color: 'text-blue-400' },
  done:     { icon: '\u2713', color: 'text-emerald-400' },
  stuck:    { icon: '\u26a0', color: 'text-red-400' },
  waiting:  { icon: '\u21ba', color: 'text-amber-400' },
};

export function TaskRow({ task }: Props) {
  const updateWorkTaskStatus = useStore(s => s.updateWorkTaskStatus);
  const meta = STATUS_META[task.status];

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(task.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    if (task.status === 'done' && next === 'todo') return;
    updateWorkTaskStatus(task.id, next);
  };

  return (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-surface-hover group">
      <button onClick={cycleStatus} className={`text-sm ${meta.color} hover:opacity-80 transition-opacity`}>
        {meta.icon}
      </button>
      <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
        {task.title}
      </span>
      {task.due && (
        <span className="text-xs text-zinc-500">due {task.due}</span>
      )}
      {task.blocker && (
        <span className="text-xs text-amber-500" title={task.blocker}>blocked</span>
      )}
    </div>
  );
}
