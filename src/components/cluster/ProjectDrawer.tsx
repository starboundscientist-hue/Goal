import { useState } from 'react';
import type { Project } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  project: Project;
  onClose: () => void;
}

export function ProjectDrawer({ clusterId, project, onClose }: Props) {
  const updateProjectStatus = useStore(s => s.updateProjectStatus);
  const [status, setStatus] = useState(project.status);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any);
    updateProjectStatus(clusterId, project.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[480px] max-w-full h-full bg-surface-card/80 backdrop-blur-2xl border-l border-surface-border/40 overflow-y-auto p-6 conic-border grain">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground/90">{project.label}</h2>
          <button onClick={onClose} className="text-muted-foreground/50 hover:text-foreground/80 text-xl leading-none transition-colors">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground/50 mb-1 block">Status</label>
            <div className="flex gap-2">
              {(['not_started', 'in_progress', 'done'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    status === s
                      ? 'bg-blue-600/90 border-blue-500/60 text-white'
                      : 'bg-surface-base/40 border-surface-border/40 text-muted-foreground/60 hover:text-foreground/80 hover:border-surface-border/60'
                  }`}
                >
                  {s === 'not_started' ? '\u25cb Not started' : s === 'in_progress' ? '\u23f3 In progress' : '\u2713 Done'}
                </button>
              ))}
            </div>
          </div>

          {project.artifact_url && (
            <div>
              <label className="text-xs text-muted-foreground/50 mb-1 block">Artifact URL</label>
              <a href={project.artifact_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-400/80 hover:text-blue-300 break-all transition-colors">
                {project.artifact_url}
              </a>
            </div>
          )}

          {project.notes && (
            <div>
              <label className="text-xs text-muted-foreground/50 mb-1 block">Notes</label>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}

          {project.detected_commits && project.detected_commits.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground/50 mb-1 block">Linked Commits</label>
              <div className="space-y-1">
                {project.detected_commits.map((msg, i) => (
                  <div key={i} className="text-sm text-muted-foreground/60">{'\u2192'} {msg}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
