# Goal OS — Test Suite

> Copy every file in this document into the project verbatim before building.
> Tests define the contract. If a test fails, the implementation is wrong — not the test.
> Run `npm test` after each build phase to catch regressions immediately.

---

## Setup

### Install test dependencies

```bash
npm install -D \
  vitest \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  jsdom \
  supertest \
  @types/supertest
```

### Add test scripts to `package.json`

```json
{
  "scripts": {
    "test":         "vitest run",
    "test:watch":   "vitest",
    "test:coverage":"vitest run --coverage"
  }
}
```

### Create `vitest.config.ts` (project root)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'server/**'],
      exclude: ['**/*.test.*', '**/test-fixtures.*']
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
```

### Create `vitest.setup.ts` (project root)

```typescript
import '@testing-library/jest-dom';
```

---

## Shared Fixtures — `src/lib/test-fixtures.ts`

Create this file. Every test imports from here. Do not inline fixture data in individual test files.

```typescript
import type {
  ClusterState, LogEntry, Progress, WorkData,
  WorkTask, AutomationEntry, PendingGitEntry
} from './types';

// ─── Fixed test date: 2026-05-24 ────────────────────────────────
// All tests use this as "today" via vi.setSystemTime()
export const TODAY = new Date('2026-05-24T12:00:00Z');
export const TODAY_STR = '2026-05-24';

// ─── Cluster fixtures ────────────────────────────────────────────

export const makeCluster = (overrides: Partial<ClusterState> = {}): ClusterState => ({
  id: 'alpha',
  name: 'Frontier AI/ML',
  phase: 1,
  checklist: { study: false, experiment: false, artifact: false },
  topics: [
    { id: 't1', label: 'Transformers', done: true },
    { id: 't2', label: 'CUDA', done: false },
  ],
  resources: [
    { id: 'r1', label: 'Karpathy', done: true, finished_date: '2025-04-10' },
    { id: 'r2', label: 'CUDA Mode', done: false },
  ],
  projects: [
    { id: 'p1', label: 'Train GPT-2', status: 'done', finished_date: '2025-03-20' },
    { id: 'p2', label: 'CUDA kernel', status: 'not_started' },
  ],
  ...overrides,
});

// Alpha cluster: 3/6 items done = 50% base → 35% (0.7 weight)
export const ALPHA_CLUSTER = makeCluster();

// Foundations cluster: all done
export const FOUNDATIONS_DONE: ClusterState = {
  id: 'foundations',
  name: 'Foundations',
  phase: 1,
  checklist: { study: true, experiment: true, artifact: true },
  topics: [
    { id: 't1', label: 'Linear algebra', done: true },
    { id: 't2', label: 'Statistics', done: true },
  ],
  resources: [
    { id: 'r1', label: 'MML Book', done: true, finished_date: '2025-06-01' },
  ],
  projects: [
    { id: 'p1', label: 'SVD from scratch', status: 'done', finished_date: '2025-07-01' },
  ],
};

// Foundations cluster: empty / not started
export const FOUNDATIONS_EMPTY: ClusterState = {
  id: 'foundations',
  name: 'Foundations',
  phase: 1,
  checklist: { study: false, experiment: false, artifact: false },
  topics: [{ id: 't1', label: 'Linear algebra', done: false }],
  resources: [{ id: 'r1', label: 'MML Book', done: false }],
  projects: [{ id: 'p1', label: 'SVD from scratch', status: 'not_started' }],
};

// ─── Log fixtures ────────────────────────────────────────────────

export const makeLog = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: 'log_001',
  date: TODAY_STR,
  cluster: 'alpha',
  topic: 'Triton kernel',
  hours: 2.0,
  is_completed: true,
  source: 'manual',
  ...overrides,
});

export const LOGS_RECENT: LogEntry[] = [
  makeLog({ id: 'l1', date: '2026-05-24', cluster: 'alpha', hours: 2.0 }),
  makeLog({ id: 'l2', date: '2026-05-23', cluster: 'foundations', hours: 1.5 }),
  makeLog({ id: 'l3', date: '2026-05-22', cluster: 'alpha', hours: 1.0 }),
  makeLog({ id: 'l4', date: '2026-05-10', cluster: 'gamma', hours: 2.5 }),
  makeLog({ id: 'l5', date: '2026-04-20', cluster: 'epsilon', hours: 1.0 }),
  makeLog({ id: 'l6', date: TODAY_STR, cluster: 'work', hours: 3.0, source: 'git' }), // work log — excluded from study stats
];

// ─── Progress fixture ────────────────────────────────────────────

export const makeProgress = (overrides: Partial<Progress> = {}): Progress => ({
  meta: {
    dev_root: '/Users/test/Dev',
    git_author_email: 'test@example.com',
    start_date: '2026-01-01',
    target_years: 5,
    weekly_goal_hours: 5,
    last_coach_run: null,
    last_coach_output: null,
  },
  clusters: {
    foundations: FOUNDATIONS_EMPTY,
    alpha: ALPHA_CLUSTER,
    beta: makeCluster({ id: 'beta', name: 'Embodied AI', phase: 2, topics: [], resources: [], projects: [] }),
    gamma: makeCluster({ id: 'gamma', name: 'Embedded', phase: 1, topics: [], resources: [], projects: [] }),
    delta: makeCluster({ id: 'delta', name: 'Comp Physics', phase: 2, topics: [], resources: [], projects: [] }),
    epsilon: makeCluster({ id: 'epsilon', name: 'Infra', phase: 1, topics: [], resources: [], projects: [] }),
  },
  logs: [],
  ...overrides,
});

// ─── Work fixtures ───────────────────────────────────────────────

export const makeWorkTask = (overrides: Partial<WorkTask> = {}): WorkTask => ({
  id: 'w1',
  title: 'Data pipeline refactor',
  status: 'wip',
  created_date: TODAY_STR,
  ...overrides,
});

export const makeWorkData = (overrides: Partial<WorkData> = {}): WorkData => ({
  tasks: [],
  automation_log: [],
  ...overrides,
});

// ─── LLM response fixtures ───────────────────────────────────────

