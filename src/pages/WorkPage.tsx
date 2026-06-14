import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates as sortableKb, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../lib/store';
import { AutomationSection } from '../components/work/AutomationSection';
import { TaskDetailModal } from '../components/work/TaskDetailModal';
import { generateId } from '../lib/utils';
import type { WorkTask, TaskStatus } from '../lib/types';

const STATUS_ORDER: TaskStatus[] = ['todo', 'wip', 'done', 'stuck', 'waiting'];

const STATUS_META: Record<TaskStatus, { icon: string; color: string }> = {
  todo:     { icon: '\u25cb', color: 'text-muted-foreground/60' },
  wip:      { icon: '\u25cf', color: 'text-blue-400/80' },
  done:     { icon: '\u2713', color: 'text-emerald-400/80' },
  stuck:    { icon: '\u26a0', color: 'text-red-400/80' },
  waiting:  { icon: '\u21ba', color: 'text-amber-400/80' },
};

export function WorkPage() {
  const { work, addWorkTask, updateWorkTaskStatus, reorderWorkTasks } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (!work) return <div className="text-muted-foreground/50">Loading...</div>;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKb })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = work.tasks.map(t => t.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const reordered = arrayMove(ids, oldIndex, newIndex);
    reorderWorkTasks(reordered);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    addWorkTask({
      id: generateId(),
      title: title.trim(),
      status: 'todo',
      order: 0,
      due: due || undefined,
      created_date: new Date().toISOString().split('T')[0],
    });
    setTitle('');
    setDue('');
    setShowForm(false);
  };

  const liveTask = selectedTaskId
    ? work.tasks.find(t => t.id === selectedTaskId) ?? null
    : null;

  const sorted = [...work.tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-foreground/90">Work</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          + Task
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-3 mb-4 space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-surface-base/90 border border-surface-border/40 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/40"
            autoFocus
          />
          <input
            type="date"
            value={due}
            onChange={e => setDue(e.target.value)}
            className="w-full bg-surface-base/90 border border-surface-border/40 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="text-xs text-muted-foreground/60 hover:text-foreground/80 px-3 py-1.5 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {sorted.map(task => (
              <SortableTaskRow
                key={task.id}
                task={task}
                onOpen={() => setSelectedTaskId(task.id)}
                onCycleStatus={() => {
                  const idx = STATUS_ORDER.indexOf(task.status);
                  const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
                  if (task.status === 'done' && next === 'todo') return;
                  updateWorkTaskStatus(task.id, next);
                }}
              />
            ))}
            {work.tasks.length === 0 && (
              <div className="text-sm text-muted-foreground/50">No tasks yet.</div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <AutomationSection />

      {liveTask && (
        <TaskDetailModal
          task={liveTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

function SortableTaskRow({ task, onOpen, onCycleStatus }: {
  task: WorkTask;
  onOpen: () => void;
  onCycleStatus: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const meta = STATUS_META[task.status];
  const subtaskTotal = task.subtasks?.length ?? 0;
  const subtaskDone = task.subtasks?.filter(s => s.done).length ?? 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
      data-testid="task-row"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/30 hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing text-xs shrink-0 touch-none"
        title="Drag to reorder"
      >
        {'\u2630'}
      </button>
      <button
        type="button"
        onClick={onCycleStatus}
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
