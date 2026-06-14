export type ClusterId =
  | 'foundations'
  | 'alpha'
  | 'beta'
  | 'gamma'
  | 'delta'
  | 'epsilon'
  | 'sde_engineering'
  | 'ml_engineering'
  | 'fullstack_product';

export type AnyClusterId = ClusterId | 'work' | 'unknown';

export const CLUSTER_COLORS: Record<AnyClusterId, string> = {
  foundations:       '#94a3b8',
  alpha:             '#60a5fa',
  beta:              '#34d399',
  gamma:             '#fbbf24',
  delta:             '#a78bfa',
  epsilon:           '#fb7185',
  sde_engineering:   '#f97316',
  ml_engineering:    '#06b6d4',
  fullstack_product: '#ec4899',
  work:              '#6b7280',
  unknown:           '#3f3f46',
};

export const CLUSTER_LABELS: Record<AnyClusterId, string> = {
  foundations:       'Foundations',
  alpha:             'Frontier AI/ML',
  beta:              'Embodied AI',
  gamma:             'Embedded Systems',
  delta:             'Comp Physics',
  epsilon:           'Infra / MLOps',
  sde_engineering:   'SDE Engineering',
  ml_engineering:    'ML Engineering',
  fullstack_product: 'Fullstack / Product',
  work:              'Work',
  unknown:           'Unknown',
};

export interface Subtopic {
  id: string;
  label: string;
  done: boolean;
  order: number;
  description?: string;
}

export interface Subtask {
  id: string;
  label: string;
  done: boolean;
  order: number;
}

export interface Topic {
  id: string;
  label: string;
  done: boolean;
  order: number;
  subtopics?: Subtopic[];
}

export interface Resource {
  id: string;
  label: string;
  done: boolean;
  order: number;
  finished_date?: string;
}

export interface Project {
  id: string;
  label: string;
  status: 'not_started' | 'in_progress' | 'done';
  order: number;
  artifact_url?: string;
  finished_date?: string;
  notes?: string;
  git_repos?: string[];
  detected_commits?: string[];
}

export interface ClusterChecklist {
  study: boolean;
  experiment: boolean;
  artifact: boolean;
}

export interface ClusterState {
  id: ClusterId;
  name: string;
  phase: 1 | 2 | 3 | 4;
  checklist: ClusterChecklist;
  topics: Topic[];
  resources: Resource[];
  projects: Project[];
}

export type LogSource = 'manual' | 'git';
export type LogStatus = 'done' | 'in_progress';

export interface LogEntry {
  id: string;
  date: string;
  cluster: AnyClusterId;
  topic: string;
  hours: number;
  notes?: string;
  is_completed: boolean;
  source: LogSource;
  git_repo?: string;
  commits?: string[];
}

export type TaskStatus = 'todo' | 'wip' | 'done' | 'stuck' | 'waiting';

export interface WorkTask {
  id: string;
  title: string;
  status: TaskStatus;
  order: number;
  due?: string;
  blocker?: string;
  git_repo?: string;
  created_date: string;
  subtasks?: Subtask[];
}

export interface AutomationEntry {
  id: string;
  date: string;
  description: string;
  hours_saved_per_week: number;
}

export interface Meta {
  dev_root: string;
  git_author_email: string;
  start_date: string;
  target_years: number;
  weekly_goal_hours: number;
  last_coach_run?: string | null;
  last_coach_output?: string | null;
}

export interface Progress {
  meta: Meta;
  clusters: Record<ClusterId, ClusterState>;
  logs: LogEntry[];
}

export interface WorkData {
  tasks: WorkTask[];
  automation_log: AutomationEntry[];
}

export interface ParsedLogEntry {
  cluster_id: AnyClusterId;
  topic_guess: string;
  hours: number;
  is_completed: boolean;
}

export interface CommitGroup {
  repo: string;
  commits: string[];
}

export interface PendingGitEntry {
  id: string;
  commit_group: CommitGroup;
  parsed?: ParsedLogEntry;
}

export type FocusItemType = 'suggestion' | 'warning' | 'unlock';

export interface FocusItem {
  type: FocusItemType;
  cluster?: AnyClusterId;
  reason: string;
  detail?: string;
  priority: number;
}
