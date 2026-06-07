import { useState, useRef, useEffect } from 'react';
import type { Resource } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  resources: Resource[];
}

export function ResourcesSection({ clusterId, resources }: Props) {
  const toggleResource = useStore(s => s.toggleResource);
  const addResource = useStore(s => s.addResource);
  const removeResource = useStore(s => s.removeResource);

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) { setAdding(false); return; }
    await addResource(clusterId, label);
    setNewLabel('');
    setAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setNewLabel(''); }
  };

  return (
    <div className="mb-6">
      <div className="space-y-1">
        {resources.map(resource => (
          <div key={resource.id} className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/[0.03] transition-colors">
            <button
              type="button"
              onClick={() => toggleResource(clusterId, resource.id)}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                resource.done
                  ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
                  : 'border-surface-border hover:border-blue-500/40'
              }`}
              aria-pressed={resource.done}
            >
              {resource.done && <span className="text-[10px]">{'\u2713'}</span>}
            </button>
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${resource.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {resource.label}
              </span>
            </div>
            {resource.finished_date && (
              <span className="text-xs text-emerald-500/70 flex-shrink-0">
                {resource.finished_date}
              </span>
            )}
            <button
              onClick={() => removeResource(clusterId, resource.id)}
              className="text-muted-foreground hover:text-red-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              {'\u2715'}
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2 mt-2 px-2">
          <input
            ref={inputRef}
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="Resource name\u2026"
            className="flex-1 bg-surface-muted/60 text-foreground text-sm rounded-lg px-3 py-1.5 outline-none border border-surface-border/60 focus:border-blue-500/50 placeholder:text-muted-foreground/60"
          />
          <button
            onMouseDown={e => { e.preventDefault(); handleAdd(); }}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
          >
            Add
          </button>
          <button
            onMouseDown={() => { setAdding(false); setNewLabel(''); }}
            className="text-xs text-muted-foreground hover:text-foreground px-1"
          >
            {'\u2715'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 ml-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-base leading-none">+</span> Add resource
        </button>
      )}
    </div>
  );
}
