import type {
  ClusterState, LogEntry, Progress, WorkData,
  WorkTask, AutomationEntry, PendingGitEntry
} from './types';

export const TODAY = new Date('2026-05-24T12:00:00Z');
export const TODAY_STR = '2026-05-24';

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

export const ALPHA_CLUSTER = makeCluster();

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

export const FOUNDATIONS_EMPTY: ClusterState = {
  id: 'foundations',
  name: 'Foundations',
  phase: 1,
  checklist: { study: false, experiment: false, artifact: false },
  topics: [{ id: 't1', label: 'Linear algebra', done: false }],
  resources: [{ id: 'r1', label: 'MML Book', done: false }],
  projects: [{ id: 'p1', label: 'SVD from scratch', status: 'not_started' }],
};

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
  makeLog({ id: 'l6', date: TODAY_STR, cluster: 'work', hours: 3.0, source: 'git' }),
];

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

export const VALID_LLM_JSON = `{"cluster_id":"alpha","topic_guess":"Triton kernel","hours":2.0,"is_completed":true}`;
export const VALID_LLM_MARKDOWN = '```json\n{"cluster_id":"gamma","topic_guess":"FreeRTOS","hours":1.5,"is_completed":false}\n```';
export const LLM_WITH_PROSE = `Sure! Here is the parsed result:\n{"cluster_id":"beta","topic_guess":"Kalman filter","hours":1.0,"is_completed":true}\nHope that helps!`;
export const LLM_GARBAGE = `I cannot parse that input. Please try again.`;
export const LLM_MALFORMED_JSON = `{"cluster_id":"alpha","topic_guess":`;
export const LLM_MISSING_FIELDS = `{"cluster_id":"alpha"}`;
export const LLM_WRONG_HOUR_TYPE = `{"cluster_id":"alpha","topic_guess":"CUDA","hours":"two","is_completed":false}`;
