import { useState } from 'react';
import type { Project } from '../../lib/types';
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
  not_started: 'text-zinc-500',
  in_progress: 'text-blue-400',
  done: 'text-emerald-400',
};

export function ProjectsSection({ clusterId, projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">Projects</h3>
      <div className="space-y-1">
        {projects.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover cursor-pointer"
          >
            <span className={`text-sm ${STATUS_COLOR[project.status]}`}>
              {STATUS_ICON[project.status]}
            </span>
            <span className={`text-sm flex-1 ${project.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
              {project.label}
            </span>
            {project.detected_commits && project.detected_commits.length > 0 && (
              <span className="text-xs text-zinc-500">
                {'\u21b3'} {project.detected_commits.length} commits
              </span>
            )}
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectDrawer
          clusterId={clusterId}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