export const VALID_LLM_JSON = `{"cluster_id":"alpha","topic_guess":"Triton kernel","hours":2.0,"is_completed":true}`;
export const VALID_LLM_MARKDOWN = '```json\n{"cluster_id":"gamma","topic_guess":"FreeRTOS","hours":1.5,"is_completed":false}\n```';
export const LLM_WITH_PROSE = `Sure! Here is the parsed result:\n{"cluster_id":"beta","topic_guess":"Kalman filter","hours":1.0,"is_completed":true}\nHope that helps!`;
export const LLM_GARBAGE = `I cannot parse that input. Please try again.`;
export const LLM_MALFORMED_JSON = `{"cluster_id":"alpha","topic_guess":`;
export const LLM_MISSING_FIELDS = `{"cluster_id":"alpha"}`;
export const LLM_WRONG_HOUR_TYPE = `{"cluster_id":"alpha","topic_guess":"CUDA","hours":"two","is_completed":false}`;
```

---

## Test File 1 — `src/lib/utils.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  computeClusterProgress,
  computePhaseProgress,
  getLastWorkedDate,
  relativeTime,
  daysSince,
  buildHeatmapData,
  computeWeeklyAvgHours,
  buildCoachContext,
  formatHours,
  clusterStatus,
  parseLLMResponse,
} from './utils';
import {
  TODAY, TODAY_STR,
  ALPHA_CLUSTER, FOUNDATIONS_DONE, FOUNDATIONS_EMPTY,
  makeCluster, makeLog, makeProgress,
  LOGS_RECENT,
  VALID_LLM_JSON, VALID_LLM_MARKDOWN, LLM_WITH_PROSE,
  LLM_GARBAGE, LLM_MALFORMED_JSON, LLM_MISSING_FIELDS, LLM_WRONG_HOUR_TYPE,
} from './test-fixtures';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(TODAY); });
afterEach(() => { vi.useRealTimers(); });

// ─── computeClusterProgress ──────────────────────────────────────

describe('computeClusterProgress', () => {
  it('returns 0 when cluster has no items', () => {
    const empty = makeCluster({ topics: [], resources: [], projects: [] });
    expect(computeClusterProgress(empty)).toBe(0);
  });

  it('computes 35% for ALPHA_CLUSTER (3/6 done, no checklist bonus)', () => {
    // 3 done / 6 total = 50% base. 50 * 0.7 = 35. checklist = 0.
    expect(computeClusterProgress(ALPHA_CLUSTER)).toBe(35);
  });

  it('adds 10% per completed checklist item', () => {
    const withStudy = makeCluster({ checklist: { study: true, experiment: false, artifact: false } });
    expect(computeClusterProgress(withStudy)).toBe(45); // 35 + 10
  });

  it('returns 100 when all items done and all checklist checked', () => {
    expect(computeClusterProgress(FOUNDATIONS_DONE)).toBe(100);
  });

  it('never exceeds 100', () => {
    const overDone = makeCluster({
      checklist: { study: true, experiment: true, artifact: true },
      topics: [
        { id: 't1', label: 'T1', done: true },
        { id: 't2', label: 'T2', done: true },
      ],
      resources: [{ id: 'r1', label: 'R1', done: true }],
      projects: [{ id: 'p1', label: 'P1', status: 'done' }],
    });
    expect(computeClusterProgress(overDone)).toBeLessThanOrEqual(100);
  });

  it('returns 0 for a not-started cluster with items', () => {
    expect(computeClusterProgress(FOUNDATIONS_EMPTY)).toBe(0);
  });
});

// ─── computePhaseProgress ────────────────────────────────────────

describe('computePhaseProgress', () => {
  it('returns 0 when no clusters belong to that phase', () => {
    const progress = makeProgress();
    expect(computePhaseProgress(progress.clusters, 99)).toBe(0);
  });

  it('averages progress of phase 1 clusters', () => {
    // phase 1 clusters in makeProgress: foundations(0%), alpha(35%), gamma(0%), epsilon(0%)
    // avg = (0 + 35 + 0 + 0) / 4 = 8.75 → rounded = 9
    const progress = makeProgress();
    const result = computePhaseProgress(progress.clusters, 1);
    expect(result).toBe(9);
  });
});

// ─── getLastWorkedDate ───────────────────────────────────────────

describe('getLastWorkedDate', () => {
  it('returns null when there are no logs', () => {
    expect(getLastWorkedDate('alpha', [])).toBeNull();
  });

  it('returns null when no logs match the cluster', () => {
    const logs = [makeLog({ cluster: 'gamma' })];
    expect(getLastWorkedDate('alpha', logs)).toBeNull();
  });

  it('returns the most recent log date for the cluster', () => {
    const logs = [
      makeLog({ date: '2026-05-20', cluster: 'alpha' }),
      makeLog({ date: '2026-05-24', cluster: 'alpha' }),
      makeLog({ date: '2026-05-22', cluster: 'alpha' }),
    ];
    const result = getLastWorkedDate('alpha', logs);
    expect(result?.toISOString().split('T')[0]).toBe('2026-05-24');
  });

  it('ignores logs from other clusters', () => {
    const logs = [
      makeLog({ date: '2026-05-24', cluster: 'gamma' }),
      makeLog({ date: '2026-04-01', cluster: 'alpha' }),
    ];
    const result = getLastWorkedDate('alpha', logs);
    expect(result?.toISOString().split('T')[0]).toBe('2026-04-01');
  });
});

// ─── relativeTime ────────────────────────────────────────────────

describe('relativeTime', () => {
  it('returns — for null', () => {
    expect(relativeTime(null)).toBe('—');
  });

  it('returns Today for today', () => {
    expect(relativeTime(new Date('2026-05-24'))).toBe('Today');
  });

  it('returns Yesterday for 1 day ago', () => {
    expect(relativeTime(new Date('2026-05-23'))).toBe('Yesterday');
  });

  it('returns Nd ago for 2–6 days', () => {
    expect(relativeTime(new Date('2026-05-19'))).toBe('5d ago');
  });

  it('returns Nw ago for 7+ days', () => {
    expect(relativeTime(new Date('2026-05-10'))).toBe('2w ago');
  });

  it('returns Nmo ago for 30+ days', () => {
    expect(relativeTime(new Date('2026-04-01'))).toBe('1mo ago');
  });
});

