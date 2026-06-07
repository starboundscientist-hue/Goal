import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorkTask, Subtask, TaskStatus } from '../../lib/types';
import { useStore } from '../../lib/store';
import * as api from '../../lib/api';

interface Props {
  task: WorkTask;
  onClose: () => void;
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'wip', 'done', 'stuck', 'waiting'];

const STATUS_META: Record<TaskStatus, { label: string; color: string; glow: string; gradient: string[] }> = {
  todo:    { label: 'Todo',    color: 'text-zinc-300 bg-zinc-700/40',          glow: 'hsl(240 4% 46%)',  gradient: ['hsl(240 4% 46% / .45)', 'hsl(240 4% 46% / .2)', 'hsl(240 4% 46% / .35)', 'hsl(240 4% 46% / .45)'] },
  wip:     { label: 'WIP',     color: 'text-blue-300 bg-blue-500/15',          glow: 'hsl(217 91% 60%)', gradient: ['hsl(217 91% 60% / .45)', 'hsl(217 91% 60% / .2)', 'hsl(340 82% 65% / .35)', 'hsl(217 91% 60% / .45)'] },
  done:    { label: 'Done',    color: 'text-emerald-300 bg-emerald-500/15',    glow: 'hsl(160 84% 39%)', gradient: ['hsl(160 84% 39% / .5)', 'hsl(160 84% 39% / .25)', 'hsl(160 84% 39% / .35)', 'hsl(160 84% 39% / .5)'] },
  stuck:   { label: 'Stuck',   color: 'text-red-300 bg-red-500/15',            glow: 'hsl(0 72% 51%)',   gradient: ['hsl(0 72% 51% / .45)', 'hsl(0 72% 51% / .2)', 'hsl(0 72% 51% / .35)', 'hsl(0 72% 51% / .45)'] },
  waiting: { label: 'Waiting', color: 'text-amber-300 bg-amber-500/15',        glow: 'hsl(38 92% 50%)',  gradient: ['hsl(38 92% 50% / .45)', 'hsl(38 92% 50% / .2)', 'hsl(38 92% 50% / .35)', 'hsl(38 92% 50% / .45)'] },
};

const STATUS_KEYS: Record<string, TaskStatus> = {
  '1': 'todo',
  '2': 'wip',
  '3': 'done',
  '4': 'stuck',
  '5': 'waiting',
};

