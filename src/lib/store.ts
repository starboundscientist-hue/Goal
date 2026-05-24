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

  setProgress: (p: Progress) => void;
  setWork: (w: WorkData) => void;
  setPendingGitEntries: (entries: PendingGitEntry[]) => void;
  setLlmOnline: (online: boolean) => void;
  setLastGitScan: (d: Date) => void;

  confirmLogEntry: (entry: LogEntry) => Promise<void>;
  dismissPendingEntry: (id: string) => void;
  toggleTopic: (clusterId: string, topicId: string) => Promise<void>;
  toggleResource: (clusterId: string, resourceId: string) => Promise<void>;
  updateProjectStatus: (clusterId: string, projectId: string, status: string) => Promise<void>;
  updateChecklist: (clusterId: string, field: string, value: boolean) => Promise<void>;
  addWorkTask: (task: WorkTask) => Promise<void>;
  updateWorkTaskStatus: (id: string, status: string) => Promise<void>;
  addAutomationEntry: (entry: AutomationEntry) => Promise<void>;
}

export const useStore = create<AppStore>((set, get) => ({
  progress: null,
  work: null,
  pendingGitEntries: [],
  llmOnline: false,
  lastGitScan: null,
  loading: true,

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
  }
}));