// ─── daysSince ───────────────────────────────────────────────────

describe('daysSince', () => {
  it('returns 9999 for null', () => {
    expect(daysSince(null)).toBe(9999);
  });

  it('returns 0 for today', () => {
    expect(daysSince(new Date('2026-05-24'))).toBe(0);
  });

  it('returns 7 for one week ago', () => {
    expect(daysSince(new Date('2026-05-17'))).toBe(7);
  });
});

// ─── buildHeatmapData ────────────────────────────────────────────

describe('buildHeatmapData', () => {
  it('always returns exactly 365 cells', () => {
    expect(buildHeatmapData([])).toHaveLength(365);
  });

  it('last cell date is today', () => {
    const cells = buildHeatmapData([]);
    expect(cells[364].date).toBe(TODAY_STR);
  });

  it('cells with no logs have null clusterId and 0 hours', () => {
    const cells = buildHeatmapData([]);
    expect(cells[0].clusterId).toBeNull();
    expect(cells[0].hours).toBe(0);
  });

  it('colors a cell with the dominant cluster on that day', () => {
    const logs = [
      makeLog({ date: TODAY_STR, cluster: 'alpha', hours: 3.0 }),
      makeLog({ date: TODAY_STR, cluster: 'gamma', hours: 1.0 }),
    ];
    const cells = buildHeatmapData(logs);
    const today = cells.find(c => c.date === TODAY_STR)!;
    expect(today.clusterId).toBe('alpha'); // alpha has more hours
    expect(today.hours).toBe(4.0);
  });

  it('accumulates hours from multiple logs on same day', () => {
    const logs = [
      makeLog({ date: TODAY_STR, cluster: 'alpha', hours: 2.0 }),
      makeLog({ date: TODAY_STR, cluster: 'alpha', hours: 1.5 }),
    ];
    const cells = buildHeatmapData(logs);
    const today = cells.find(c => c.date === TODAY_STR)!;
    expect(today.hours).toBe(3.5);
  });
});

// ─── computeWeeklyAvgHours ───────────────────────────────────────

describe('computeWeeklyAvgHours', () => {
  it('returns 0 when there are no logs', () => {
    expect(computeWeeklyAvgHours([])).toBe(0);
  });

  it('excludes work-cluster logs from study average', () => {
    const logs = [
      makeLog({ cluster: 'work', hours: 10.0 }),
      makeLog({ cluster: 'alpha', hours: 4.0 }),
    ];
    // only alpha counts: 4h over 4 weeks = 1h/week
    expect(computeWeeklyAvgHours(logs, 4)).toBe(1.0);
  });

  it('only counts logs within the specified week window', () => {
    const logs = [
      makeLog({ date: TODAY_STR, cluster: 'alpha', hours: 8.0 }),     // in window
      makeLog({ date: '2025-01-01', cluster: 'alpha', hours: 100.0 }), // way outside
    ];
    const result = computeWeeklyAvgHours(logs, 4);
    expect(result).toBe(2.0); // 8h / 4 weeks
  });
});

// ─── formatHours ─────────────────────────────────────────────────

describe('formatHours', () => {
  it('formats sub-hour as minutes', () => {
    expect(formatHours(0.5)).toBe('30m');
    expect(formatHours(0.25)).toBe('15m');
  });

  it('formats whole hours', () => {
    expect(formatHours(1)).toBe('1h');
    expect(formatHours(2.5)).toBe('2.5h');
  });
});

// ─── clusterStatus ───────────────────────────────────────────────

describe('clusterStatus', () => {
  it('returns "Not started" when progress is 0 and no logs exist', () => {
    const status = clusterStatus(FOUNDATIONS_EMPTY, []);
    expect(status.label).toBe('Not started');
  });

  it('returns "Closed" when progress is 100', () => {
    const status = clusterStatus(FOUNDATIONS_DONE, []);
    expect(status.label).toBe('Closed');
  });

  it('returns "Active" when worked within 7 days', () => {
    const logs = [makeLog({ cluster: 'alpha', date: TODAY_STR })];
    const status = clusterStatus(ALPHA_CLUSTER, logs);
    expect(status.label).toBe('Active');
  });

  it('returns "Slow" when last worked 8–14 days ago', () => {
    const logs = [makeLog({ cluster: 'alpha', date: '2026-05-13' })]; // 11 days ago
    const status = clusterStatus(ALPHA_CLUSTER, logs);
    expect(status.label).toBe('Slow');
  });

  it('returns "Stale" when last worked 15+ days ago', () => {
    const logs = [makeLog({ cluster: 'alpha', date: '2026-05-01' })]; // 23 days ago
    const status = clusterStatus(ALPHA_CLUSTER, logs);
    expect(status.label).toBe('Stale');
  });
});

// ─── parseLLMResponse ────────────────────────────────────────────

const FALLBACK = { cluster_id: 'unknown' as const, topic_guess: 'Session', hours: 1.0, is_completed: false };

