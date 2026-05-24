import { useState, useEffect, useRef } from 'react';
import type { AnyClusterId, ParsedLogEntry, LogEntry } from '../../lib/types';
import { CLUSTER_COLORS, CLUSTER_LABELS } from '../../lib/types';
import { useStore } from '../../lib/store';
import * as api from '../../lib/api';
import { generateId } from '../../lib/utils';

type State = 'input' | 'loading' | 'preview' | 'manual';

const CLUSTERS: AnyClusterId[] = ['foundations', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'work'];

export function SemanticLogger() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>('input');
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState<ParsedLogEntry | null>(null);
  const [editCluster, setEditCluster] = useState<AnyClusterId>('unknown');
  const [editTopic, setEditTopic] = useState('');
  const [editHours, setEditHours] = useState(1.0);
  const [editDone, setEditDone] = useState(true);

  const { confirmLogEntry, llmOnline } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') { e.preventDefault(); setOpen(true); }
    };
    const onEvent = () => setOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('open-logger', onEvent);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('open-logger', onEvent);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setState('input');
        setInputText('');
        setParsed(null);
        setEditTopic('');
        setEditHours(1.0);
        setEditDone(true);
        setEditCluster('unknown');
      }, 200);
    } else {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    if (!llmOnline) {
      setEditCluster('unknown');
      setEditTopic(inputText.slice(0, 60));
      setState('manual');
      return;
    }

    setState('loading');
    const result = await api.parseText(inputText);

    if (result) {
      setParsed(result);
      setEditCluster(result.cluster_id);
      setEditTopic(result.topic_guess);
      setEditHours(result.hours);
      setEditDone(result.is_completed);
      setState('preview');
    } else {
      setEditCluster('unknown');
      setEditTopic(inputText.slice(0, 60));
      setState('manual');
    }
  };

  const handleConfirm = () => {
    const entry: LogEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      cluster: editCluster,
      topic: editTopic,
      hours: editHours,
      is_completed: editDone,
      source: 'manual',
      notes: inputText
    };
    confirmLogEntry(entry);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-surface-card border border-surface-border rounded-lg max-w-lg w-full mx-4 shadow-2xl">
        <div className="p-5">
          <h2 className="text-sm font-medium text-zinc-100 mb-3">
            {state === 'input' && 'What did you work on?'}
            {state === 'loading' && 'Parsing...'}
            {state === 'preview' && 'Confirm log entry'}
            {state === 'manual' && 'Log session manually'}
          </h2>

          {state === 'input' && (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
                placeholder="freeform text describing your session, e.g. Triton matmul kernel for 2 hours"
                className="w-full bg-surface-base border border-surface-border rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 resize-none min-h-[80px] outline-none focus:border-zinc-600"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">
                  {llmOnline ? 'Ollama online \u00b7 auto-tagging enabled' : 'Ollama offline \u00b7 will use manual form'}
                </span>
                <button onClick={handleSubmit} className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md">
                  Parse {'\u21b5'}
                </button>
              </div>
            </div>
          )}

          {state === 'loading' && (
            <div className="space-y-2 py-2">
              <div className="h-4 w-3/4 bg-surface-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-surface-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-surface-muted rounded animate-pulse" />
            </div>
          )}

          {state === 'preview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Cluster</label>
                  <select
                    value={editCluster}
                    onChange={e => setEditCluster(e.target.value as AnyClusterId)}
                    className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100 outline-none"
                  >
                    {CLUSTERS.map(c => (
                      <option key={c} value={c}>{CLUSTER_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Hours</label>
                  <input
                    type="number" step="0.5" min="0.5" max="12"
                    value={editHours}
                    onChange={e => setEditHours(parseFloat(e.target.value))}
                    className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Topic</label>
                <input
                  type="text" value={editTopic}
                  onChange={e => setEditTopic(e.target.value)}
                  className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="done" checked={editDone}
                  onChange={e => setEditDone(e.target.checked)} className="accent-blue-500" />
                <label htmlFor="done" className="text-sm text-zinc-300">Completed / done</label>
                <div className="ml-auto w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[editCluster] }} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setState('manual')}
                  className="text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-md border border-surface-border">
                  Edit manually
                </button>
                <button onClick={handleConfirm} className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md">
                  Confirm {'\u21b5'}
                </button>
              </div>
            </div>
          )}

          {state === 'manual' && (
            <div className="space-y-3">
              {!llmOnline && (
                <p className="text-xs text-amber-400">Ollama offline \u2014 fill in manually</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Cluster</label>
                  <select
                    value={editCluster}
                    onChange={e => setEditCluster(e.target.value as AnyClusterId)}
                    className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100 outline-none"
                  >
                    {CLUSTERS.map(c => (
                      <option key={c} value={c}>{CLUSTER_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Hours</label>
                  <input
                    type="number" step="0.5" min="0.5" max="12"
                    value={editHours}
                    onChange={e => setEditHours(parseFloat(e.target.value))}
                    className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Topic</label>
                <input
                  type="text" value={editTopic}
                  onChange={e => setEditTopic(e.target.value)}
                  placeholder="e.g. Kalman filter implementation"
                  className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="done2" checked={editDone}
                  onChange={e => setEditDone(e.target.checked)} className="accent-blue-500" />
                <label htmlFor="done2" className="text-sm text-zinc-300">Completed</label>
              </div>
              <div className="flex justify-end">
                <button onClick={handleConfirm} className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md">
                  Save entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
