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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[480px] max-w-full h-full bg-surface-card border-l border-surface-border overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">{project.label}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Status</label>
            <div className="flex gap-2">
              {(['not_started', 'in_progress', 'done'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-md text-sm border ${
                    status === s
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-surface-base border-surface-border text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {s === 'not_started' ? '\u25cb Not started' : s === 'in_progress' ? '\u23f3 In progress' : '\u2713 Done'}
                </button>
              ))}
            </div>
          </div>

          {project.artifact_url && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Artifact URL</label>
              <a href={project.artifact_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 break-all">
                {project.artifact_url}
              </a>
            </div>
          )}

          {project.notes && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Notes</label>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}

          {project.detected_commits && project.detected_commits.length > 0 && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Linked Commits</label>
              <div className="space-y-1">
                {project.detected_commits.map((msg, i) => (
                  <div key={i} className="text-sm text-zinc-500">{'\u2192'} {msg}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
