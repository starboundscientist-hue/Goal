import type { LogEntry } from '../../lib/types';
import { CLUSTER_COLORS } from '../../lib/types';
import { buildHeatmapData } from '../../lib/utils';

interface Props {
  logs: LogEntry[];
}

export function ActivityHeatmap({ logs }: Props) {
  const cells = buildHeatmapData(logs);

  const cellColor = (clusterId: string | null, hours: number): string => {
    if (hours === 0 || !clusterId) return '#1f1f23';
    const color = CLUSTER_COLORS[clusterId as keyof typeof CLUSTER_COLORS] || '#3f3f46';
    if (hours <= 1) return color + '66';
    if (hours <= 2) return color + '99';
    if (hours <= 3) return color + 'cc';
    return color;
  };

  return (
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
      </div>
    </div>
  );
}