export function TaskDetailModal({ task, onClose }: Props) {
  const updateWorkTaskStatus = useStore(s => s.updateWorkTaskStatus);
  const updateWorkTask = useStore(s => s.updateWorkTask);
  const addSubtask = useStore(s => s.addSubtask);
  const toggleSubtask = useStore(s => s.toggleSubtask);
  const removeSubtask = useStore(s => s.removeSubtask);
  const reorderSubtasks = useStore(s => s.reorderSubtasks);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [newSubLabel, setNewSubLabel] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [shimmerKey, setShimmerKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const subInputRef = useRef<HTMLInputElement>(null);
  const previousDoneCount = useRef<number>(
    (task.subtasks ?? []).filter(s => s.done).length
  );

  const subtasks = useMemo(
    () => [...(task.subtasks ?? [])].sort((a, b) => a.order - b.order),
    [task.subtasks]
  );
  const doneCount = subtasks.filter(s => s.done).length;
  const totalCount = subtasks.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && doneCount === totalCount;
  const meta = STATUS_META[task.status];

  useEffect(() => {
    setTitleDraft(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isComplete && previousDoneCount.current < totalCount) {
      setShimmerKey(k => k + 1);
    }
    previousDoneCount.current = doneCount;
  }, [doneCount, totalCount, isComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (editingTitle) {
          setTitleDraft(task.title);
          setEditingTitle(false);
        } else {
          onClose();
        }
        return;
      }
      if (editingTitle) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      const statusKey = STATUS_KEYS[e.key];
      if (statusKey) {
        e.preventDefault();
        updateWorkTaskStatus(task.id, statusKey);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        updateWorkTaskStatus(task.id, 'done');
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        subInputRef.current?.focus();
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        subInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task.id, task.title, editingTitle, onClose, updateWorkTaskStatus]);

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(task.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    if (task.status === 'done' && next === 'todo') return;
    updateWorkTaskStatus(task.id, next);
  };

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== task.title) {
      updateWorkTask(task.id, { title: next });
    } else {
      setTitleDraft(task.title);
    }
    setEditingTitle(false);
  };

  const handleAddSubtask = async () => {
    const label = newSubLabel.trim();
    if (!label) return;
    await addSubtask(task.id, label);
    setNewSubLabel('');
    subInputRef.current?.focus();
  };

  const handleSubInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddSubtask();
    } else if (e.key === 'Escape') {
      setNewSubLabel('');
      e.currentTarget.blur();
    }
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    setSuggestError(null);
    const labels = await api.suggestSubtasks(task.title, task.blocker);
    setSuggesting(false);
    if (labels.length === 0) {
      setSuggestError('AI unavailable — try again later.');
      return;
    }
    for (const label of labels) {
      await addSubtask(task.id, label);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = subtasks.findIndex(s => s.id === active.id);
    const newIndex = subtasks.findIndex(s => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(subtasks, oldIndex, newIndex).map(s => s.id);
    reorderSubtasks(task.id, next);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      data-testid="task-modal-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative w-full max-w-5xl max-h-[85vh] flex flex-col bg-surface-card/80 backdrop-blur-2xl border border-surface-border rounded-2xl shadow-2xl overflow-hidden conic-border grain"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="task-modal-title"
        data-testid="task-modal"
        style={{
          ['--status-color' as string]: meta.glow,
          ['--conic-1' as string]: meta.gradient[0],
          ['--conic-2' as string]: meta.gradient[1],
          ['--conic-3' as string]: meta.gradient[2],
          ['--conic-4' as string]: meta.gradient[3],
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none -z-10 status-glow"
          aria-hidden
        />

        <div className="px-7 pt-6 pb-5 border-b border-surface-border/70 flex-shrink-0">
          <div className="flex items-start gap-3">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); commitTitle(); }
                  if (e.key === 'Escape') { e.preventDefault(); setTitleDraft(task.title); setEditingTitle(false); }
                }}
                className="flex-1 text-[22px] font-semibold leading-snug tracking-tight text-foreground bg-transparent border-b border-blue-500/50 outline-none pb-1"
                data-testid="task-title-input"
              />
            ) : (
              <h2
                id="task-modal-title"
                onClick={() => setEditingTitle(true)}
                className="flex-1 text-[22px] font-semibold leading-snug tracking-tight text-foreground cursor-text hover:bg-surface-hover/40 -mx-1 px-1 rounded transition-colors"
                data-testid="task-title"
                title="Click to edit"
              >
                {task.title}
              </h2>
            )}

            <button
              onClick={cycleStatus}
              className={`text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full ${meta.color} hover:brightness-125 transition`}
              data-testid="task-status-pill"
              title="Click to cycle status (or press 1–5)"
            >
              {meta.label}
            </button>

            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0 -mr-1"
              aria-label="Close"
              data-testid="task-modal-close"
            >
              {'\u2715'}
            </button>
          </div>

          {totalCount > 0 ? (
            <div className="mt-4 flex items-center gap-3" data-testid="task-progress">
              <div className="relative flex-1 h-[2px] bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${meta.glow}, ${meta.glow})`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                />
                {isComplete && (
                  <div
                    key={shimmerKey}
                    className="absolute inset-0 rounded-full animate-shimmer"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                    }}
                    aria-hidden
                  />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                {doneCount}/{totalCount} · {pct}%
              </span>
            </div>
          ) : (
            <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              No subtasks yet
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] overflow-hidden">
          <div className="px-7 py-5 overflow-y-auto border-r border-surface-border/60">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3">
              Subtasks
            </div>

            {subtasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-surface-border/80 bg-surface-base/30">
                <div className="text-3xl mb-2 text-muted-foreground">{'\u2728'}</div>
                <p className="text-sm text-foreground/80 mb-1 font-medium">Break this down.</p>
                <p className="text-xs text-muted-foreground mb-4 max-w-[260px]">
                  Add your own subtasks, or let the AI suggest a starting point.
                </p>
                <button
                  onClick={handleSuggest}
                  disabled={suggesting}
                  className="text-xs px-3 py-1.5 rounded-md bg-blue-600/90 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="task-suggest-button"
                >
                  {suggesting ? 'Thinking\u2026' : '\u2728 Suggest subtasks'}
                </button>
                {suggestError && (
                  <p className="text-[11px] text-amber-400 mt-2">{suggestError}</p>
                )}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={subtasks.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-1" data-testid="subtask-list">
                    <AnimatePresence>
                      {subtasks.map((sub, i) => (
                        <SortableSubtaskRow
                          key={sub.id}
                          subtask={sub}
                          index={i}
                          onToggle={() => toggleSubtask(task.id, sub.id)}
                          onRemove={() => removeSubtask(task.id, sub.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </SortableContext>
              </DndContext>
            )}

            <div className="mt-4 flex items-center gap-2">
              <input
                ref={subInputRef}
                value={newSubLabel}
                onChange={e => setNewSubLabel(e.target.value)}
                onKeyDown={handleSubInputKey}
                placeholder="Add a subtask\u2026"
                className="flex-1 bg-surface-base/80 border border-surface-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500/60 focus:bg-surface-base transition-colors"
                data-testid="subtask-input"
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubLabel.trim()}
                className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="subtask-add-button"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <button
                  onClick={handleSuggest}
                  disabled={suggesting}
                  className="hover:text-foreground transition-colors disabled:opacity-50"
                  data-testid="task-suggest-button-secondary"
                >
                  {suggesting ? 'Thinking\u2026' : '\u2728 Suggest more'}
                </button>
                {suggestError && <span className="text-amber-400">{suggestError}</span>}
              </div>
            )}
          </div>

          <div className="px-7 py-5 overflow-y-auto bg-surface-base/30">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3">
              Context
            </div>
            <dl className="space-y-3 text-sm">
              <MetaRow label="Created">{task.created_date}</MetaRow>
              <DueRow
                value={task.due}
                onChange={v => updateWorkTask(task.id, { due: v })}
              />
              {task.blocker && (
                <MetaRow label="Blocker">
                  <span className="text-amber-400">{task.blocker}</span>
                </MetaRow>
              )}
              {task.git_repo && (
                <MetaRow label="Repo">
                  <span className="font-mono text-xs break-all text-muted-foreground">
                    {task.git_repo}
                  </span>
                </MetaRow>
              )}
            </dl>

            <div className="mt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
              Notes
            </div>
            <div className="rounded-lg border border-dashed border-surface-border/70 bg-surface-base/40 px-3 py-3 text-xs text-muted-foreground italic">
              Free-form notes coming in a follow-up.
            </div>

            <div className="mt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
              Shortcuts
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-1 font-mono">
              <li><kbd className="text-foreground/70">Esc</kbd> &nbsp;close</li>
              <li><kbd className="text-foreground/70">/</kbd> or <kbd className="text-foreground/70">{'\u2318\u23ce'}</kbd> &nbsp;focus add subtask</li>
              <li><kbd className="text-foreground/70">1{'\u2013'}5</kbd> &nbsp;set status</li>
              <li><kbd className="text-foreground/70">{'\u2318\u21e7\u23ce'}</kbd> &nbsp;mark done</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground w-16 shrink-0">
        {label}
      </dt>
      <dd className="text-foreground/90 flex-1 min-w-0">{children}</dd>
    </div>
  );
}

interface RowProps {
  subtask: Subtask;
  index: number;
  onToggle: () => void;
  onRemove: () => void;
}

function SortableSubtaskRow({ subtask, index, onToggle, onRemove }: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout={!isDragging}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0, transition: { delay: index * 0.03, duration: 0.18 } }}
      exit={{ opacity: 0, x: 8, transition: { duration: 0.12 } }}
      className="group flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-surface-hover/60"
      data-testid="subtask-row"
      data-subtask-id={subtask.id}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing touch-none px-1 -ml-1"
        aria-label="Drag to reorder"
        data-testid="subtask-drag-handle"
      >
        {'\u2630'}
      </button>

      <motion.button
        type="button"
        onClick={onToggle}
        whileTap={{ scale: 0.85 }}
        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          subtask.done
            ? 'bg-blue-500 border-blue-500 text-white'
            : 'border-surface-border hover:border-blue-500/60 hover:bg-blue-500/10'
        }`}
        aria-pressed={subtask.done}
        data-testid="subtask-checkbox"
      >
        <AnimatePresence>
          {subtask.done && (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="text-[10px] leading-none"
            >
              {'\u2713'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <span
        className={`flex-1 text-sm transition-colors ${
          subtask.done ? 'text-muted-foreground line-through' : 'text-foreground'
        }`}
      >
        {subtask.label}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 text-xs px-1 transition-opacity"
        aria-label="Remove subtask"
        data-testid="subtask-remove"
      >
        {'\u2715'}
      </button>
    </motion.li>
  );
}

function DueRow({ value, onChange }: { value: string | undefined; onChange: (v: string | undefined) => void }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.showPicker?.();
    }
  }, [editing]);

  if (editing) {
    return (
      <MetaRow label="Due">
        <input
          ref={inputRef}
          type="date"
          defaultValue={value || ''}
          onChange={e => {
            const v = e.target.value;
            onChange(v || undefined);
            setEditing(false);
          }}
          onBlur={() => setEditing(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setEditing(false);
            }
          }}
          data-testid="task-due-input"
          className="bg-surface-base/80 border border-surface-border rounded-md px-2 py-0.5 text-xs text-foreground outline-none focus:border-blue-500/60 [color-scheme:dark]"
        />
      </MetaRow>
    );
  }

  return (
    <MetaRow label="Due">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="hover:bg-surface-hover/50 -mx-1 px-1 rounded transition-colors text-foreground/90"
          data-testid="task-due-button"
        >
          {value || <span className="text-muted-foreground italic">Add due…</span>}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-muted-foreground hover:text-red-400 text-xs"
            aria-label="Clear due date"
            data-testid="task-due-clear"
          >
            {'\u2715'}
          </button>
        )}
      </div>
    </MetaRow>
  );
}