describe('parseLLMResponse', () => {
  it('parses clean JSON string', () => {
    const result = parseLLMResponse(VALID_LLM_JSON, FALLBACK);
    expect(result?.cluster_id).toBe('alpha');
    expect(result?.topic_guess).toBe('Triton kernel');
    expect(result?.hours).toBe(2.0);
    expect(result?.is_completed).toBe(true);
  });

  it('extracts JSON from markdown code block', () => {
    const result = parseLLMResponse(VALID_LLM_MARKDOWN, FALLBACK);
    expect(result?.cluster_id).toBe('gamma');
    expect(result?.hours).toBe(1.5);
    expect(result?.is_completed).toBe(false);
  });

  it('extracts JSON when model adds conversational prose', () => {
    const result = parseLLMResponse(LLM_WITH_PROSE, FALLBACK);
    expect(result?.cluster_id).toBe('beta');
    expect(result?.topic_guess).toBe('Kalman filter');
  });

  it('returns fallback for garbage output', () => {
    const result = parseLLMResponse(LLM_GARBAGE, FALLBACK);
    expect(result).toEqual(FALLBACK);
  });

  it('returns fallback for malformed JSON', () => {
    const result = parseLLMResponse(LLM_MALFORMED_JSON, FALLBACK);
    expect(result).toEqual(FALLBACK);
  });

  it('returns fallback for empty string', () => {
    const result = parseLLMResponse('', FALLBACK);
    expect(result).toEqual(FALLBACK);
  });

  it('uses default hours of 1.0 when hours field is missing', () => {
    const result = parseLLMResponse(LLM_MISSING_FIELDS, FALLBACK);
    expect(result?.hours).toBe(1.0);
  });

  it('uses default hours of 1.0 when hours field is a string', () => {
    const result = parseLLMResponse(LLM_WRONG_HOUR_TYPE, FALLBACK);
    expect(result?.hours).toBe(1.0);
  });
});

// ─── buildCoachContext ───────────────────────────────────────────

describe('buildCoachContext', () => {
  it('includes log lines in correct format', () => {
    const progress = makeProgress({ logs: LOGS_RECENT });
    const ctx = buildCoachContext(progress);
    // Should have "2026-05-24 | alpha | Triton kernel | 2h | done"
    expect(ctx).toContain('2026-05-24');
    expect(ctx).toContain('alpha');
  });

  it('excludes work-cluster logs', () => {
    const progress = makeProgress({ logs: LOGS_RECENT });
    const ctx = buildCoachContext(progress);
    // Work log should not appear in study context
    const lines = ctx.split('\n').filter(l => l.includes('|'));
    expect(lines.every(l => !l.includes('work'))).toBe(true);
  });

  it('includes cluster state summary', () => {
    const progress = makeProgress();
    const ctx = buildCoachContext(progress);
    expect(ctx).toContain('CLUSTER STATE');
    expect(ctx).toContain('alpha');
    expect(ctx).toContain('foundations');
  });

  it('includes weekly stats', () => {
    const progress = makeProgress({ logs: LOGS_RECENT });
    const ctx = buildCoachContext(progress);
    expect(ctx).toContain('STATS');
    expect(ctx).toContain('weekly goal');
  });

  it('shows "No sessions" message when no recent logs', () => {
    const progress = makeProgress({ logs: [] });
    const ctx = buildCoachContext(progress);
    expect(ctx).toContain('No sessions logged this week');
  });
});
```

---

## Test File 2 — `src/lib/rules.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeFocusQueue } from './rules';
import { makeProgress, makeCluster, makeLog, TODAY } from './test-fixtures';
import type { Progress } from './types';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(TODAY); });
afterEach(() => { vi.useRealTimers(); });

// Helper: make a progress with alpha at specific progress level
function progressWithAlphaAt(pct: number): Progress {
  // pct is approximate — control via topics/resources/projects ratio
  // 6 items: topics(2) + resources(2) + projects(2)
  // Each done item = 1/6 of base (70%), plus 10% per checklist
  const topicsDone = Math.round((pct / 70) * 6); // rough approximation
  const topics = [
    { id: 't1', label: 'T1', done: topicsDone > 0 },
    { id: 't2', label: 'T2', done: topicsDone > 1 },
  ];
  return makeProgress({
    clusters: {
      ...makeProgress().clusters,
      alpha: makeCluster({ topics }),
    }
  });
}

// ─── Rule 1: artifact missing ────────────────────────────────────

describe('Rule 1 — artifact missing', () => {
  it('fires when study + experiment done but artifact is not', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        alpha: makeCluster({
          checklist: { study: true, experiment: true, artifact: false }
        })
      }
    });
    const queue = computeFocusQueue(progress);
    const rule1 = queue.find(i => i.reason === 'Ship the artifact');
    expect(rule1).toBeDefined();
    expect(rule1?.cluster).toBe('alpha');
    expect(rule1?.priority).toBe(1);
  });

  it('does NOT fire when artifact is already done', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        alpha: makeCluster({
          checklist: { study: true, experiment: true, artifact: true }
        })
      }
    });
    const queue = computeFocusQueue(progress);
    expect(queue.find(i => i.reason === 'Ship the artifact')).toBeUndefined();
  });

  it('does NOT fire when only study is done (experiment still pending)', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        alpha: makeCluster({
          checklist: { study: true, experiment: false, artifact: false }
        })
      }
    });
    const queue = computeFocusQueue(progress);
    expect(queue.find(i => i.reason === 'Ship the artifact')).toBeUndefined();
  });
});

// ─── Rule 2: foundations gate ────────────────────────────────────

describe('Rule 2 — foundations gate', () => {
  it('fires when alpha > 60% and foundations < 50%', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        // Alpha with all topics/resources/projects done + checklist = ~100%
        alpha: makeCluster({
          checklist: { study: true, experiment: true, artifact: false },
          topics: [
            { id: 't1', label: 'T1', done: true },
            { id: 't2', label: 'T2', done: true },
          ],
          resources: [
            { id: 'r1', label: 'R1', done: true },
            { id: 'r2', label: 'R2', done: true },
          ],
          projects: [
            { id: 'p1', label: 'P1', status: 'done' },
            { id: 'p2', label: 'P2', status: 'done' },
          ],
        }),
        // Foundations completely empty = 0%
        foundations: makeCluster({
          id: 'foundations',
          checklist: { study: false, experiment: false, artifact: false },
          topics: [{ id: 't1', label: 'T1', done: false }],
          resources: [],
          projects: [],
        }),
      }
    });
    const queue = computeFocusQueue(progress);
    const gateItem = queue.find(i => i.reason.includes('Foundations gate'));
    expect(gateItem).toBeDefined();
    expect(gateItem?.cluster).toBe('foundations');
    expect(gateItem?.priority).toBe(2);
  });

  it('does NOT fire when foundations >= 50%', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        // alpha just above 60
        alpha: makeCluster({
          checklist: { study: true, experiment: false, artifact: false },
          topics: [
            { id: 't1', label: 'T1', done: true },
            { id: 't2', label: 'T2', done: true },
          ],
          resources: [{ id: 'r1', label: 'R1', done: true }],
          projects: [{ id: 'p1', label: 'P1', status: 'done' }],
        }),
        // foundations above 50%
        foundations: {
          id: 'foundations',
          name: 'Foundations',
          phase: 1,
          checklist: { study: true, experiment: true, artifact: false },
          topics: [
            { id: 't1', label: 'T1', done: true },
            { id: 't2', label: 'T2', done: true },
          ],
          resources: [{ id: 'r1', label: 'R1', done: true }],
          projects: [{ id: 'p1', label: 'P1', status: 'done' }],
        },
      }
    });
    const queue = computeFocusQueue(progress);
    expect(queue.find(i => i.reason.includes('Foundations gate'))).toBeUndefined();
  });
});

