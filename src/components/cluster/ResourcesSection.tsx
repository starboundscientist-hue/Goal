import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates as sortableKb, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Resource } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  resources: Resource[];
}

export function ResourcesSection({ clusterId, resources }: Props) {
  const toggleResource = useStore(s => s.toggleResource);
  const addResource = useStore(s => s.addResource);
  const removeResource = useStore(s => s.removeResource);
  const reorderResources = useStore(s => s.reorderResources);

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKb })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = resources.map(r => r.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const reordered = arrayMove(ids, oldIndex, newIndex);
    reorderResources(clusterId, reordered);
  };

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) { setAdding(false); return; }
    await addResource(clusterId, label);
    setNewLabel('');
    setAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setNewLabel(''); }
  };

  const sorted = [...resources].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="mb-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {sorted.map(resource => (
              <SortableResourceRow
                key={resource.id}
                clusterId={clusterId}
                resource={resource}
                onToggle={() => toggleResource(clusterId, resource.id)}
                onRemove={() => removeResource(clusterId, resource.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="flex items-center gap-2 mt-2 px-2">
          <input
            ref={inputRef}
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="Resource name\u2026"
            className="flex-1 bg-surface-muted/80 text-foreground text-sm rounded-lg px-3 py-1.5 outline-none border border-surface-border/60 focus:border-blue-500/50 placeholder:text-muted-foreground/60"
          />
          <button
            onMouseDown={e => { e.preventDefault(); handleAdd(); }}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
          >
            Add
          </button>
          <button
            onMouseDown={() => { setAdding(false); setNewLabel(''); }}
            className="text-xs text-muted-foreground hover:text-foreground px-1"
          >
            {'\u2715'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 ml-1 flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground/80 transition-colors"
        >
          <span className="text-base leading-none">+</span> Add resource
        </button>
      )}
    </div>
  );
}

function SortableResourceRow({ clusterId, resource, onToggle, onRemove }: {
  clusterId: string;
  resource: Resource;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: resource.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
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
        onClick={onToggle}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
          resource.done
            ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
            : 'border-surface-border/60 hover:border-blue-500/40'
        }`}
        aria-pressed={resource.done}
      >
        {resource.done && <span className="text-[10px]">{'\u2713'}</span>}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${resource.done ? 'text-muted-foreground/50 line-through' : 'text-foreground/80'}`}>
          {resource.label}
        </span>
      </div>
      {resource.finished_date && (
        <span className="text-xs text-emerald-500/70 flex-shrink-0">
          {resource.finished_date}
        </span>
      )}
      <button
        onClick={onRemove}
        className="text-muted-foreground/50 hover:text-red-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove"
      >
        {'\u2715'}
      </button>
    </div>
  );
}
