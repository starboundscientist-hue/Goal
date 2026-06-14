import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates as sortableKb, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project } from '../../lib/types';
import { useStore } from '../../lib/store';
import { ProjectDrawer } from './ProjectDrawer';

interface Props {
  clusterId: string;
  projects: Project[];
}

const STATUS_ICON: Record<string, string> = {
  not_started: '\u25cb',
  in_progress: '\u23f3',
  done: '\u2713',
};

const STATUS_COLOR: Record<string, string> = {
  not_started: 'text-muted-foreground/60',
  in_progress: 'text-blue-400/80',
  done: 'text-emerald-400/80',
};

export function ProjectsSection({ clusterId, projects }: Props) {
  const addProject = useStore(s => s.addProject);
  const removeProject = useStore(s => s.removeProject);
  const reorderProjects = useStore(s => s.reorderProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
    const ids = projects.map(p => p.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const reordered = arrayMove(ids, oldIndex, newIndex);
    reorderProjects(clusterId, reordered);
  };

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) { setAdding(false); return; }
    await addProject(clusterId, label);
    setNewLabel('');
    setAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setNewLabel(''); }
  };

  const liveProject = selectedProject
    ? projects.find(p => p.id === selectedProject.id) ?? null
    : null;

  const sorted = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="mb-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {sorted.map(project => (
              <SortableProjectRow
                key={project.id}
                project={project}
                onOpen={() => setSelectedProject(project)}
                onRemove={() => removeProject(clusterId, project.id)}
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
            placeholder="Project name\u2026"
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
          <span className="text-base leading-none">+</span> Add project
        </button>
      )}

      {liveProject && (
        <ProjectDrawer
          clusterId={clusterId}
          project={liveProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function SortableProjectRow({ project, onOpen, onRemove }: {
  project: Project;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

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
      <span className={`text-sm shrink-0 ${STATUS_COLOR[project.status]}`}>
        {STATUS_ICON[project.status]}
      </span>
      <span
        onClick={onOpen}
        className={`text-sm flex-1 cursor-pointer select-none ${project.status === 'done' ? 'text-muted-foreground/50 line-through' : 'text-foreground/80'}`}
      >
        {project.label}
      </span>
      {project.detected_commits && project.detected_commits.length > 0 && (
        <span className="text-xs text-muted-foreground/50">
          {project.detected_commits.length} commits
        </span>
      )}
      <button
        onClick={onOpen}
        className="text-muted-foreground/50 hover:text-blue-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Open"
      >
        {'\u203a'}
      </button>
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
