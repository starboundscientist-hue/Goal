import { useState } from 'react';
import type { AutomationEntry } from '../../lib/types';
import { useStore } from '../../lib/store';
import { generateId } from '../../lib/utils';

export function AutomationSection() {
  const { work, addAutomationEntry } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [hoursSaved, setHoursSaved] = useState(0);

  const entries = work?.automation_log || [];
  const totalSaved = entries.reduce((sum, e) => sum + e.hours_saved_per_week, 0);

  const handleSave = () => {
    if (!description.trim() || hoursSaved <= 0) return;
    addAutomationEntry({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      description: description.trim(),
      hours_saved_per_week: hoursSaved,
    });
    setDescription('');
    setHoursSaved(0);
    setShowForm(false);
  };

  return (
    <div className="mt-8">
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium mb-3">Automation</h3>
      <div className="space-y-1 mb-3">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 px-2 py-1.5 text-sm rounded-lg hover:bg-white/[0.02] transition-colors">
            <span className="text-muted-foreground/50">{entry.date}</span>
            <span className="text-foreground/70 flex-1">{entry.description}</span>
            <span className="text-emerald-400/70">+{entry.hours_saved_per_week}h/week</span>
          </div>
        ))}
      </div>
      <div className="text-sm text-muted-foreground/60 mb-3">
        Total freed: <span className="text-emerald-400/80 font-medium">{totalSaved}h/week</span>
      </div>

      {showForm ? (
        <div className="bg-surface-card/90 backdrop-blur-xl border border-surface-border/40 rounded-xl p-3 space-y-2">
          <input
            type="text" value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Jira to Slack standup script"
            className="w-full bg-surface-base/90 border border-surface-border/40 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/40"
          />
          <div className="flex items-center gap-2">
            <input
              type="number" step="0.25" min="0" value={hoursSaved}
              onChange={e => setHoursSaved(parseFloat(e.target.value))}
              placeholder="Hours saved/week"
              className="w-32 bg-surface-base/90 border border-surface-border/40 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/40"
            />
            <span className="text-xs text-muted-foreground/50">hours/week saved</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="text-xs text-muted-foreground/60 hover:text-foreground/80 px-3 py-1.5 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs text-muted-foreground/60 hover:text-foreground/80 border border-surface-border/40 hover:border-surface-border/60 rounded-lg px-3 py-1.5 transition-all">
          + Log automation
        </button>
      )}
    </div>
  );
}
