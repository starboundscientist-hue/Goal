import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClusterState, LogEntry } from '../../lib/types';
import { CLUSTER_COLORS } from '../../lib/types';
import { computeClusterProgress } from '../../lib/utils';
import { ChecklistSection } from './ChecklistSection';
import { TopicsSection } from './TopicsSection';
import { ResourcesSection } from './ResourcesSection';
import { ProjectsSection } from './ProjectsSection';

interface Props {
  cluster: ClusterState;
  logs: LogEntry[];
}

export function ClusterDetail({ cluster, logs }: Props) {
  const navigate = useNavigate();
  const progress = computeClusterProgress(cluster);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (section: string) => setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  return (
    <div>
      <button onClick={() => navigate('/')} className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 flex items-center gap-1">
        {'\u2190'} Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[cluster.id] }} />
        <h1 className="text-xl font-semibold text-zinc-100">{cluster.name}</h1>
        <span className="text-2xl font-bold" style={{ color: CLUSTER_COLORS[cluster.id] }}>
          {progress}%
        </span>
      </div>

      <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden mb-6">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: CLUSTER_COLORS[cluster.id] }}
        />
      </div>

      <SectionHeader title="Close the loop" sectionKey="checklist" collapsed={collapsed} onToggle={toggle} />
      {!collapsed['checklist'] && <ChecklistSection clusterId={cluster.id} checklist={cluster.checklist} />}

      <SectionHeader title="Topics" sectionKey="topics" collapsed={collapsed} onToggle={toggle} />
      {!collapsed['topics'] && <TopicsSection clusterId={cluster.id} topics={cluster.topics} />}

      <SectionHeader title="Study Resources" sectionKey="resources" collapsed={collapsed} onToggle={toggle} />
      {!collapsed['resources'] && <ResourcesSection clusterId={cluster.id} resources={cluster.resources} />}

      <SectionHeader title="Projects" sectionKey="projects" collapsed={collapsed} onToggle={toggle} />
      {!collapsed['projects'] && <ProjectsSection clusterId={cluster.id} projects={cluster.projects} />}
    </div>
  );
}

function SectionHeader({ title, sectionKey, collapsed, onToggle }: {
  title: string;
  sectionKey: string;
  collapsed: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(sectionKey)}
      className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3 hover:text-zinc-300 transition-colors"
    >
      <span className="text-zinc-600 text-sm">{collapsed[sectionKey] ? '\u25b6' : '\u25bc'}</span>
      {title}
    </button>
  );
}
