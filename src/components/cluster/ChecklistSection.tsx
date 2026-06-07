import type { ClusterChecklist } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  checklist: ClusterChecklist;
}

export function ChecklistSection({ clusterId, checklist }: Props) {
  const updateChecklist = useStore(s => s.updateChecklist);

  const items: Array<{ field: keyof ClusterChecklist; label: string; desc: string }> = [
    { field: 'study', label: 'Study closed', desc: 'Can teach the core ideas' },
    { field: 'experiment', label: 'Experiment done', desc: 'Toy version built and broken' },
    { field: 'artifact', label: 'Public artifact', desc: 'Repo / blog / video' },
  ];

  const allDone = checklist.study && checklist.experiment && checklist.artifact;

  return (
    <div className="mb-6">
      <div className="space-y-1">
        {items.map(({ field, label, desc }) => (
          <label key={field} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors group">
            <button
              type="button"
              onClick={() => updateChecklist(clusterId, field, !checklist[field])}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                checklist[field]
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                  : 'border-surface-border/60 hover:border-emerald-500/40'
              }`}
            >
              {checklist[field] && <span className="text-[10px]">{'\u2713'}</span>}
            </button>
            <div>
              <div className="text-sm text-foreground/80">{label}</div>
              <div className="text-xs text-muted-foreground/50">{desc}</div>
            </div>
          </label>
        ))}
      </div>
      {allDone && (
        <div className="mt-3 text-sm text-emerald-400/80 font-medium">
          {'\u2713'} Cluster Closed
        </div>
      )}
    </div>
  );
}
