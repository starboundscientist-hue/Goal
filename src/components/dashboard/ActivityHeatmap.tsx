import type { LogEntry } from '../../lib/types';
import { CLUSTER_COLORS } from '../../lib/types';
import { buildHeatmapData } from '../../lib/utils';

interface Props {
  logs: LogEntry[];
}

export function ActivityHeatmap({ logs }: Props) {
  const cells = buildHeatmapData(logs);

  const cellColor = (clusterId: string | null, hours: number): string => {
    if (hours === 0 || !clusterId) return 'var(--surface-border)';
    const color = CLUSTER_COLORS[clusterId as keyof typeof CLUSTER_COLORS] || '#3f3f46';
    if (hours <= 1) return color + '66';
    if (hours <= 2) return color + '99';
    if (hours <= 3) return color + 'cc';
    return color;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider">ACTIVITY GRID</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-surface-border" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-surface-muted" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-400" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-500" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-600" />
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: 'repeat(53, 10px)',
            gridTemplateRows: 'repeat(7, 10px)',
            gridAutoFlow: 'column',
          }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{ backgroundColor: cellColor(cell.clusterId, cell.hours) }}
              title={`${cell.date}: ${cell.hours}h${cell.clusterId ? ' \u2014 ' + cell.clusterId : ''}`}
            />
          ))}
          {Array.from({ length: 371 - cells.length }).map((_, i) => (
            <div key={`e${i}`} className="rounded-[2px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
