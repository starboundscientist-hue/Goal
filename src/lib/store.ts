import { create } from 'zustand';
import type { Progress, WorkData, PendingGitEntry, LogEntry, WorkTask, AutomationEntry } from './types';
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
  addSubtopic: (clusterId: string, topicId: string, label: string) => Promise<void>;
  removeSubtopic: (clusterId: string, topicId: string, subtopicId: string) => Promise<void>;
  toggleSubtopic: (clusterId: string, topicId: string, subtopicId: string) => Promise<void>;
  toggleResource: (clusterId: string, resourceId: string) => Promise<void>;
  updateProjectStatus: (clusterId: string, projectId: string, status: string) => Promise<void>;
  updateChecklist: (clusterId: string, field: string, value: boolean) => Promise<void>;
  addWorkTask: (task: WorkTask) => Promise<void>;
  updateWorkTaskStatus: (id: string, status: string) => Promise<void>;
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
    const newTopic = { id: `topic_${Date.now()}`, label, done: false, subtopics: [] };
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

  addSubtopic: async (clusterId, topicId, label) => {
    const { progress } = get();
    if (!progress) return;
    const clusters = progress.clusters as Record<string, any>;
    const newSub = { id: `sub_${Date.now()}`, label, done: false };
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
    const updated = { ...work, tasks: [...work.tasks, task] };
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
