import { useState, useRef, useEffect, useCallback } from 'react';
import type { Topic } from '../../lib/types';
import { useStore } from '../../lib/store';

interface Props {
  clusterId: string;
  topics: Topic[];
}

export function TopicsSection({ clusterId, topics }: Props) {
  const toggleTopic = useStore(s => s.toggleTopic);
  const addTopic = useStore(s => s.addTopic);
  const removeTopic = useStore(s => s.removeTopic);

  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingTopic) inputRef.current?.focus();
  }, [addingTopic]);

  const handleAddTopic = async () => {
    const label = newTopicLabel.trim();
    if (!label) { setAddingTopic(false); return; }
    await addTopic(clusterId, label);
    setNewTopicLabel('');
    setAddingTopic(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTopic();
    if (e.key === 'Escape') { setAddingTopic(false); setNewTopicLabel(''); }
  };

  // Sync selectedTopic with live store data so subtopics update inside modal
  const liveTopic = selectedTopic
    ? topics.find(t => t.id === selectedTopic.id) ?? null
    : null;

  return (
    <div className="mb-6">
      <div className="space-y-1">
        {topics.map(topic => (
          <TopicRow
            key={topic.id}
            clusterId={clusterId}
            topic={topic}
            onToggle={() => toggleTopic(clusterId, topic.id)}
            onRemove={() => removeTopic(clusterId, topic.id)}
            onOpenSubtopics={() => setSelectedTopic(topic)}
          />
        ))}
      </div>

      {addingTopic ? (
        <div className="flex items-center gap-2 mt-2 px-2">
          <input
            ref={inputRef}
            value={newTopicLabel}
            onChange={e => setNewTopicLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddTopic}
            placeholder="Topic name…"
            className="flex-1 bg-surface-muted text-foreground text-sm rounded-md px-3 py-1.5 outline-none border border-surface-border focus:border-blue-500 placeholder:text-muted-foreground"
          />
          <button
            onMouseDown={e => { e.preventDefault(); handleAddTopic(); }}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
          >
            Add
          </button>
          <button
            onMouseDown={() => { setAddingTopic(false); setNewTopicLabel(''); }}
            className="text-xs text-muted-foreground hover:text-foreground px-1"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingTopic(true)}
          className="mt-2 ml-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-base leading-none">+</span> Add topic
        </button>
      )}

      {liveTopic && (
        <SubtopicModal
          clusterId={clusterId}
          topic={liveTopic}
          onClose={() => setSelectedTopic(null)}
        />
      )}
    </div>
  );
}

function TopicRow({
  clusterId,
  topic,
  onToggle,
  onRemove,
  onOpenSubtopics,
}: {
  clusterId: string;
  topic: Topic;
  onToggle: () => void;
  onRemove: () => void;
  onOpenSubtopics: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const subtopicCount = topic.subtopics?.length ?? 0;
  const subtopicDone = topic.subtopics?.filter(s => s.done).length ?? 0;

  return (
    <div
      className="group flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        type="checkbox"
        checked={topic.done}
        onChange={onToggle}
        className="accent-blue-500 shrink-0 cursor-pointer"
      />
      <span
        className={`flex-1 text-sm cursor-pointer select-none ${topic.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}
        onClick={onOpenSubtopics}
      >
        {topic.label}
      </span>

      {subtopicCount > 0 && (
        <span
          className="text-xs text-muted-foreground cursor-pointer hover:text-foreground shrink-0"
          onClick={onOpenSubtopics}
        >
          {subtopicDone}/{subtopicCount}
        </span>
      )}

      <button
        onClick={onOpenSubtopics}
        className={`text-muted-foreground hover:text-blue-400 text-xs shrink-0 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}
        title="Subtopics"
      >
        ›
      </button>

      <button
        onClick={onRemove}
        className={`text-muted-foreground hover:text-red-400 text-xs shrink-0 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}
        title="Remove topic"
      >
        ✕
      </button>
    </div>
  );
}

function SubtopicModal({
  clusterId,
  topic,
  onClose,
}: {
  clusterId: string;
  topic: Topic;
  onClose: () => void;
}) {
  const addSubtopic = useStore(s => s.addSubtopic);
  const removeSubtopic = useStore(s => s.removeSubtopic);
  const toggleSubtopic = useStore(s => s.toggleSubtopic);

  const [newLabel, setNewLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) return;
    await addSubtopic(clusterId, topic.id, label);
    setNewLabel('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') onClose();
  };

  const subtopics = topic.subtopics ?? [];
  const doneCount = subtopics.filter(s => s.done).length;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        className="relative w-full max-w-md mx-4 bg-surface-card border border-surface-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-surface-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Subtopics</p>
              <h2 className="text-base font-semibold text-foreground leading-snug">{topic.label}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-lg leading-none mt-0.5 shrink-0"
            >
              ✕
            </button>
          </div>
          {subtopics.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{doneCount} / {subtopics.length} done</span>
                <span>{Math.round((doneCount / subtopics.length) * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(doneCount / subtopics.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Subtopic list */}
        <div className="px-6 py-3 max-h-72 overflow-y-auto space-y-0.5">
          {subtopics.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">No subtopics yet. Add one below.</p>
          )}
          {subtopics.map(sub => (
            <div key={sub.id} className="group flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-surface-hover">
              <input
                type="checkbox"
                checked={sub.done}
                onChange={() => toggleSubtopic(clusterId, topic.id, sub.id)}
                className="accent-blue-500 shrink-0 cursor-pointer"
              />
              <span className={`flex-1 text-sm ${sub.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {sub.label}
              </span>
              <button
                onClick={() => removeSubtopic(clusterId, topic.id, sub.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 text-xs transition-opacity shrink-0"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add subtopic */}
        <div className="px-6 pb-6 pt-3 border-t border-surface-border">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a subtopic…"
              className="flex-1 bg-surface-muted text-foreground text-sm rounded-lg px-3 py-2 outline-none border border-surface-border focus:border-blue-500 placeholder:text-muted-foreground"
            />
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
