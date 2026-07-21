import type { Progress, WorkData, ParsedLogEntry, CommitGroup, MotivationData, SprintData, ResourceWithCluster } from './types';
import { parseLLMResponse } from './utils';

const BASE = '/api';

export async function loadProgress(): Promise<Progress> {
  const res = await fetch(`${BASE}/progress`);
  if (!res.ok) throw new Error('Failed to load progress');
  return res.json();
}

export async function saveProgress(data: Progress): Promise<void> {
  await fetch(`${BASE}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function loadWork(): Promise<WorkData> {
  const res = await fetch(`${BASE}/work`);
  if (!res.ok) throw new Error('Failed to load work');
  return res.json();
}

export async function saveWork(data: WorkData): Promise<void> {
  await fetch(`${BASE}/work`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function parseText(text: string): Promise<ParsedLogEntry | null> {
  const res = await fetch(`${BASE}/llm/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  if (data.offline || !data.raw) return null;
  return parseLLMResponse(data.raw, null);
}

export async function runGitScan(): Promise<CommitGroup[]> {
  const res = await fetch(`${BASE}/git/scan`, { method: 'POST' });
  const data = await res.json();
  return data.groups || [];
}

export async function runCoach(logsText: string): Promise<string> {
  const res = await fetch(`${BASE}/llm/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logsText })
  });
  const data = await res.json();
  return data.text || 'Coach unavailable.';
}

export async function loadSprints(): Promise<SprintData | null> {
  try {
    const res = await fetch(`${BASE}/sprints`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function saveSprints(data: SprintData): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/sprints`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadMotivation(): Promise<MotivationData | null> {
  try {
    const res = await fetch(`${BASE}/motivation`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function checkAI(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/llm/health`);
    const data = await res.json();
    return data.online === true;
  } catch {
    return false;
  }
}

export async function loadAllResources(): Promise<ResourceWithCluster[]> {
  try {
    const res = await fetch(`${BASE}/progress/resources`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function suggestSubtasks(title: string, context?: string): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/llm/suggest-subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, context }),
    });
    const data = await res.json();
    if (data.offline || !Array.isArray(data.subtasks)) return [];
    return data.subtasks as string[];
  } catch {
    return [];
  }
}
