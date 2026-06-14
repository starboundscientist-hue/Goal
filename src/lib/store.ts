import { create } from 'zustand';
import type { Progress, WorkData, PendingGitEntry, LogEntry, WorkTask, Subtask, AutomationEntry, Subtopic } from './types';
import * as api from './api';

interface AppStore {
  progress: Progress | null;
  work: WorkData | null;
  pendingGitEntries: PendingGitEntry[];
  llmOnline: boolean;
  lastGitScan: Date | null;
  loading: boolean;
  theme: 'dark' | 'light';

  setProgress: (p: Progress) => void;
  setWork: (w: WorkData) => void;
  setPendingGitEntries: (entries: PendingGitEntry[]) => void;
  setLlmOnline: (online: boolean) => void;
  setLastGitScan: (d: Date) => void;
  toggleTheme: () => void;

  confirmLogEntry: (entry: LogEntry) => Promise<void>;
  dismissPendingEntry: (id: string) => void;
  toggleTopic: (clusterId: string, topicId: string) => Promise<void>;
  addTopic: (clusterId: string, label: string) => Promise<void>;
  removeTopic: (clusterId: string, topicId: string) => Promise<void>;
  reorderTopics: (clusterId: string, orderedIds: string[]) => Promise<void>;
  addSubtopic: (clusterId: string, topicId: string, label: string) => Promise<void>;
  removeSubtopic: (clusterId: string, topicId: string, subtopicId: string) => Promise<void>;
  toggleSubtopic: (clusterId: string, topicId: string, subtopicId: string) => Promise<void>;
  updateSubtopic: (clusterId: string, topicId: string, subtopicId: string, patch: Partial<Subtopic>) => Promise<void>;
  reorderSubtopics: (clusterId: string, topicId: string, orderedIds: string[]) => Promise<void>;
  toggleResource: (clusterId: string, resourceId: string) => Promise<void>;
  addResource: (clusterId: string, label: string) => Promise<void>;
  removeResource: (clusterId: string, resourceId: string) => Promise<void>;
  reorderResources: (clusterId: string, orderedIds: string[]) => Promise<void>;
  updateProjectStatus: (clusterId: string, projectId: string, status: string) => Promise<void>;
  addProject: (clusterId: string, label: string) => Promise<void>;
  removeProject: (clusterId: string, projectId: string) => Promise<void>;
  reorderProjects: (clusterId: string, orderedIds: string[]) => Promise<void>;
  updateChecklist: (clusterId: string, field: string, value: boolean) => Promise<void>;
  addWorkTask: (task: WorkTask) => Promise<void>;
  updateWorkTaskStatus: (id: string, status: string) => Promise<void>;
  updateWorkTask: (id: string, patch: Partial<WorkTask>) => Promise<void>;
  reorderWorkTasks: (orderedIds: string[]) => Promise<void>;
  addSubtask: (taskId: string, label: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  removeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  reorderSubtasks: (taskId: string, orderedIds: string[]) => Promise<void>;
  addAutomationEntry: (entry: AutomationEntry) => Promise<void>;
}

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return 'dark';
}

