import { useState } from 'react';
import { useStore } from '../lib/store';
import { LogRow } from '../components/logging/LogRow';
import { AnyClusterId, CLUSTER_COLORS, CLUSTER_LABELS } from '../lib/types';

const ALL_CLUSTERS: AnyClusterId[] = ['foundations', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'work', 'unknown'];

export function LogPage() {
  const { progress } = useStore();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(ALL_CLUSTERS));

  if (!progress) return <div className="text-muted-foreground/50">Loading...</div>;

  const toggleFilter = (id: string) => {
    const next = new Set(activeFilters);
    if (next.has(id)) next.delete(id); else next.add(id);
    setActiveFilters(next);
  };

  const filtered = progress.logs.filter(l => activeFilters.has(l.cluster));

  const grouped: Record<string, typeof filtered> = {};
  for (const entry of filtered) {
    const month = entry.date.slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(entry);
  }

  const weekTotal = filtered
    .filter(l => {
      const d = new Date(l.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((sum, l) => sum + l.hours, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-foreground/90">Activity Log</h1>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-logger'))}
          className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          + New Entry
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {ALL_CLUSTERS.map(id => (
          <button
            key={id}
            onClick={() => toggleFilter(id)}
            className={`rounded-full px-2.5 py-1 text-xs border transition-all ${
              activeFilters.has(id)
                ? 'text-white/90 border-current'
                : 'bg-surface-muted/30 text-muted-foreground/50 border-transparent hover:bg-surface-muted/50'
            }`}
            style={activeFilters.has(id) ? {
              backgroundColor: CLUSTER_COLORS[id] + '22',
              borderColor: CLUSTER_COLORS[id] + '66',
              color: CLUSTER_COLORS[id]
            } : {}}
          >
            {CLUSTER_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, entries]) => (
          <div key={month}>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium mb-2">
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            {entries.map(entry => (
              <LogRow key={entry.id} entry={entry} />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground/50">No log entries yet.</div>
        )}
      </div>

      <div className="sticky bottom-0 mt-6 pt-3 border-t border-surface-border/30 text-sm text-muted-foreground/50 bg-surface-base/80 backdrop-blur-xl">
        Week total: {weekTotal}h study
      </div>
    </div>
  );
}
