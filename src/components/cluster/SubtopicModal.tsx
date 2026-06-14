import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import type { Topic, Subtopic } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  topic: Topic;
  onClose: () => void;
}

export function SubtopicModal({ clusterId, topic, onClose }: Props) {
  const addSubtopic = useStore(s => s.addSubtopic);
  const removeSubtopic = useStore(s => s.removeSubtopic);
  const toggleSubtopic = useStore(s => s.toggleSubtopic);
  const updateSubtopic = useStore(s => s.updateSubtopic);
  const reorderSubtopics = useStore(s => s.reorderSubtopics);

  const [newLabel, setNewLabel] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const subInputRef = useRef<HTMLInputElement>(null);

  const subtopics = useMemo(
    () => [...(topic.subtopics ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [topic.subtopics]
  );
  const doneCount = subtopics.filter(s => s.done).length;
  const totalCount = subtopics.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (pct / 100) * circumference;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    subInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) return;
    await addSubtopic(clusterId, topic.id, label);
    setNewLabel('');
    subInputRef.current?.focus();
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = subtopics.findIndex(s => s.id === active.id);
    const newIndex = subtopics.findIndex(s => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(subtopics, oldIndex, newIndex).map(s => s.id);
    reorderSubtopics(clusterId, topic.id, next);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface-card/80 backdrop-blur-2xl border border-surface-border rounded-2xl shadow-2xl overflow-hidden conic-border grain"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label={`Subtopics for ${topic.label}`}
      >
        {/* Hero */}
        <div className="px-7 pt-6 pb-5 border-b border-surface-border/70 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#27272a" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke={pct === 100 ? '#34d399' : pct > 0 ? '#60a5fa' : '#52525b'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
                {pct}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-0.5">
                Subtopics
              </p>
              <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
                {topic.label}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0 -mr-1"
              aria-label="Close"
            >
              {'\u2715'}
            </button>
          </div>

          {totalCount > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="relative flex-1 h-[2px] bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100 ? '#34d399' : '#60a5fa',
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                {doneCount}/{totalCount}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-7 py-5 overflow-y-auto flex-1">
          {subtopics.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-surface-border/80 bg-surface-base/30">
              <p className="text-sm text-foreground/80 mb-1 font-medium">Break this down.</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-[260px]">
                Add subtopics to track progress on this topic.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={subtopics.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1" data-testid="subtopic-list">
                  <AnimatePresence initial={false}>
                    {subtopics.map((sub, i) => (
                      <SortableSubtopicRow
                        key={sub.id}
                        subtopic={sub}
                        index={i}
                        clusterId={clusterId}
                        topicId={topic.id}
                        expandedId={expandedId}
                        onToggle={() => toggleSubtopic(clusterId, topic.id, sub.id)}
                        onRemove={() => removeSubtopic(clusterId, topic.id, sub.id)}
                        onToggleDescription={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                        onDescriptionChange={(desc) => updateSubtopic(clusterId, topic.id, sub.id, { description: desc || undefined })}
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
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
                if (e.key === 'Escape') { setNewLabel(''); e.currentTarget.blur(); }
              }}
              placeholder="Add a subtopic\u2026"
              className="flex-1 bg-surface-base/90 border border-surface-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500/60 focus:bg-surface-base transition-colors"
              data-testid="subtopic-input"
            />
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim()}
              className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-testid="subtopic-add-button"
            >
              Add
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface RowProps {
  subtopic: Subtopic;
  index: number;
  clusterId: string;
  topicId: string;
  expandedId: string | null;
  onToggle: () => void;
  onRemove: () => void;
  onToggleDescription: () => void;
  onDescriptionChange: (desc: string) => void;
}

function SortableSubtopicRow({
  subtopic,
  index,
  onToggle,
  onRemove,
  onToggleDescription,
  onDescriptionChange,
  expandedId,
}: RowProps) {
  const isExpanded = expandedId === subtopic.id;
  const [descDraft, setDescDraft] = useState(subtopic.description ?? '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtopic.id });

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
      className="group"
      data-testid="subtopic-row"
      data-subtopic-id={subtopic.id}
    >
      <div className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-surface-hover/60">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing touch-none px-1 -ml-1"
          aria-label="Drag to reorder"
          data-testid="subtopic-drag-handle"
        >
          {'\u2630'}
        </button>

        <button
          type="button"
          onClick={onToggle}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
            subtopic.done
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-surface-border hover:border-blue-500/60 hover:bg-blue-500/10'
          }`}
          aria-pressed={subtopic.done}
          data-testid="subtopic-checkbox"
        >
          {subtopic.done && (
            <span className="text-[10px] leading-none">{'\u2713'}</span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleDescription}
          className="flex-1 text-left"
          data-testid="subtopic-label"
        >
          <span className={`text-sm transition-colors ${
            subtopic.done ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}>
            {subtopic.label}
          </span>
          {subtopic.description && !isExpanded && (
            <span className="block text-[11px] text-muted-foreground/60 truncate mt-0.5">
              {subtopic.description}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleDescription}
          className={`text-xs px-1 shrink-0 transition-opacity ${
            subtopic.description
              ? 'text-muted-foreground/70 hover:text-foreground'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-foreground'
          }`}
          aria-label="Toggle description"
          data-testid="subtopic-desc-toggle"
        >
          {'\u22ef'}
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 text-xs px-1 transition-opacity shrink-0"
          aria-label="Remove subtopic"
          data-testid="subtopic-remove"
        >
          {'\u2715'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <textarea
              value={descDraft}
              onChange={e => setDescDraft(e.target.value)}
              onBlur={() => onDescriptionChange(descDraft)}
              placeholder="Notes or details about this subtopic\u2026"
              rows={2}
              data-testid="subtopic-desc-input"
              className="ml-9 mt-1 mb-1.5 w-[calc(100%-2.25rem)] bg-surface-base/90 border border-surface-border rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500/60 resize-none transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
