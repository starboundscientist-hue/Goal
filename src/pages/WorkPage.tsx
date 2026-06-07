import { useState } from 'react';
import { useStore } from '../lib/store';
import { TaskRow } from '../components/work/TaskRow';
import { AutomationSection } from '../components/work/AutomationSection';
import { TaskDetailModal } from '../components/work/TaskDetailModal';
import { generateId } from '../lib/utils';

export function WorkPage() {
  const { work, addWorkTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (!work) return <div className="text-muted-foreground/50">Loading...</div>;

  const handleSave = () => {
    if (!title.trim()) return;
    addWorkTask({
      id: generateId(),
      title: title.trim(),
      status: 'todo',
      due: due || undefined,
      created_date: new Date().toISOString().split('T')[0],
    });
    setTitle('');
    setDue('');
    setShowForm(false);
  };

  const liveTask = selectedTaskId
    ? work.tasks.find(t => t.id === selectedTaskId) ?? null
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-foreground/90">Work</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          + Task
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-card/40 backdrop-blur-xl border border-surface-border/40 rounded-xl p-3 mb-4 space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-surface-base/60 border border-surface-border/40 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/40"
            autoFocus
          />
          <input
            type="date"
            value={due}
            onChange={e => setDue(e.target.value)}
            className="w-full bg-surface-base/60 border border-surface-border/40 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs text-white bg-blue-600/90 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="text-xs text-muted-foreground/60 hover:text-foreground/80 px-3 py-1.5 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {work.tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onOpen={() => setSelectedTaskId(task.id)}
          />
        ))}
        {work.tasks.length === 0 && (
          <div className="text-sm text-muted-foreground/50">No tasks yet.</div>
        )}
      </div>

      <AutomationSection />

      {liveTask && (
        <TaskDetailModal
          task={liveTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
