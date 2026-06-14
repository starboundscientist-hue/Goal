import { useState } from 'react';
import type { PendingGitEntry, LogEntry, AnyClusterId } from '../../lib/types';
import { CLUSTER_COLORS, CLUSTER_LABELS } from '../../lib/types';

interface Props {
  entry: PendingGitEntry;
  onConfirm: (log: LogEntry) => void;
  onDismiss: () => void;
}

export function GitPendingCard({ entry, onConfirm, onDismiss }: Props) {
  const parsed = entry.parsed;
  const [editCluster, setEditCluster] = useState<AnyClusterId>(parsed?.cluster_id || 'unknown');
  const [editTopic, setEditTopic] = useState(parsed?.topic_guess || entry.commit_group.commits[0] || '');
  const [editHours, setEditHours] = useState(parsed?.hours || 1.0);
  const [editDone, setEditDone] = useState(parsed?.is_completed ?? true);

  const repoShort = entry.commit_group.repo.split('/').slice(-2).join('/');
  const commits = entry.commit_group.commits;

  const handleConfirm = () => {
    const logEntry: LogEntry = {
      id: entry.id,
      date: new Date().toISOString().split('T')[0],
      cluster: editCluster,
      topic: editTopic,
      hours: editHours,
      is_completed: editDone,
      source: 'git',
      git_repo: entry.commit_group.repo,
      commits: entry.commit_group.commits,
      notes: entry.commit_group.commits.join('\n')
    };
    onConfirm(logEntry);
  };

  return (
    <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/60 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground/60">{'\u238b'}</span>
        <span className="text-sm font-medium text-foreground">
          Git detected {commits.length} commit{commits.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="text-xs text-muted-foreground/50 mb-2 font-mono">{repoShort}</div>

      <div className="space-y-1 mb-3">
        {commits.slice(0, 3).map((msg, i) => (
          <div key={i} className="text-sm text-muted-foreground/70">{'\u2192'} {msg}</div>
        ))}
        {commits.length > 3 && (
          <div className="text-xs text-muted-foreground/50">...and {commits.length - 3} more</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted-foreground/60 mb-1 block">Cluster</label>
          <select
            value={editCluster}
            onChange={e => setEditCluster(e.target.value as AnyClusterId)}
            className="w-full bg-surface-base/90 border border-surface-border/60 rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
          >
            {(['foundations', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'sde_engineering', 'ml_engineering', 'fullstack_product', 'work', 'unknown'] as const).map(c => (
              <option key={c} value={c}>{CLUSTER_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground/60 mb-1 block">Hours</label>
          <input
            type="number" step="0.5" min="0.5" max="12"
            value={editHours}
            onChange={e => setEditHours(parseFloat(e.target.value))}
            className="w-full bg-surface-base/90 border border-surface-border/60 rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="mb-3">
          <label className="text-xs text-muted-foreground/60 mb-1 block">Topic</label>
        <input
          type="text" value={editTopic}
          onChange={e => setEditTopic(e.target.value)}
          className="w-full bg-surface-base/90 border border-surface-border/60 rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input type="checkbox" id={`done-${entry.id}`} checked={editDone}
          onChange={e => setEditDone(e.target.checked)} className="accent-blue-500" />
        <label htmlFor={`done-${entry.id}`} className="text-sm text-foreground/80">Completed</label>
        <div className="ml-auto w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[editCluster] }} />
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onDismiss} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-surface-border/60 hover:border-surface-border transition-colors">
          Dismiss
        </button>
        <button onClick={handleConfirm} className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors">
          Confirm {'\u21b5'}
        </button>
      </div>
    </div>
  );
}