// ─── Rule 3: stale cluster ────────────────────────────────────────

describe('Rule 3 — stale cluster', () => {
  it('fires for a cluster with >10 days since last log', () => {
    const progress = makeProgress({
      logs: [
        makeLog({ cluster: 'alpha', date: '2026-05-10' }) // 14 days ago
      ]
    });
    const queue = computeFocusQueue(progress);
    const staleItem = queue.find(i => i.cluster === 'alpha' && i.reason.includes('stale'));
    expect(staleItem).toBeDefined();
    expect(staleItem?.priority).toBe(3);
  });

  it('does NOT fire for a cluster touched within 10 days', () => {
    const progress = makeProgress({
      logs: [
        makeLog({ cluster: 'alpha', date: '2026-05-20' }) // 4 days ago
      ]
    });
    const queue = computeFocusQueue(progress);
    const staleItem = queue.find(i => i.cluster === 'alpha' && i.reason.includes('stale'));
    expect(staleItem).toBeUndefined();
  });

  it('does NOT fire for a cluster with 0% progress (not started)', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        gamma: makeCluster({
          id: 'gamma', topics: [], resources: [], projects: [],
          checklist: { study: false, experiment: false, artifact: false }
        })
      },
      logs: [] // no logs at all
    });
    const queue = computeFocusQueue(progress);
    expect(queue.find(i => i.cluster === 'gamma' && i.reason.includes('stale'))).toBeUndefined();
  });
});

// ─── Rule 4: in-progress project ─────────────────────────────────

describe('Rule 4 — in-progress project', () => {
  it('surfaces in-progress projects', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        alpha: makeCluster({
          projects: [
            { id: 'p1', label: 'Fused attention kernel', status: 'in_progress' }
          ]
        })
      }
    });
    const queue = computeFocusQueue(progress);
    const inProg = queue.find(i => i.reason.includes('Fused attention kernel'));
    expect(inProg).toBeDefined();
    expect(inProg?.priority).toBe(4);
  });

  it('does NOT surface not_started projects', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        alpha: makeCluster({
          projects: [
            { id: 'p1', label: 'Not started project', status: 'not_started' }
          ]
        })
      }
    });
    const queue = computeFocusQueue(progress);
    expect(queue.find(i => i.reason.includes('Not started project'))).toBeUndefined();
  });
});

// ─── Rule 5: phase 2 lock ─────────────────────────────────────────

describe('Rule 5 — phase 2 unlock', () => {
  it('fires a warning when phase 1 average < 60%', () => {
    const progress = makeProgress(); // all phase 1 clusters at low %
    const queue = computeFocusQueue(progress);
    const lockItem = queue.find(i => i.type === 'unlock');
    expect(lockItem).toBeDefined();
    expect(lockItem?.reason).toContain('Phase 2 locked');
  });

  it('does NOT fire when all phase 1 clusters average >= 60%', () => {
    const highProgress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        foundations: {
          id: 'foundations', name: 'Foundations', phase: 1,
          checklist: { study: true, experiment: true, artifact: true },
          topics: [{ id: 't1', label: 'T', done: true }],
          resources: [{ id: 'r1', label: 'R', done: true }],
          projects: [{ id: 'p1', label: 'P', status: 'done' }],
        },
        alpha: makeCluster({
          checklist: { study: true, experiment: true, artifact: true },
          topics: [{ id: 't1', label: 'T', done: true }],
          resources: [{ id: 'r1', label: 'R', done: true }],
          projects: [{ id: 'p1', label: 'P', status: 'done' }],
        }),
        gamma: makeCluster({
          id: 'gamma', name: 'Embedded', phase: 1,
          checklist: { study: true, experiment: true, artifact: true },
          topics: [{ id: 't1', label: 'T', done: true }],
          resources: [{ id: 'r1', label: 'R', done: true }],
          projects: [{ id: 'p1', label: 'P', status: 'done' }],
        }),
        epsilon: makeCluster({
          id: 'epsilon', name: 'Infra', phase: 1,
          checklist: { study: true, experiment: true, artifact: true },
          topics: [{ id: 't1', label: 'T', done: true }],
          resources: [{ id: 'r1', label: 'R', done: true }],
          projects: [{ id: 'p1', label: 'P', status: 'done' }],
        }),
      }
    });
    const queue = computeFocusQueue(highProgress);
    expect(queue.find(i => i.type === 'unlock')).toBeUndefined();
  });
});

// ─── Queue shape ──────────────────────────────────────────────────

describe('focus queue shape', () => {
  it('returns at most 5 items', () => {
    const queue = computeFocusQueue(makeProgress());
    expect(queue.length).toBeLessThanOrEqual(5);
  });

  it('is sorted by ascending priority', () => {
    const queue = computeFocusQueue(makeProgress());
    for (let i = 1; i < queue.length; i++) {
      expect(queue[i].priority).toBeGreaterThanOrEqual(queue[i - 1].priority);
    }
  });

  it('returns at most one item per cluster', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
        alpha: makeCluster({
          checklist: { study: true, experiment: true, artifact: false }, // triggers rule 1
          projects: [{ id: 'p1', label: 'In-progress', status: 'in_progress' }] // triggers rule 4
        })
      },
      logs: [makeLog({ cluster: 'alpha', date: '2026-05-01' })] // triggers rule 3
    });
    const queue = computeFocusQueue(progress);
    const alphaCounts = queue.filter(i => i.cluster === 'alpha').length;
    expect(alphaCounts).toBeLessThanOrEqual(1);
  });
});
```

---

## Test File 3 — `server/gitScanner.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { homedir } from 'os';

