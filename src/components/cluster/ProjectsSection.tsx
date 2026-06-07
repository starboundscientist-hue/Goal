import { useState, useRef, useEffect } from 'react';
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
  not_started: 'text-muted-foreground',
  in_progress: 'text-blue-400',
  done: 'text-emerald-400',
};

export function ProjectsSection({ clusterId, projects }: Props) {
  const addProject = useStore(s => s.addProject);
  const removeProject = useStore(s => s.removeProject);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

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

  return (
    <div className="mb-6">
      <div className="space-y-1">
        {projects.map(project => (
          <div
            key={project.id}
            className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/[0.03] transition-colors"
          >
            <span className={`text-sm shrink-0 ${STATUS_COLOR[project.status]}`}>
              {STATUS_ICON[project.status]}
            </span>
            <span
              onClick={() => setSelectedProject(project)}
              className={`text-sm flex-1 cursor-pointer select-none ${project.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
            >
              {project.label}
            </span>
            {project.detected_commits && project.detected_commits.length > 0 && (
              <span className="text-xs text-muted-foreground/60">
                {project.detected_commits.length} commits
              </span>
            )}
            <button
              onClick={() => setSelectedProject(project)}
              className="text-muted-foreground hover:text-blue-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Open"
            >
              {'\u203a'}
            </button>
            <button
              onClick={() => removeProject(clusterId, project.id)}
              className="text-muted-foreground hover:text-red-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              {'\u2715'}
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2 mt-2 px-2">
          <input
            ref={inputRef}
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="Project name\u2026"
            className="flex-1 bg-surface-muted/60 text-foreground text-sm rounded-lg px-3 py-1.5 outline-none border border-surface-border/60 focus:border-blue-500/50 placeholder:text-muted-foreground/60"
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
          className="mt-2 ml-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
