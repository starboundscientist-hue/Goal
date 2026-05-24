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

describe('computeClusterProgress', () => {
  it('returns 0 when cluster has no items', () => {
    const empty = makeCluster({ topics: [], resources: [], projects: [] });
    expect(computeClusterProgress(empty)).toBe(0);
  });

  it('computes 35% for ALPHA_CLUSTER (3/6 done, no checklist bonus)', () => {
    expect(computeClusterProgress(ALPHA_CLUSTER)).toBe(35);
  });

  it('adds 10% per completed checklist item', () => {
    const withStudy = makeCluster({ checklist: { study: true, experiment: false, artifact: false } });
    expect(computeClusterProgress(withStudy)).toBe(45);
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

describe('computePhaseProgress', () => {
  it('returns 0 when no clusters belong to that phase', () => {
    const progress = makeProgress();
    expect(computePhaseProgress(progress.clusters, 99)).toBe(0);
  });

  it('averages progress of phase 1 clusters', () => {
    const progress = makeProgress();
    const result = computePhaseProgress(progress.clusters, 1);
    expect(result).toBe(9);
  });
});

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

describe('relativeTime', () => {
  it('returns — for null', () => {
    expect(relativeTime(null)).toBe('\u2014');
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
    expect(today.clusterId).toBe('alpha');
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

describe('computeWeeklyAvgHours', () => {
  it('returns 0 when there are no logs', () => {
    expect(computeWeeklyAvgHours([])).toBe(0);
  });

  it('excludes work-cluster logs from study average', () => {
    const logs = [
      makeLog({ cluster: 'work', hours: 10.0 }),
      makeLog({ cluster: 'alpha', hours: 4.0 }),
    ];
    expect(computeWeeklyAvgHours(logs, 4)).toBe(1.0);
  });

  it('only counts logs within the specified week window', () => {
    const logs = [
      makeLog({ date: TODAY_STR, cluster: 'alpha', hours: 8.0 }),
      makeLog({ date: '2025-01-01', cluster: 'alpha', hours: 100.0 }),
    ];
    const result = computeWeeklyAvgHours(logs, 4);
    expect(result).toBe(2.0);
  });
});

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
    const logs = [makeLog({ cluster: 'alpha', date: '2026-05-13' })];
    const status = clusterStatus(ALPHA_CLUSTER, logs);
    expect(status.label).toBe('Slow');
  });

  it('returns "Stale" when last worked 15+ days ago', () => {
    const logs = [makeLog({ cluster: 'alpha', date: '2026-05-01' })];
    const status = clusterStatus(ALPHA_CLUSTER, logs);
    expect(status.label).toBe('Stale');
  });
});

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

describe('buildCoachContext', () => {
  it('includes log lines in correct format', () => {
    const progress = makeProgress({ logs: LOGS_RECENT });
    const ctx = buildCoachContext(progress);
    expect(ctx).toContain('2026-05-24');
    expect(ctx).toContain('alpha');
  });

  it('excludes work-cluster logs', () => {
    const progress = makeProgress({ logs: LOGS_RECENT });
    const ctx = buildCoachContext(progress);
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
