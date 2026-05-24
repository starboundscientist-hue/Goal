import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeFocusQueue } from './rules';
import { makeProgress, makeCluster, makeLog, TODAY } from './test-fixtures';
import type { Progress } from './types';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(TODAY); });
afterEach(() => { vi.useRealTimers(); });

function progressWithAlphaAt(pct: number): Progress {
  const topicsDone = Math.round((pct / 70) * 6);
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

describe('Rule 2 — foundations gate', () => {
  it('fires when alpha > 60% and foundations < 50%', () => {
    const progress = makeProgress({
      clusters: {
        ...makeProgress().clusters,
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
        alpha: makeCluster({
          checklist: { study: true, experiment: false, artifact: false },
          topics: [
            { id: 't1', label: 'T1', done: true },
            { id: 't2', label: 'T2', done: true },
          ],
          resources: [{ id: 'r1', label: 'R1', done: true }],
          projects: [{ id: 'p1', label: 'P1', status: 'done' }],
        }),
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

describe('Rule 3 — stale cluster', () => {
  it('fires for a cluster with >10 days since last log', () => {
    const progress = makeProgress({
      logs: [
        makeLog({ cluster: 'alpha', date: '2026-05-10' })
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
        makeLog({ cluster: 'alpha', date: '2026-05-20' })
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
      logs: []
    });
    const queue = computeFocusQueue(progress);
    expect(queue.find(i => i.cluster === 'gamma' && i.reason.includes('stale'))).toBeUndefined();
  });
});

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

describe('Rule 5 — phase 2 unlock', () => {
  it('fires a warning when phase 1 average < 60%', () => {
    const progress = makeProgress();
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
          checklist: { study: true, experiment: true, artifact: false },
          projects: [{ id: 'p1', label: 'In-progress', status: 'in_progress' }]
        })
      },
      logs: [makeLog({ cluster: 'alpha', date: '2026-05-01' })]
    });
    const queue = computeFocusQueue(progress);
    const alphaCounts = queue.filter(i => i.cluster === 'alpha').length;
    expect(alphaCounts).toBeLessThanOrEqual(1);
  });
});
