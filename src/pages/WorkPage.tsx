import { useState } from 'react';
import { useStore } from '../lib/store';
import { TaskRow } from '../components/work/TaskRow';
import { AutomationSection } from '../components/work/AutomationSection';
import { generateId } from '../lib/utils';

export function WorkPage() {
  const { work, addWorkTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  if (!work) return <div className="text-muted-foreground">Loading...</div>;

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-foreground">Work</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md"
        >
          + Task
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-card border border-surface-border rounded-lg p-3 mb-4 space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-surface-base border border-surface-border rounded px-2 py-1.5 text-sm text-foreground outline-none"
            autoFocus
          />
          <input
            type="date"
            value={due}
            onChange={e => setDue(e.target.value)}
            className="w-full bg-surface-base border border-surface-border rounded px-2 py-1.5 text-sm text-foreground outline-none"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md">Save</button>
            <button onClick={() => setShowForm(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {work.tasks.map(task => (
          <TaskRow key={task.id} task={task} />
        ))}
        {work.tasks.length === 0 && (
          <div className="text-sm text-muted-foreground">No tasks yet.</div>
        )}
      </div>

      <AutomationSection />
    </div>
  );
}
