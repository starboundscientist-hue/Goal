import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates as sortableKb, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Topic, SprintData, SprintGoal } from '../../lib/types';
import { useStore } from '../../lib/store';
import { SubtopicModal } from './SubtopicModal';
import { loadSprints, saveSprints } from '../../lib/api';
import { findMatchingSprintGoal, SprintBadge } from './sprintUtils';
import { generateId } from '../../lib/utils';

interface Props {
  clusterId: string;
  topics: Topic[];
}

export function TopicsSection({ clusterId, topics }: Props) {
  const toggleTopic = useStore(s => s.toggleTopic);
  const addTopic = useStore(s => s.addTopic);
  const removeTopic = useStore(s => s.removeTopic);
  const reorderTopics = useStore(s => s.reorderTopics);

  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [addingToSprint, setAddingToSprint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSprints().then(d => {
      if (d && !d.backlog) (d as SprintData).backlog = [];
      setSprintData(d);
    });
  }, []);

  const addTopicToSprint = async (topicId: string) => {
    if (!sprintData || addingToSprint) return;
    setAddingToSprint(true);
    const topic = topics.find(t => t.id === topicId);
    if (!topic) { setAddingToSprint(false); return; }

    const goal: SprintGoal = {
      id: generateId(),
      label: topic.label,
      lane: 'main',
      status: 'not_started',
      source: { clusterId, topicId },
    };

    const current = sprintData.sprints.find(s => !s.closed);
    const updated: SprintData = {
      backlog: sprintData.backlog,
      sprints: sprintData.sprints,
    };

    if (current) {
      updated.sprints = sprintData.sprints.map(s =>
        s.id === current.id ? { ...s, goals: [...s.goals, goal] } : s
      );
    } else {
      updated.backlog = [...sprintData.backlog, goal];
    }

    const ok = await saveSprints(updated);
    if (ok) setSprintData(updated);
    setAddingToSprint(false);
  };

  useEffect(() => {
    if (addingTopic) inputRef.current?.focus();
  }, [addingTopic]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKb })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = topics.map(t => t.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const reordered = arrayMove(ids, oldIndex, newIndex);
    reorderTopics(clusterId, reordered);
  };

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

  const liveTopic = selectedTopic
    ? topics.find(t => t.id === selectedTopic.id) ?? null
    : null;

  const sorted = [...topics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="mb-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {sorted.map(topic => (
              <SortableTopicRow
                key={topic.id}
                clusterId={clusterId}
                topic={topic}
                sprintData={sprintData}
                onToggle={() => toggleTopic(clusterId, topic.id)}
                onRemove={() => removeTopic(clusterId, topic.id)}
                onOpenSubtopics={() => setSelectedTopic(topic)}
                onAddToSprint={addTopicToSprint}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {addingTopic ? (
        <div className="flex items-center gap-2 mt-2 px-2">
          <input
            ref={inputRef}
            value={newTopicLabel}
            onChange={e => setNewTopicLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddTopic}
            placeholder={'Topic name\u2026'}
            className="flex-1 bg-surface-muted/80 text-foreground text-sm rounded-lg px-3 py-1.5 outline-none border border-surface-border/60 focus:border-blue-500/50 placeholder:text-muted-foreground/60"
          />
          <button
            onMouseDown={e => { e.preventDefault(); handleAddTopic(); }}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
          >
            Add
          </button>
          <button
            onMouseDown={() => { setAddingTopic(false); setNewTopicLabel(''); }}
            className="text-xs text-muted-foreground hover:text-foreground px-1 transition-colors"
          >
            {'\u2715'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingTopic(true)}
          className="mt-2 ml-1 flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground/80 transition-colors"
        >
          <span className="text-base leading-none">+</span> Add topic
        </button>
      )}

      {liveTopic && (
        <SubtopicModal
          clusterId={clusterId}
          topic={liveTopic}
          sprintData={sprintData}
          onClose={() => setSelectedTopic(null)}
        />
      )}
    </div>
  );
}

function SortableTopicRow({ clusterId, topic, sprintData, onToggle, onRemove, onOpenSubtopics, onAddToSprint }: {
  clusterId: string;
  topic: Topic;
  sprintData: SprintData | null;
  onToggle: () => void;
  onRemove: () => void;
  onOpenSubtopics: () => void;
  onAddToSprint: (topicId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/30 hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing text-xs shrink-0 touch-none"
        title="Drag to reorder"
      >
        {'\u2630'}
      </button>
      <TopicRowContent
        topic={topic}
        sprintData={sprintData}
        clusterId={clusterId}
        onToggle={onToggle}
        onRemove={onRemove}
        onOpenSubtopics={onOpenSubtopics}
        onAddToSprint={onAddToSprint}
      />
    </div>
  );
}

function TopicRowContent({
  topic,
  sprintData,
  clusterId,
  onToggle,
  onRemove,
  onOpenSubtopics,
  onAddToSprint,
}: {
  topic: Topic;
  sprintData: SprintData | null;
  clusterId: string;
  onToggle: () => void;
  onRemove: () => void;
  onOpenSubtopics: () => void;
  onAddToSprint: (topicId: string) => void;
}) {
  const subtopicCount = topic.subtopics?.length ?? 0;
  const subtopicDone = topic.subtopics?.filter(s => s.done).length ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
          topic.done
            ? 'bg-blue-500/20 border-blue-500/60 text-blue-400'
            : 'border-surface-border/60 hover:border-blue-500/40'
        }`}
        aria-pressed={topic.done}
      >
        {topic.done && <span className="text-[10px]">{'\u2713'}</span>}
      </button>
      <span
        className={`flex-1 text-sm cursor-pointer select-none ${topic.done ? 'text-muted-foreground/50 line-through' : 'text-foreground/80'}`}
        onClick={onOpenSubtopics}
      >
        {topic.label}
      </span>

      {subtopicCount > 0 && (
        <span
          className="text-xs text-muted-foreground/50 cursor-pointer hover:text-foreground/70 shrink-0 transition-colors"
          onClick={onOpenSubtopics}
        >
          {subtopicDone}/{subtopicCount}
        </span>
      )}

      {sprintData && (() => {
        const match = findMatchingSprintGoal({ clusterId, topicId: topic.id }, sprintData);
        if (match) {
          return <SprintBadge goal={match.goal} sprintLabel={match.sprintLabel} />;
        }
        return (
          <button
            onClick={() => onAddToSprint(topic.id)}
            className="text-[10px] px-1.5 py-0.5 rounded text-muted-foreground/40 hover:text-blue-400/80 bg-surface-muted/30 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title="Add to current sprint"
          >
            {'\u002b'}
          </button>
        );
      })()}

      <button
        onClick={onOpenSubtopics}
        className="text-muted-foreground/50 hover:text-blue-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-all"
        title="Subtopics"
      >
        {'\u203a'}
      </button>

      <button
        onClick={onRemove}
        className="text-muted-foreground/50 hover:text-red-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-all"
        title="Remove topic"
      >
        {'\u2715'}
      </button>
    </>
  );
}