export const useStore = create<AppStore>((set, get) => ({
  progress: null,
  work: null,
  pendingGitEntries: [],
  llmOnline: false,
  lastGitScan: null,
  loading: true,
  theme: getInitialTheme(),

  setProgress: (p) => set({ progress: p }),
  setWork: (w) => set({ work: w }),
  setPendingGitEntries: (entries) => set({ pendingGitEntries: entries }),
  setLlmOnline: (online) => set({ llmOnline: online }),
  setLastGitScan: (d) => set({ lastGitScan: d }),

  confirmLogEntry: async (entry) => {
    const { progress } = get();
    if (!progress) return;
    const updated = {
      ...progress,
      logs: [...progress.logs, entry]
    };
    set({ progress: updated });
    set(state => ({
      pendingGitEntries: state.pendingGitEntries.filter(p => p.id !== entry.id)
    }));
    await api.saveProgress(updated);
  },

  dismissPendingEntry: (id) => {
    set(state => ({
      pendingGitEntries: state.pendingGitEntries.filter(p => p.id !== id)
    }));
  },

  toggleTopic: async (clusterId, topicId) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: clusters[clusterId].topics.map((t: any) =>
            t.id === topicId ? { ...t, done: !t.done } : t
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  addTopic: async (clusterId, label) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const topics: any[] = clusters[clusterId]?.topics ?? [];
    const nextOrder = topics.length > 0 ? Math.max(...topics.map((t: any) => t.order ?? 0)) + 1 : 0;
    const newTopic = { id: `topic_${Date.now()}`, label, done: false, order: nextOrder, subtopics: [] };
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: [...clusters[clusterId].topics, newTopic]
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  removeTopic: async (clusterId, topicId) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: clusters[clusterId].topics.filter((t: any) => t.id !== topicId)
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  reorderTopics: async (clusterId, orderedIds) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const topics: any[] = clusters[clusterId]?.topics ?? [];
    const reindexed = orderedIds.map((id, i) => {
      const topic = topics.find((t: any) => t.id === id);
      return topic ? { ...topic, order: i } : null;
    }).filter(Boolean);
    const remaining = topics.filter((t: any) => !orderedIds.includes(t.id));
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: [...reindexed, ...remaining]
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  addSubtopic: async (clusterId, topicId, label) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const topic = clusters[clusterId]?.topics?.find((t: any) => t.id === topicId);
    const subs: any[] = topic?.subtopics ?? [];
    const nextOrder = subs.length > 0 ? Math.max(...subs.map((s: any) => s.order ?? 0)) + 1 : 0;
    const newSub = { id: `sub_${Date.now()}`, label, done: false, order: nextOrder };
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: clusters[clusterId].topics.map((t: any) =>
            t.id === topicId
              ? { ...t, subtopics: [...(t.subtopics ?? []), newSub] }
              : t
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  removeSubtopic: async (clusterId, topicId, subtopicId) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: clusters[clusterId].topics.map((t: any) =>
            t.id === topicId
              ? { ...t, subtopics: (t.subtopics ?? []).filter((s: any) => s.id !== subtopicId) }
              : t
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  toggleSubtopic: async (clusterId, topicId, subtopicId) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: clusters[clusterId].topics.map((t: any) =>
            t.id === topicId
              ? {
                  ...t,
                  subtopics: (t.subtopics ?? []).map((s: any) =>
                    s.id === subtopicId ? { ...s, done: !s.done } : s
                  )
                }
              : t
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  updateSubtopic: async (clusterId, topicId, subtopicId, patch) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: clusters[clusterId].topics.map((t: any) =>
            t.id === topicId
              ? { ...t, subtopics: (t.subtopics ?? []).map((s: any) =>
                  s.id === subtopicId ? { ...s, ...patch } : s
                ) }
              : t
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  reorderSubtopics: async (clusterId, topicId, orderedIds) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const topic = clusters[clusterId]?.topics?.find((t: any) => t.id === topicId);
    const subs: any[] = topic?.subtopics ?? [];
    const reindexed = orderedIds.map((id, i) => {
      const sub = subs.find((s: any) => s.id === id);
      return sub ? { ...sub, order: i } : null;
    }).filter(Boolean);
    const remaining = subs.filter((s: any) => !orderedIds.includes(s.id));
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          topics: clusters[clusterId].topics.map((t: any) =>
            t.id === topicId ? { ...t, subtopics: [...reindexed, ...remaining] } : t
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  toggleResource: async (clusterId, resourceId) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          resources: clusters[clusterId].resources.map((r: any) =>
            r.id === resourceId ? { ...r, done: !r.done, finished_date: !r.done ? new Date().toISOString().split('T')[0] : undefined } : r
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  addResource: async (clusterId, label) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const resources: any[] = clusters[clusterId]?.resources ?? [];
    const nextOrder = resources.length > 0 ? Math.max(...resources.map((r: any) => r.order ?? 0)) + 1 : 0;
    const newResource = { id: `res_${Date.now()}`, label, done: false, order: nextOrder };
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          resources: [...clusters[clusterId].resources, newResource]
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  removeResource: async (clusterId, resourceId) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          resources: clusters[clusterId].resources.filter((r: any) => r.id !== resourceId)
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  reorderResources: async (clusterId, orderedIds) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const resources: any[] = clusters[clusterId]?.resources ?? [];
    const reindexed = orderedIds.map((id, i) => {
      const resource = resources.find((r: any) => r.id === id);
      return resource ? { ...resource, order: i } : null;
    }).filter(Boolean);
    const remaining = resources.filter((r: any) => !orderedIds.includes(r.id));
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          resources: [...reindexed, ...remaining]
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  updateProjectStatus: async (clusterId, projectId, status) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          projects: clusters[clusterId].projects.map((p: any) =>
            p.id === projectId ? {
              ...p,
              status: status as any,
              finished_date: status === 'done' ? new Date().toISOString().split('T')[0] : p.finished_date
            } : p
          )
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  addProject: async (clusterId, label) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const projects: any[] = clusters[clusterId]?.projects ?? [];
    const nextOrder = projects.length > 0 ? Math.max(...projects.map((p: any) => p.order ?? 0)) + 1 : 0;
    const newProject = { id: `proj_${Date.now()}`, label, status: 'not_started' as const, order: nextOrder };
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          projects: [...clusters[clusterId].projects, newProject]
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  removeProject: async (clusterId, projectId) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          projects: clusters[clusterId].projects.filter((p: any) => p.id !== projectId)
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  reorderProjects: async (clusterId, orderedIds) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const projects: any[] = clusters[clusterId]?.projects ?? [];
    const reindexed = orderedIds.map((id, i) => {
      const project = projects.find((p: any) => p.id === id);
      return project ? { ...project, order: i } : null;
    }).filter(Boolean);
    const remaining = projects.filter((p: any) => !orderedIds.includes(p.id));
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          projects: [...reindexed, ...remaining]
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  updateChecklist: async (clusterId, field, value) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...clusters[clusterId],
          checklist: {
            ...clusters[clusterId].checklist,
            [field]: value
          }
        }
      }
    };
    set({ progress: updated });
    await api.saveProgress(updated);
  },

  addWorkTask: async (task) => {
    const { work } = get();
    if (!work) return;
    const nextOrder = work.tasks.length > 0 ? Math.max(...work.tasks.map(t => t.order ?? 0)) + 1 : 0;
    const taskWithOrder = { ...task, order: nextOrder };
    const updated = { ...work, tasks: [...work.tasks, taskWithOrder] };
    set({ work: updated });
    await api.saveWork(updated);
  },

  updateWorkTaskStatus: async (id, status) => {
    const { work } = get();
    if (!work) return;
    const updated = {
      ...work,
      tasks: work.tasks.map(t => t.id === id ? { ...t, status: status as any } : t)
    };
    set({ work: updated });
    await api.saveWork(updated);
  },

  updateWorkTask: async (id, patch) => {
    const { work } = get();
    if (!work) return;
    const updated = {
      ...work,
      tasks: work.tasks.map(t => t.id === id ? { ...t, ...patch } : t)
    };
    set({ work: updated });
    await api.saveWork(updated);
  },

  reorderWorkTasks: async (orderedIds) => {
    const { work } = get();
    if (!work) return;
    const tasks: any[] = work.tasks;
    const reindexed = orderedIds.map((id, i) => {
      const task = tasks.find((t: any) => t.id === id);
      return task ? { ...task, order: i } : null;
    }).filter(Boolean);
    const remaining = tasks.filter((t: any) => !orderedIds.includes(t.id));
    const updated = { ...work, tasks: [...reindexed, ...remaining] };
    set({ work: updated });
    await api.saveWork(updated);
  },

  addSubtask: async (taskId, label) => {
    const { work } = get();
    if (!work) return;
    const updated = {
      ...work,
      tasks: work.tasks.map(t => {
        if (t.id !== taskId) return t;
        const existing = t.subtasks ?? [];
        const nextOrder = existing.length > 0 ? Math.max(...existing.map(s => s.order)) + 1 : 0;
        const newSub: Subtask = {
          id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          label,
          done: false,
          order: nextOrder,
        };
        return { ...t, subtasks: [...existing, newSub] };
      })
    };
    set({ work: updated });
    await api.saveWork(updated);
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const { work } = get();
    if (!work) return;
    const updated = {
      ...work,
      tasks: work.tasks.map(t => {
        if (t.id !== taskId) return t;
        const existing = t.subtasks ?? [];
        return {
          ...t,
          subtasks: existing.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s)
        };
      })
    };
    set({ work: updated });
    await api.saveWork(updated);
  },

  removeSubtask: async (taskId, subtaskId) => {
    const { work } = get();
    if (!work) return;
    const updated = {
      ...work,
      tasks: work.tasks.map(t => {
        if (t.id !== taskId) return t;
        const existing = t.subtasks ?? [];
        return { ...t, subtasks: existing.filter(s => s.id !== subtaskId) };
      })
    };
    set({ work: updated });
    await api.saveWork(updated);
  },

  reorderSubtasks: async (taskId, orderedIds) => {
    const { work } = get();
    if (!work) return;
    const updated = {
      ...work,
      tasks: work.tasks.map(t => {
        if (t.id !== taskId) return t;
        const existing = t.subtasks ?? [];
        const byId = new Map(existing.map(s => [s.id, s]));
        const reordered: Subtask[] = orderedIds
          .map((id, idx) => {
            const sub = byId.get(id);
            return sub ? { ...sub, order: idx } : null;
          })
          .filter((s): s is Subtask => s !== null);
        return { ...t, subtasks: reordered };
      })
    };
    set({ work: updated });
    await api.saveWork(updated);
  },

  addAutomationEntry: async (entry) => {
    const { work } = get();
    if (!work) return;
    const updated = { ...work, automation_log: [...work.automation_log, entry] };
    set({ work: updated });
    await api.saveWork(updated);
  },

  toggleTheme: () => {
    set(state => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return { theme: next };
    });
  }
}));
