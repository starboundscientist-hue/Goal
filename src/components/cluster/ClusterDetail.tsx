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
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground/60 hover:text-foreground/80 mb-4 flex items-center gap-1 transition-colors">
        {'\u2190'} Back
      </button>

      <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-3 h-3 rounded-full opacity-80" style={{ backgroundColor: CLUSTER_COLORS[cluster.id] }} />
          <h1 className="text-xl font-semibold text-foreground/90">{cluster.name}</h1>
          <span className="text-2xl font-bold ml-auto" style={{ color: CLUSTER_COLORS[cluster.id] }}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: CLUSTER_COLORS[cluster.id] }}
          />
        </div>
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
      className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium mb-3 hover:text-foreground/70 transition-colors"
    >
      <span className="text-muted-foreground/40 text-xs">{collapsed[sectionKey] ? '\u25b6' : '\u25bc'}</span>
      {title}
    </button>
  );
}
