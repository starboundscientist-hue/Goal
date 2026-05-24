import type { Resource } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  resources: Resource[];
}

export function ResourcesSection({ clusterId, resources }: Props) {
  const toggleResource = useStore(s => s.toggleResource);

  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">Study Resources</h3>
      <div className="space-y-1">
        {resources.map(resource => (
          <label key={resource.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover cursor-pointer group">
            <input
              type="checkbox"
              checked={resource.done}
              onChange={() => toggleResource(clusterId, resource.id)}
              className="accent-blue-500"
            />
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${resource.done ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                {resource.label}
              </span>
            </div>
            {resource.finished_date && (
              <span className="text-xs text-emerald-500 flex-shrink-0">
                {'\u2713'} {resource.finished_date}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
