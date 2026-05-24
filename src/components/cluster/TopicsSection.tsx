import type { Topic } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  topics: Topic[];
}

export function TopicsSection({ clusterId, topics }: Props) {
  const toggleTopic = useStore(s => s.toggleTopic);

  return (
    <div className="mb-6">
      <div className="space-y-1">
        {topics.map(topic => (
          <label key={topic.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover cursor-pointer">
            <input
              type="checkbox"
              checked={topic.done}
              onChange={() => toggleTopic(clusterId, topic.id)}
              className="accent-blue-500"
            />
            <span className={`text-sm ${topic.done ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
              {topic.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
