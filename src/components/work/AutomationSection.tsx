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
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">Automation</h3>
      <div className="space-y-1 mb-3">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 px-2 py-1.5 text-sm">
            <span className="text-zinc-500">{entry.date}</span>
            <span className="text-zinc-100 flex-1">{entry.description}</span>
            <span className="text-emerald-400">+{entry.hours_saved_per_week}h/week</span>
          </div>
        ))}
      </div>
      <div className="text-sm text-zinc-400 mb-3">
        Total freed: <span className="text-emerald-400 font-medium">{totalSaved}h/week</span>
      </div>

      {showForm ? (
        <div className="bg-surface-card border border-surface-border rounded-lg p-3 space-y-2">
          <input
            type="text" value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Jira to Slack standup script"
            className="w-full bg-surface-base border border-surface-border rounded px-2 py-1.5 text-sm text-zinc-100 outline-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="number" step="0.25" min="0" value={hoursSaved}
              onChange={e => setHoursSaved(parseFloat(e.target.value))}
              placeholder="Hours saved/week"
              className="w-32 bg-surface-base border border-surface-border rounded px-2 py-1.5 text-sm text-zinc-100 outline-none"
            />
            <span className="text-xs text-zinc-500">hours/week saved</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md">Save</button>
            <button onClick={() => setShowForm(false)} className="text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs text-zinc-500 hover:text-zinc-300 border border-surface-border rounded-md px-3 py-1.5">
          + Log automation
        </button>
      )}
    </div>
  );
}
