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
      <div className="space-y-2">
        {items.map(({ field, label, desc }) => (
          <label key={field} className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover cursor-pointer">
            <input
              type="checkbox"
              checked={checklist[field]}
              onChange={e => updateChecklist(clusterId, field, e.target.checked)}
              className="accent-blue-500"
            />
            <div>
              <div className="text-sm text-zinc-100">{label}</div>
              <div className="text-xs text-zinc-500">{desc}</div>
            </div>
          </label>
        ))}
      </div>
      {allDone && (
        <div className="mt-3 text-sm text-emerald-400 font-medium">
          {'\u2713'} Cluster Closed
        </div>
      )}
    </div>
  );
}
