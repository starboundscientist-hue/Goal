import type { WorkTask, TaskStatus } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  task: WorkTask;
  onOpen: () => void;
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'wip', 'done', 'stuck', 'waiting'];

const STATUS_META: Record<TaskStatus, { icon: string; color: string }> = {
  todo:     { icon: '\u25cb', color: 'text-muted-foreground/60' },
  wip:      { icon: '\u25cf', color: 'text-blue-400/80' },
  done:     { icon: '\u2713', color: 'text-emerald-400/80' },
  stuck:    { icon: '\u26a0', color: 'text-red-400/80' },
  waiting:  { icon: '\u21ba', color: 'text-amber-400/80' },
};

export function TaskRow({ task, onOpen }: Props) {
  const updateWorkTaskStatus = useStore(s => s.updateWorkTaskStatus);
  const meta = STATUS_META[task.status];
  const subtaskTotal = task.subtasks?.length ?? 0;
  const subtaskDone = task.subtasks?.filter(s => s.done).length ?? 0;

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(task.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    if (task.status === 'done' && next === 'todo') return;
    updateWorkTaskStatus(task.id, next);
  };

  return (
    <div
      className="group flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
      data-testid="task-row"
    >
      <button
        type="button"
        onClick={cycleStatus}
        className={`text-sm shrink-0 ${meta.color} hover:opacity-100 transition-opacity`}
        title={`Status: ${task.status} (click to cycle)`}
        data-testid="task-row-status-button"
      >
        {meta.icon}
      </button>
      <button
        onClick={onOpen}
        className={`text-sm flex-1 text-left cursor-pointer transition-colors ${
          task.status === 'done' ? 'text-muted-foreground/50 line-through' : 'text-foreground/80 hover:text-foreground'
        }`}
        data-testid="task-row-title"
      >
        {task.title}
      </button>
      {subtaskTotal > 0 && (
        <span
          className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0"
          data-testid="task-row-subtask-count"
        >
          {subtaskDone}/{subtaskTotal}
        </span>
      )}
      {task.due && (
        <span className="text-xs text-muted-foreground/50 shrink-0">due {task.due}</span>
      )}
      {task.blocker && (
        <span className="text-xs text-amber-500/70 shrink-0" title={task.blocker}>blocked</span>
      )}
      <span
        className="text-muted-foreground/40 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
        data-testid="task-row-chevron"
      >
        {'\u203a'}
      </span>
    </div>
  );
}
