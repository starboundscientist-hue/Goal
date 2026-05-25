import { useState } from 'react';
import type { LogEntry } from '../../lib/types';
import { CLUSTER_COLORS } from '../../lib/types';
import { formatHours } from '../../lib/utils';

interface Props {
  entry: LogEntry;
}

export function LogRow({ entry }: Props) {
  const [expanded, setExpanded] = useState(false);

  const dayName = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = new Date(entry.date).getDate();

  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-surface-hover cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CLUSTER_COLORS[entry.cluster] }} />
        <span className="text-sm text-muted-foreground w-16 flex-shrink-0">{dayName} {dayNum}</span>
        <span className="text-sm text-foreground flex-1 truncate">{entry.topic}</span>
        <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">{formatHours(entry.hours)}</span>
        {entry.source === 'git' && (
          <span className="text-xs bg-surface-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">git</span>
        )}
        <span className={entry.is_completed ? 'text-emerald-400' : 'text-muted-foreground'}>
          {entry.is_completed ? '\u2713' : '\u231b'}
        </span>
      </div>
      {expanded && entry.notes && (
        <div className="pl-8 pr-4 pb-2 text-sm text-muted-foreground">{entry.notes}</div>
      )}
    </div>
  );
}