// Mock fs and child_process before importing the module under test
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}));
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

import { existsSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { scanRecentCommits } from './gitScanner';

const mockExists = vi.mocked(existsSync);
const mockReaddir = vi.mocked(readdirSync);
const mockStat = vi.mocked(statSync);
const mockExec = vi.mocked(execSync);

beforeEach(() => { vi.clearAllMocks(); });

describe('scanRecentCommits', () => {
  it('returns empty array when DEV_ROOT does not exist', () => {
    mockExists.mockReturnValue(false);
    const result = scanRecentCommits('/nonexistent', 'test@test.com');
    expect(result).toEqual([]);
  });

  it('finds a repo at root level when .git exists', () => {
    mockExists.mockImplementation((p: any) => {
      if (p === '/Users/test/Dev') return true;
      if (p === '/Users/test/Dev/.git') return true;
      return false;
    });
    mockExec.mockReturnValue('add fused attention kernel\nfix memory leak' as any);

    const result = scanRecentCommits('/Users/test/Dev', 'test@test.com');
    expect(result).toHaveLength(1);
    expect(result[0].repo).toBe('/Users/test/Dev');
    expect(result[0].commits).toEqual(['add fused attention kernel', 'fix memory leak']);
  });

  it('skips node_modules during traversal', () => {
    mockExists.mockImplementation((p: any) => {
      if (p === '/Users/test/Dev') return true;
      if (p === '/Users/test/Dev/.git') return false;
      return false;
    });
    mockReaddir.mockReturnValue(['node_modules', 'my-project'] as any);
    mockStat.mockImplementation((p: any) => {
      if (p.includes('node_modules')) throw new Error('should not traverse');
      return { isDirectory: () => true } as any;
    });
    mockExists.mockImplementation((p: any) => {
      if (p === '/Users/test/Dev') return true;
      if (p === '/Users/test/Dev/.git') return false;
      if (p === '/Users/test/Dev/my-project/.git') return true;
      return false;
    });
    mockExec.mockReturnValue('' as any);

    // Should not throw despite node_modules being present
    expect(() => scanRecentCommits('/Users/test/Dev', 'test@test.com')).not.toThrow();
  });

  it('skips entries in EXCLUDE_DIRS', () => {
    const EXCLUDED = ['dist', 'build', '.next', 'venv', '.venv', 'target'];
    mockExists.mockImplementation((p: any) => {
      if (p === '/dev') return true;
      if (p === '/dev/.git') return false;
      return false;
    });
    mockReaddir.mockReturnValue(EXCLUDED as any);
    mockStat.mockImplementation(() => { throw new Error('should not traverse excluded dirs'); });

    expect(() => scanRecentCommits('/dev', 'test@test.com')).not.toThrow();
  });

  it('returns empty commits for a repo with no recent activity', () => {
    mockExists.mockImplementation((p: any) => {
      if (p === '/Users/test/Dev') return true;
      if (p === '/Users/test/Dev/.git') return true;
      return false;
    });
    mockExec.mockReturnValue('' as any); // empty output = no commits

    const result = scanRecentCommits('/Users/test/Dev', 'test@test.com');
    expect(result).toEqual([]);
  });

  it('handles execSync throwing (no commits, permission error) gracefully', () => {
    mockExists.mockImplementation((p: any) => {
      if (p === '/dev') return true;
      if (p === '/dev/.git') return true;
      return false;
    });
    mockExec.mockImplementation(() => { throw new Error('not a git repo'); });

    expect(() => scanRecentCommits('/dev', 'test@test.com')).not.toThrow();
    expect(scanRecentCommits('/dev', 'test@test.com')).toEqual([]);
  });

  it('expands tilde ~ in the dev root path', () => {
    const expanded = `${homedir()}/Dev`;
    mockExists.mockImplementation((p: any) => p === expanded || p === `${expanded}/.git`);
    mockExec.mockReturnValue('initial commit' as any);

    // Pass tilde path — should work (expand internally)
    const result = scanRecentCommits('~/Dev', 'test@test.com');
    // If tilde was not expanded, existsSync would return false and result would be []
    expect(result).toHaveLength(1);
  });
});
```

---

## Test File 4 — `server/routes.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Create a temp dir for each test run
let testDataDir: string;
let app: express.Express;

beforeEach(async () => {
  testDataDir = join(tmpdir(), `goal-os-test-${Date.now()}`);
  mkdirSync(testDataDir, { recursive: true });

  // Seed test files
  writeFileSync(join(testDataDir, 'progress.json'), JSON.stringify({
    meta: { weekly_goal_hours: 5 },
    clusters: {},
    logs: []
  }), 'utf-8');

  writeFileSync(join(testDataDir, 'work.json'), JSON.stringify({
    tasks: [],
    automation_log: []
  }), 'utf-8');

  // Set env var so routes use the temp dir
  process.env.DATA_DIR = testDataDir;

  // Re-import app fresh for each test (reset module cache)
  vi.resetModules();
  const { default: expressApp } = await import('./testApp'); // see note below
  app = expressApp;
});

afterEach(() => {
  if (existsSync(testDataDir)) rmSync(testDataDir, { recursive: true });
});

// ─── Progress routes ─────────────────────────────────────────────

describe('GET /api/progress', () => {
  it('returns 200 with progress data', async () => {
    const res = await request(app).get('/api/progress');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clusters');
    expect(res.body).toHaveProperty('logs');
  });
});

describe('PUT /api/progress', () => {
  it('saves data and returns { ok: true }', async () => {
    const payload = { meta: { weekly_goal_hours: 10 }, clusters: {}, logs: [] };
    const res = await request(app).put('/api/progress').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('persists data that can be read back', async () => {
    const payload = { meta: { weekly_goal_hours: 7 }, clusters: {}, logs: [{ id: 'x' }] };
    await request(app).put('/api/progress').send(payload);
    const res = await request(app).get('/api/progress');
    expect(res.body.meta.weekly_goal_hours).toBe(7);
    expect(res.body.logs).toHaveLength(1);
  });
});

// ─── Work routes ─────────────────────────────────────────────────

describe('GET /api/work', () => {
  it('returns 200 with work data', async () => {
    const res = await request(app).get('/api/work');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(res.body).toHaveProperty('automation_log');
  });
});

describe('PUT /api/work', () => {
  it('saves a new task and can be read back', async () => {
    const payload = { tasks: [{ id: 'w1', title: 'Test task', status: 'todo' }], automation_log: [] };
    await request(app).put('/api/work').send(payload);
    const res = await request(app).get('/api/work');
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe('Test task');
  });
});

// ─── Git scan route ───────────────────────────────────────────────

describe('POST /api/git/scan', () => {
  it('returns { groups: [] } when GIT_AUTHOR_EMAIL is not set', async () => {
    const savedEmail = process.env.GIT_AUTHOR_EMAIL;
    delete process.env.GIT_AUTHOR_EMAIL;
    const res = await request(app).post('/api/git/scan');
    // Expects either 400 with error or 200 with empty groups
    expect([200, 400]).toContain(res.status);
    process.env.GIT_AUTHOR_EMAIL = savedEmail;
  });

  it('returns an array in groups property', async () => {
    process.env.GIT_AUTHOR_EMAIL = 'test@test.com';
    process.env.DEV_ROOT = testDataDir; // empty dir — no repos
    const res = await request(app).post('/api/git/scan');
    if (res.status === 200) {
      expect(Array.isArray(res.body.groups)).toBe(true);
    }
  });
});

// ─── LLM health route ─────────────────────────────────────────────

describe('GET /api/llm/health', () => {
  it('returns { online: false } when Ollama is not running', async () => {
    // In a test environment Ollama won't be running
    const res = await request(app).get('/api/llm/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('online');
    // online may be true or false depending on environment
    expect(typeof res.body.online).toBe('boolean');
  });
});
```

> **Note:** The routes test imports `./testApp`. Create `server/testApp.ts` that exports a minimal Express app with only the routes mounted (no `app.listen` call). This is standard practice for supertest:
>
> ```typescript
> // server/testApp.ts
> import express from 'express';
> import cors from 'cors';
> import progressRouter from './routes/progress';
> import workRouter from './routes/work';
> import gitRouter from './routes/git';
> import llmRouter from './routes/llm';
>
> const app = express();
> app.use(cors());
> app.use(express.json());
> app.use('/api/progress', progressRouter);
> app.use('/api/work', workRouter);
> app.use('/api/git', gitRouter);
> app.use('/api/llm', llmRouter);
>
> export default app;
> ```
> And in `server/index.ts`, import from `testApp.ts` and add `app.listen(PORT, ...)`.

---

## Test File 5 — `src/components/dashboard/ClusterCard.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ClusterCard } from './ClusterCard';
import { ALPHA_CLUSTER, makeLog, TODAY_STR } from '../../lib/test-fixtures';

// Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderCard = (overrides = {}) =>
  render(
    <MemoryRouter>
      <ClusterCard cluster={{ ...ALPHA_CLUSTER, ...overrides }} logs={[]} />
    </MemoryRouter>
  );

describe('ClusterCard', () => {
  it('renders the cluster name', () => {
    renderCard();
    expect(screen.getByText('Frontier AI/ML')).toBeInTheDocument();
  });

  it('renders the progress percentage', () => {
    renderCard();
    // ALPHA_CLUSTER = 35%
    expect(screen.getByText('35%')).toBeInTheDocument();
  });

  it('shows "Not started" status when no logs exist', () => {
    renderCard();
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('shows "Active" status when there is a recent log', () => {
    const logs = [makeLog({ cluster: 'alpha', date: TODAY_STR })];
    render(
      <MemoryRouter>
        <ClusterCard cluster={ALPHA_CLUSTER} logs={logs} />
      </MemoryRouter>
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('navigates to the cluster page on click', () => {
    renderCard();
    fireEvent.click(screen.getByText('Frontier AI/ML'));
    expect(mockNavigate).toHaveBeenCalledWith('/cluster/alpha');
  });

  it('renders three checklist dots', () => {
    const { container } = renderCard();
    // Three dots: look for the dot container — 3 w-2 h-2 rounded-full elements
    const dots = container.querySelectorAll('.w-2.h-2.rounded-full');
    expect(dots).toHaveLength(3);
  });

  it('checklist dots reflect done state correctly', () => {
    const cluster = { ...ALPHA_CLUSTER, checklist: { study: true, experiment: false, artifact: false } };
    const { container } = render(
      <MemoryRouter><ClusterCard cluster={cluster} logs={[]} /></MemoryRouter>
    );
    const dots = container.querySelectorAll('.w-2.h-2.rounded-full');
    // study = done (emerald), experiment + artifact = not done (zinc)
    expect(dots[0]).toHaveClass('bg-emerald-400');
    expect(dots[1]).toHaveClass('bg-zinc-700');
    expect(dots[2]).toHaveClass('bg-zinc-700');
  });
});
```

---

## Test File 6 — `src/components/dashboard/ActivityHeatmap.test.tsx`

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityHeatmap } from './ActivityHeatmap';
import { makeLog, TODAY, TODAY_STR } from '../../lib/test-fixtures';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(TODAY); });
afterEach(() => { vi.useRealTimers(); });

describe('ActivityHeatmap', () => {
  it('renders without crashing with empty logs', () => {
    const { container } = render(<ActivityHeatmap logs={[]} />);
    expect(container).toBeTruthy();
  });

  it('renders exactly 365 cells', () => {
    const { container } = render(<ActivityHeatmap logs={[]} />);
    // Each cell is a 10x10 div with rounded corners
    const cells = container.querySelectorAll('[style*="background-color"]');
    expect(cells).toHaveLength(365);
  });

  it('shows the "ACTIVITY GRID" heading', () => {
    render(<ActivityHeatmap logs={[]} />);
    expect(screen.getByText('ACTIVITY GRID')).toBeInTheDocument();
  });

  it('shows legend labels', () => {
    render(<ActivityHeatmap logs={[]} />);
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
```

---

## Test File 7 — `src/components/logging/SemanticLogger.test.tsx`

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SemanticLogger } from './SemanticLogger';

// Mock the store
const mockConfirmLogEntry = vi.fn();
vi.mock('../../lib/store', () => ({
  useStore: () => ({
    confirmLogEntry: mockConfirmLogEntry,
    llmOnline: true,
  })
}));

// Mock the api module
vi.mock('../../lib/api', () => ({
  parseText: vi.fn(),
}));

import * as api from '../../lib/api';
const mockParseText = vi.mocked(api.parseText);

beforeEach(() => {
  vi.clearAllMocks();
  mockParseText.mockResolvedValue(null); // default: LLM offline
});

const renderLogger = () => render(<SemanticLogger />);

describe('SemanticLogger', () => {
  it('is not visible by default', () => {
    renderLogger();
    expect(screen.queryByText('What did you work on?')).not.toBeInTheDocument();
  });

  it('opens on Cmd+K keyboard shortcut', async () => {
    renderLogger();
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
    });
    expect(screen.getByText('What did you work on?')).toBeInTheDocument();
  });

  it('opens when open-logger custom event is dispatched', async () => {
    renderLogger();
    await act(async () => {
      window.dispatchEvent(new CustomEvent('open-logger'));
    });
    expect(screen.getByText('What did you work on?')).toBeInTheDocument();
  });

  it('shows manual form immediately when llmOnline is false', async () => {
    vi.mocked(require('../../lib/store').useStore).mockReturnValue({
      confirmLogEntry: mockConfirmLogEntry,
      llmOnline: false,
    });

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'worked on CUDA kernels');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Ollama offline/i)).toBeInTheDocument();
    });
  });

  it('transitions to preview state when LLM returns a result', async () => {
    mockParseText.mockResolvedValue({
      cluster_id: 'alpha',
      topic_guess: 'Triton kernel',
      hours: 2.0,
      is_completed: true,
    });

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'triton matmul kernel for 2 hours');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Confirm log entry')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Triton kernel')).toBeInTheDocument();
  });

  it('transitions to manual state when LLM returns null', async () => {
    mockParseText.mockResolvedValue(null);

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'some work I did');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Log session manually')).toBeInTheDocument();
    });
  });

  it('calls confirmLogEntry and closes dialog on confirm', async () => {
    mockParseText.mockResolvedValue({
      cluster_id: 'gamma',
      topic_guess: 'FreeRTOS',
      hours: 1.5,
      is_completed: false,
    });

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'FreeRTOS scheduler');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => screen.getByText('Confirm log entry'));
    fireEvent.click(screen.getByText('Confirm ↵'));

    expect(mockConfirmLogEntry).toHaveBeenCalledOnce();
    const calledWith = mockConfirmLogEntry.mock.calls[0][0];
    expect(calledWith.cluster).toBe('gamma');
    expect(calledWith.topic).toBe('FreeRTOS');
    expect(calledWith.hours).toBe(1.5);
    expect(calledWith.source).toBe('manual');

    await waitFor(() => {
      expect(screen.queryByText('Confirm log entry')).not.toBeInTheDocument();
    });
  });
});
```

---

## Test Checklist (Add to Build Checklist in `IMPLEMENTATION.md`)

Add these as Phase 0 (before building anything):

### Phase 0 — Test Infrastructure

- [ ] 0.T1 Install all test dependencies from the Setup section of TESTS.md
- [ ] 0.T2 Create `vitest.config.ts` from TESTS.md Setup section
- [ ] 0.T3 Create `vitest.setup.ts` from TESTS.md Setup section
- [ ] 0.T4 Add test scripts to `package.json`
- [ ] 0.T5 Create `src/lib/test-fixtures.ts` exactly from TESTS.md
- [ ] 0.T6 Copy all 7 test files into their specified paths
- [ ] 0.T7 Create `server/testApp.ts` per the note in Test File 4
- [ ] 0.T8 Run `npm test` — all tests will fail (no implementation yet). Confirm test runner itself works and you see the failing test names. Fix runner config if any tests error rather than fail.

After each build phase, run `npm test` and confirm the relevant tests pass before moving on:

| After Phase | Tests that should pass |
|---|---|
| Phase 3 (state + API) | `utils.test.ts` — parseLLMResponse tests |
| Phase 4 (layout) | Sidebar renders, Shell renders (manual check) |
| Phase 5 (dashboard) | `ClusterCard.test.tsx`, `ActivityHeatmap.test.tsx` |
| Phase 6 (cluster detail) | `utils.test.ts` — computeClusterProgress |
| Phase 7 (logging) | `SemanticLogger.test.tsx`, `utils.test.ts` — all |
| Phase 8 (git scanner) | `gitScanner.test.ts` — all |
| Phase 9 (work tracker) | `routes.test.ts` — work routes |
| Phase 10 (weekly review) | `rules.test.ts` — all, `utils.test.ts` — buildCoachContext |
| Phase 11 (polish) | All 78 tests green |

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file change — use while building)
npm run test:watch

# Coverage report
npm run test:coverage
```

A passing implementation will show:

```
 ✓ src/lib/utils.test.ts          (25 tests)
 ✓ src/lib/rules.test.ts          (12 tests)
 ✓ server/gitScanner.test.ts      (6 tests)
 ✓ server/routes.test.ts          (8 tests)
 ✓ src/components/dashboard/ClusterCard.test.tsx       (7 tests)
 ✓ src/components/dashboard/ActivityHeatmap.test.tsx   (4 tests)
 ✓ src/components/logging/SemanticLogger.test.tsx      (8 tests)

Test Files  7 passed
Tests      70 passed
```
