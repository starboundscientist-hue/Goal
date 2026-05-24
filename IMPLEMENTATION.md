# Goal OS — Complete Implementation Guide

> Every architectural decision is made here. The implementing model follows instructions; it does not design.

---

## 0. Decisions Made Upfront

| Decision | Choice | Reason |
|---|---|---|
| Framework | Vite + React 18 + TypeScript | Fast dev, type safety |
| Component library | shadcn/ui (Radix UI + Tailwind) | Gorgeous out of box, unstyled primitives |
| State management | Zustand | Simpler than Redux, no boilerplate |
| Routing | React Router v6 | Standard, well-documented |
| Server | Express on port 3001 | File I/O, git scanner, LLM proxy |
| Dev runner | concurrently | Runs Express + Vite together |
| Animations | Framer Motion | Page transitions, palette, typewriter |
| Charts | Recharts | Heatmap, pace chart |
| CSS | Tailwind v3 | Utility first, custom design tokens |
| Data persistence | JSON files on disk via Express | Simple, git-versionable |
| LLM real-time | Ollama at localhost:11434 | Free, offline, Apple Silicon fast |
| LLM weekly coach | Gemini 2.0 Flash via REST | Free AI Studio key, 1M context |
| API keys | .env file, never committed | Standard practice |
| No localStorage | All state is server-side | Single source of truth |

---

## 1. Project Setup

### 1.1 Create the project

```bash
npm create vite@latest goal-os -- --template react-ts
cd goal-os
```

### 1.2 Install all dependencies (run this exactly)

```bash
npm install \
  react-router-dom \
  zustand \
  framer-motion \
  recharts \
  express \
  cors \
  dotenv \
  concurrently \
  @types/express \
  @types/cors \
  @types/node

# shadcn/ui setup
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init
# When prompted: style=Default, base color=Zinc, CSS variables=yes

# Install specific shadcn components
npx shadcn-ui@latest add button card dialog drawer input badge scroll-area separator skeleton tooltip textarea
```

### 1.3 Final `package.json` scripts section

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"vite\"",
    "server": "npx ts-node --esm server/index.ts",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 1.4 Vite proxy config — `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### 1.5 Tailwind config — `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cluster identity colors — use these everywhere
        cluster: {
          foundations: '#94a3b8',
          alpha:       '#60a5fa',
          beta:        '#34d399',
          gamma:       '#fbbf24',
          delta:       '#a78bfa',
          epsilon:     '#fb7185',
          work:        '#6b7280',
        },
        // App surface colors
        surface: {
          base:    '#09090b',
          card:    '#111113',
          border:  '#1f1f23',
          hover:   '#18181b',
          muted:   '#27272a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
} satisfies Config
```

### 1.6 Global CSS — `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-surface-border; }
  body {
    @apply bg-surface-base text-zinc-100 font-sans antialiased;
    font-size: 14px;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-surface-muted rounded-full; }
}
```

### 1.7 Environment file — `.env` (create this, add to `.gitignore`)

```
GEMINI_API_KEY=your_key_here
GIT_AUTHOR_EMAIL=your@email.com
DEV_ROOT=/Users/yourname/Dev
DATA_DIR=./data
PORT=3001
```

### 1.8 Create `.gitignore`

Create this file at the project root with exactly this content:

```
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Environment variables — NEVER commit these
.env
.env.local
.env.*.local

# TypeScript build info
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo

# Vite
.vite/
```

### 1.9 Create data directory and seed files

```bash
mkdir -p data
```

Create `data/progress.json` (seed with the full blueprint structure — see Section 13).
Create `data/work.json` (see Section 13).

### 1.10 Move `parseLLMResponse` to `utils.ts` and export it

The `parseLLMResponse` function must live in `src/lib/utils.ts` and be exported — not in `api.ts` as a private function. This is required for the test suite to reach it. Add the exact function from Section 6 of this document to the bottom of `utils.ts` with the `export` keyword. In `api.ts`, import it:

```typescript
import { parseLLMResponse } from './utils';
```

---

## 2. File Structure

Create exactly this structure. Do not add files not listed here.

```
goal-os/
├── .env
├── .gitignore              ← include: .env, node_modules, dist
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
│
├── server/
│   ├── index.ts            ← Express app entry
│   ├── routes/
│   │   ├── progress.ts     ← GET + PUT /api/progress
│   │   ├── work.ts         ← GET + PUT /api/work
│   │   ├── git.ts          ← POST /api/git/scan
│   │   └── llm.ts          ← POST /api/llm/parse, POST /api/llm/coach
│   └── gitScanner.ts       ← find repos + run git log
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   ├── types.ts        ← ALL TypeScript interfaces (single source)
│   │   ├── store.ts        ← Zustand store
│   │   ├── api.ts          ← All fetch calls to Express
│   │   ├── rules.ts        ← Focus queue rule engine
│   │   └── utils.ts        ← parseLLMResponse, date helpers, cluster helpers
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Shell.tsx           ← Outer grid layout
│   │   │   └── Sidebar.tsx         ← Nav + git sync status
│   │   ├── dashboard/
│   │   │   ├── ClusterCard.tsx     ← Per-cluster progress card
│   │   │   ├── ActivityHeatmap.tsx ← 52-week heatmap
│   │   │   └── PaceBar.tsx         ← Phase progress + pace line
│   │   ├── cluster/
│   │   │   ├── ClusterDetail.tsx   ← Full cluster view
│   │   │   ├── ChecklistSection.tsx
│   │   │   ├── TopicsSection.tsx
│   │   │   ├── ResourcesSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   └── ProjectDrawer.tsx   ← Slide-in project detail
│   │   ├── logging/
│   │   │   ├── SemanticLogger.tsx  ← Cmd+K command palette
│   │   │   ├── LogRow.tsx          ← Single log entry row
│   │   │   └── GitPendingCard.tsx  ← Confirm git-detected session
│   │   ├── work/
│   │   │   ├── TaskRow.tsx
│   │   │   └── AutomationSection.tsx
│   │   └── coach/
│   │       └── CoachOutput.tsx     ← Typewriter coach text
│   │
│   └── pages/
│       ├── DashboardPage.tsx
│       ├── ClusterPage.tsx
│       ├── LogPage.tsx
│       ├── WorkPage.tsx
│       └── WeeklyPage.tsx
│
└── data/
    ├── progress.json
    └── work.json
```

---

## 3. TypeScript Types — `src/lib/types.ts`

Define every type here. Import from this file everywhere. Never define inline types in components.

```typescript
// ─── Cluster IDs ────────────────────────────────────────────────
export type ClusterId =
  | 'foundations'
  | 'alpha'
  | 'beta'
  | 'gamma'
  | 'delta'
  | 'epsilon';

export type AnyClusterId = ClusterId | 'work' | 'unknown';

// ─── Cluster color map (import this in components) ───────────────
export const CLUSTER_COLORS: Record<AnyClusterId, string> = {
  foundations: '#94a3b8',
  alpha:       '#60a5fa',
  beta:        '#34d399',
  gamma:       '#fbbf24',
  delta:       '#a78bfa',
  epsilon:     '#fb7185',
  work:        '#6b7280',
  unknown:     '#3f3f46',
};

export const CLUSTER_LABELS: Record<AnyClusterId, string> = {
  foundations: 'Foundations',
  alpha:       'Frontier AI/ML',
  beta:        'Embodied AI',
  gamma:       'Embedded Systems',
  delta:       'Comp Physics',
  epsilon:     'Infra / MLOps',
  work:        'Work',
  unknown:     'Unknown',
};

// ─── Blueprint data types ────────────────────────────────────────
export interface Topic {
  id: string;
  label: string;
  done: boolean;
}

export interface Resource {
  id: string;
  label: string;
  done: boolean;
  finished_date?: string; // ISO date string YYYY-MM-DD
}

export interface Project {
  id: string;
  label: string;
  status: 'not_started' | 'in_progress' | 'done';
  artifact_url?: string;
  finished_date?: string;
  notes?: string;
  git_repos?: string[]; // absolute paths e.g. "/Users/x/Dev/my-repo"
  detected_commits?: string[]; // recent commit messages linked by git scanner
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

// ─── Log entries ─────────────────────────────────────────────────
export type LogSource = 'manual' | 'git';
export type LogStatus = 'done' | 'in_progress';

export interface LogEntry {
  id: string;           // uuid or `log_${Date.now()}`
  date: string;         // ISO date YYYY-MM-DD
  cluster: AnyClusterId;
  topic: string;
  hours: number;
  notes?: string;
  is_completed: boolean;
  source: LogSource;
  git_repo?: string;
  commits?: string[];
}

// ─── Work tracker ────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'wip' | 'done' | 'stuck' | 'waiting';

export interface WorkTask {
  id: string;
  title: string;
  status: TaskStatus;
  due?: string;         // ISO date YYYY-MM-DD
  blocker?: string;
  git_repo?: string;
  created_date: string;
}

export interface AutomationEntry {
  id: string;
  date: string;
  description: string;
  hours_saved_per_week: number;
}

// ─── Root data files ─────────────────────────────────────────────
export interface Meta {
  dev_root: string;
  git_author_email: string;
  start_date: string;
  target_years: number;
  weekly_goal_hours: number;
  last_coach_run?: string;
  last_coach_output?: string;
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

// ─── LLM parsed output ───────────────────────────────────────────
export interface ParsedLogEntry {
  cluster_id: AnyClusterId;
  topic_guess: string;
  hours: number;
  is_completed: boolean;
}

// ─── Git scanner ─────────────────────────────────────────────────
export interface CommitGroup {
  repo: string;           // absolute path
  commits: string[];      // commit messages
}

export interface PendingGitEntry {
  id: string;             // temp id for UI key
  commit_group: CommitGroup;
  parsed?: ParsedLogEntry; // null if LLM offline
}

// ─── Focus queue ─────────────────────────────────────────────────
export type FocusItemType = 'suggestion' | 'warning' | 'unlock';

export interface FocusItem {
  type: FocusItemType;
  cluster?: AnyClusterId;
  reason: string;
  detail?: string;
  priority: number; // lower = higher priority
}
```

---

## 4. Express Server

### 4.1 `server/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import progressRouter from './routes/progress';
import workRouter from './routes/work';
import gitRouter from './routes/git';
import llmRouter from './routes/llm';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/progress', progressRouter);
app.use('/api/work', workRouter);
app.use('/api/git', gitRouter);
app.use('/api/llm', llmRouter);

app.listen(PORT, () => {
  console.log(`Goal OS server running on http://localhost:${PORT}`);
});
```

### 4.2 `server/routes/progress.ts`

```typescript
import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const router = Router();
const DATA_PATH = resolve(process.env.DATA_DIR || './data', 'progress.json');

router.get('/', (_req, res) => {
  try {
    const data = readFileSync(DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: 'Could not read progress.json' });
  }
});

router.put('/', (req, res) => {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not write progress.json' });
  }
});

export default router;
```

### 4.3 `server/routes/work.ts`

Identical to progress.ts but with `work.json`. Copy the file, change `DATA_PATH` to `work.json`.

### 4.4 `server/gitScanner.ts`

```typescript
import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { CommitGroup } from '../src/lib/types';

// Find all git repos up to maxDepth levels deep under root
function findGitRepos(root: string, maxDepth = 3, depth = 0): string[] {
  if (depth > maxDepth) return [];
  if (!existsSync(root)) return [];

  const repos: string[] = [];

  // If this directory is itself a git repo
  if (existsSync(join(root, '.git'))) {
    repos.push(root);
    return repos; // don't recurse into nested repos
  }

  try {
    const entries = readdirSync(root);
    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      const full = join(root, entry);
      try {
        if (statSync(full).isDirectory()) {
          repos.push(...findGitRepos(full, maxDepth, depth + 1));
        }
      } catch { /* skip unreadable dirs */ }
    }
  } catch { /* skip unreadable root */ }

  return repos;
}

export function scanRecentCommits(
  devRoot: string,
  authorEmail: string,
  since = '24 hours ago'
): CommitGroup[] {
  const repos = findGitRepos(devRoot);
  const results: CommitGroup[] = [];

  for (const repo of repos) {
    try {
      const output = execSync(
        `git -C "${repo}" log --since="${since}" --author="${authorEmail}" --pretty=format:"%s"`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 5000 }
      ).trim();

      if (output) {
        const commits = output.split('\n').filter(Boolean);
        if (commits.length > 0) {
          results.push({ repo, commits });
        }
      }
    } catch { /* repo has no commits or git error — skip */ }
  }

  return results;
}
```

### 4.5 `server/routes/git.ts`

```typescript
import { Router } from 'express';
import { scanRecentCommits } from '../gitScanner';

const router = Router();

router.post('/scan', (_req, res) => {
  const devRoot = process.env.DEV_ROOT || `${process.env.HOME}/Dev`;
  const email = process.env.GIT_AUTHOR_EMAIL || '';

  if (!email) {
    return res.status(400).json({ error: 'GIT_AUTHOR_EMAIL not set in .env' });
  }

  try {
    const groups = scanRecentCommits(devRoot, email);
    res.json({ groups });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
```

### 4.6 `server/routes/llm.ts`

```typescript
import { Router } from 'express';

const router = Router();
const OLLAMA_URL = 'http://localhost:11434/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ── Prompt templates ─────────────────────────────────────────────

const PARSE_SYSTEM_PROMPT = `You are a silent background parser for Goal OS.
Parse the user's text into a JSON object. Output ONLY a raw JSON object, no markdown, no explanation.

Cluster IDs and their keywords:
- "alpha": CUDA, Triton, transformers, LLMs, GPT, attention, distributed training, FSDP, DeepSpeed, quantization, RL, PPO, SAC
- "beta": SLAM, Kalman filter, EKF, UKF, MPC, LQR, PID, MuJoCo, robotics, rigid-body, control, state estimation, trajectory
- "gamma": FreeRTOS, RTOS, STM32, embedded C, C++, edge inference, TFLite, TensorRT, FPGA, CAN bus, I2C, SPI
- "delta": plasma, PDEs, PINNs, finite difference, numerical methods, physics simulation, Hamiltonian, Lagrangian
- "epsilon": Docker, Kubernetes, k8s, CI/CD, MLOps, Ray, Kafka, Terraform, W&B, MLflow, DVC
- "foundations": linear algebra, SVD, statistics, Bayesian, DSA, algorithms, OS concepts, computer architecture, math
- "work": meetings, PR review, Jira, Slack, deployment, on-call, report, sprint, standup
- "unknown": anything else

JSON schema (output exactly this shape):
{
  "cluster_id": "alpha" | "beta" | "gamma" | "delta" | "epsilon" | "foundations" | "work" | "unknown",
  "topic_guess": "short descriptive string of the specific topic",
  "hours": float (estimate from context, default 1.0 if not mentioned),
  "is_completed": boolean (true if done/finished/working, false if stuck/debugging/in progress)
}`;

const COACH_SYSTEM_PROMPT = `You are the Goal OS Systems Coach. Analyze the user's study data and produce a dense, actionable weekly diagnosis.

Format your response EXACTLY as follows — use these exact section headers, no markdown bold, no bullet lists, plain text paragraphs:

MOMENTUM
[2-3 sentences on which clusters had strong activity and which are declining]

ARCHITECTURE RISK
[1-2 sentences identifying the most dangerous gap — a prerequisite not met before advanced work]
[One specific action item starting with →]

PHASE GAP
[Which clusters are at 0% or very low that will block the next phase]
[One specific action item starting with →]

PACE
[One line: This week: Xh | 4-week avg: Xh | Target: Xh/week → ON TRACK / BEHIND / AHEAD]

Keep the total response under 200 words. Be direct. No encouragement, no fluff.`;

// ── Routes ───────────────────────────────────────────────────────

// Used by: Semantic Logger, Git Scanner mapping
router.post('/parse', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b-instruct',
        messages: [
          { role: 'system', content: PARSE_SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        stream: false
      }),
      signal: AbortSignal.timeout(4000) // 4 second timeout
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    res.json({ raw });
  } catch (e) {
    // Ollama offline or timeout — return empty so frontend falls back to manual
    res.json({ raw: '', offline: true });
  }
});

// Used by: Weekly Systems Coach
router.post('/coach', async (req, res) => {
  const { logsText } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'GEMINI_API_KEY not set in .env' });
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: COACH_SYSTEM_PROMPT + '\n\n' + logsText }] }
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
      }),
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from coach.';
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: 'Gemini call failed', detail: String(e) });
  }
});

export default router;
```

---

## 5. Zustand Store — `src/lib/store.ts`

```typescript
import { create } from 'zustand';
import type { Progress, WorkData, PendingGitEntry, LogEntry, WorkTask } from './types';
import * as api from './api';

interface AppStore {
  // Data
  progress: Progress | null;
  work: WorkData | null;
  pendingGitEntries: PendingGitEntry[];
  llmOnline: boolean;
  lastGitScan: Date | null;
  loading: boolean;

  // Setters
  setProgress: (p: Progress) => void;
  setWork: (w: WorkData) => void;
  setPendingGitEntries: (entries: PendingGitEntry[]) => void;
  setLlmOnline: (online: boolean) => void;
  setLastGitScan: (d: Date) => void;

  // Actions — these mutate progress AND persist to server
  confirmLogEntry: (entry: LogEntry) => Promise<void>;
  dismissPendingEntry: (id: string) => void;
  toggleTopic: (clusterId: string, topicId: string) => Promise<void>;
  toggleResource: (clusterId: string, resourceId: string) => Promise<void>;
  updateProjectStatus: (clusterId: string, projectId: string, status: string) => Promise<void>;
  updateChecklist: (clusterId: string, field: string, value: boolean) => Promise<void>;
  addWorkTask: (task: WorkTask) => Promise<void>;
  updateWorkTaskStatus: (id: string, status: string) => Promise<void>;
  addAutomationEntry: (entry: any) => Promise<void>;
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
    // Remove from pending
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
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...progress.clusters[clusterId as keyof typeof progress.clusters],
          topics: progress.clusters[clusterId as keyof typeof progress.clusters].topics.map(t =>
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
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...progress.clusters[clusterId as keyof typeof progress.clusters],
          resources: progress.clusters[clusterId as keyof typeof progress.clusters].resources.map(r =>
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
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...progress.clusters[clusterId as keyof typeof progress.clusters],
          projects: progress.clusters[clusterId as keyof typeof progress.clusters].projects.map(p =>
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
    const updated = {
      ...progress,
      clusters: {
        ...progress.clusters,
        [clusterId]: {
          ...progress.clusters[clusterId as keyof typeof progress.clusters],
          checklist: {
            ...progress.clusters[clusterId as keyof typeof progress.clusters].checklist,
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
```

---

## 6. API Layer — `src/lib/api.ts`

```typescript
import type { Progress, WorkData, ParsedLogEntry, CommitGroup } from './types';

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

// Returns null if Ollama is offline (server returns { raw: '', offline: true })
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

export async function checkOllama(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── LLM response parser ─────────────────────────────────────────
function parseLLMResponse(rawText: string, fallback: ParsedLogEntry | null): ParsedLogEntry | null {
  try {
    let text = rawText.trim();
    const block = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (block?.[1]) text = block[1].trim();
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) text = text.slice(first, last + 1);
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return {
        cluster_id: parsed.cluster_id || 'unknown',
        topic_guess: parsed.topic_guess || 'Study session',
        hours: typeof parsed.hours === 'number' ? parsed.hours : 1.0,
        is_completed: Boolean(parsed.is_completed)
      };
    }
  } catch { /* fall through */ }
  return fallback;
}
```

---

## 7. Utility Functions — `src/lib/utils.ts`

```typescript
import type { ClusterId, ClusterState, LogEntry } from './types';

// ─── Progress calculation ────────────────────────────────────────
export function computeClusterProgress(cluster: ClusterState): number {
  const topicsTotal = cluster.topics.length;
  const resourcesTotal = cluster.resources.length;
  const projectsTotal = cluster.projects.length;
  const total = topicsTotal + resourcesTotal + projectsTotal;
  if (total === 0) return 0;

  const topicsDone = cluster.topics.filter(t => t.done).length;
  const resourcesDone = cluster.resources.filter(r => r.done).length;
  const projectsDone = cluster.projects.filter(p => p.status === 'done').length;
  const done = topicsDone + resourcesDone + projectsDone;

  const basePercent = (done / total) * 100;

  // Checklist bonus: each completed item adds up to 10% (max 30% bonus)
  const checklistBonus =
    (cluster.checklist.study ? 10 : 0) +
    (cluster.checklist.experiment ? 10 : 0) +
    (cluster.checklist.artifact ? 10 : 0);

  return Math.min(100, Math.round(basePercent * 0.7 + checklistBonus));
}

// ─── Phase progress ──────────────────────────────────────────────
export function computePhaseProgress(
  clusters: Record<string, ClusterState>,
  phase: number
): number {
  const phaseClusters = Object.values(clusters).filter(c => c.phase === phase);
  if (phaseClusters.length === 0) return 0;
  const avg = phaseClusters.reduce((sum, c) => sum + computeClusterProgress(c), 0) / phaseClusters.length;
  return Math.round(avg);
}

// ─── Last worked date ────────────────────────────────────────────
export function getLastWorkedDate(clusterId: string, logs: LogEntry[]): Date | null {
  const clusterLogs = logs.filter(l => l.cluster === clusterId);
  if (clusterLogs.length === 0) return null;
  const sorted = clusterLogs.sort((a, b) => b.date.localeCompare(a.date));
  return new Date(sorted[0].date);
}

// ─── Relative time ───────────────────────────────────────────────
export function relativeTime(date: Date | null): string {
  if (!date) return '—';
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function daysSince(date: Date | null): number {
  if (!date) return 9999;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Pace projection ─────────────────────────────────────────────
export function computeWeeklyAvgHours(logs: LogEntry[], weeks = 4): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const recent = logs.filter(l => new Date(l.date) >= cutoff && l.cluster !== 'work');
  const total = recent.reduce((sum, l) => sum + l.hours, 0);
  return Math.round((total / weeks) * 10) / 10;
}

export function computeProjectedCompletion(
  startDate: string,
  targetYears: number,
  currentProgress: number, // 0–100
  weeklyAvgHours: number,
  weeklyGoalHours: number
): { label: string; onTrack: boolean } {
  if (weeklyAvgHours === 0) return { label: 'No data yet', onTrack: false };

  const targetDate = new Date(startDate);
  targetDate.setFullYear(targetDate.getFullYear() + targetYears);

  const progressRatio = weeklyAvgHours / weeklyGoalHours;
  const onTrack = progressRatio >= 0.85;

  const weeksRemaining = ((100 - currentProgress) / 100) * (targetYears * 52);
  const adjustedWeeks = weeksRemaining / progressRatio;
  const projected = new Date();
  projected.setDate(projected.getDate() + adjustedWeeks * 7);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const label = `${monthNames[projected.getMonth()]} ${projected.getFullYear()}`;

  return { label, onTrack };
}

// ─── Heatmap data builder ─────────────────────────────────────────
// Returns 365 cells (last 52 weeks). Each cell: { date, clusterId, hours }
export function buildHeatmapData(logs: LogEntry[]): Array<{
  date: string;
  clusterId: string | null;
  hours: number;
}> {
  const today = new Date();
  const cells = [];

  // Build a map of date → dominant cluster
  const dateMap = new Map<string, { hours: Record<string, number>; total: number }>();
  for (const log of logs) {
    if (!dateMap.has(log.date)) dateMap.set(log.date, { hours: {}, total: 0 });
    const entry = dateMap.get(log.date)!;
    entry.hours[log.cluster] = (entry.hours[log.cluster] || 0) + log.hours;
    entry.total += log.hours;
  }

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const entry = dateMap.get(key);
    if (!entry) {
      cells.push({ date: key, clusterId: null, hours: 0 });
    } else {
      const dominant = Object.entries(entry.hours).sort((a, b) => b[1] - a[1])[0];
      cells.push({ date: key, clusterId: dominant[0], hours: entry.total });
    }
  }

  return cells;
}

// ─── ID generator ────────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Format hours ────────────────────────────────────────────────
export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${h}h`;
}

// ─── Cluster status label ─────────────────────────────────────────
export function clusterStatus(
  cluster: ClusterState,
  logs: LogEntry[]
): { label: string; color: string } {
  const progress = computeClusterProgress(cluster);
  if (progress === 100) return { label: 'Closed', color: 'text-zinc-500' };

  const last = getLastWorkedDate(cluster.id, logs);
  const days = daysSince(last);

  if (progress === 0 && !last) return { label: 'Not started', color: 'text-zinc-600' };
  if (days > 14) return { label: 'Stale', color: 'text-amber-400' };
  if (days > 7) return { label: 'Slow', color: 'text-orange-400' };
  return { label: 'Active', color: 'text-emerald-400' };
}
```

---

## 8. Focus Queue Rules — `src/lib/rules.ts`

```typescript
import type { Progress, FocusItem } from './types';
import { computeClusterProgress, daysSince, getLastWorkedDate } from './utils';

export function computeFocusQueue(progress: Progress): FocusItem[] {
  const items: FocusItem[] = [];
  const clusters = progress.clusters;

  // Rule 1: Artifact missing (highest priority)
  for (const [id, cluster] of Object.entries(clusters)) {
    if (cluster.checklist.study && cluster.checklist.experiment && !cluster.checklist.artifact) {
      items.push({
        type: 'suggestion',
        cluster: id as any,
        reason: 'Ship the artifact',
        detail: 'Experiment done but no public artifact yet. Publish the repo or blog post.',
        priority: 1
      });
    }
  }

  // Rule 2: Foundations gate — must be >50% before alpha goes past 70%
  const foundationsProgress = computeClusterProgress(clusters.foundations);
  const alphaProgress = computeClusterProgress(clusters.alpha);
  if (foundationsProgress < 50 && alphaProgress > 60) {
    items.push({
      type: 'warning',
      cluster: 'foundations',
      reason: 'Foundations gate: below 50%',
      detail: 'You are doing advanced AI work without solidifying the math foundation. Bring Foundations above 50% first.',
      priority: 2
    });
  }

  // Rule 3: Stale clusters (active but not touched >10 days)
  for (const [id, cluster] of Object.entries(clusters)) {
    const prog = computeClusterProgress(cluster);
    if (prog > 0 && prog < 100) {
      const last = getLastWorkedDate(id, progress.logs);
      const days = daysSince(last);
      if (days > 10) {
        items.push({
          type: 'suggestion',
          cluster: id as any,
          reason: `${days}d without a session`,
          detail: `Log at least one session this week to prevent decay.`,
          priority: 3
        });
      }
    }
  }

  // Rule 4: In-progress projects (keep momentum)
  for (const [id, cluster] of Object.entries(clusters)) {
    const inProgress = cluster.projects.filter(p => p.status === 'in_progress');
    for (const project of inProgress) {
      items.push({
        type: 'suggestion',
        cluster: id as any,
        reason: `Continue: ${project.label.slice(0, 50)}`,
        detail: 'Project in progress — close it before starting the next one.',
        priority: 4
      });
    }
  }

  // Rule 5: Phase 2 unlock warning
  const phase1Clusters = Object.values(clusters).filter(c => c.phase === 1);
  const phase1Avg = phase1Clusters.reduce((sum, c) => sum + computeClusterProgress(c), 0) / phase1Clusters.length;
  if (phase1Avg < 60) {
    const lowestCluster = phase1Clusters.sort((a, b) =>
      computeClusterProgress(a) - computeClusterProgress(b)
    )[0];
    items.push({
      type: 'unlock',
      cluster: lowestCluster.id,
      reason: `Phase 2 locked — Phase 1 avg: ${Math.round(phase1Avg)}%`,
      detail: `${lowestCluster.name} is the weakest Phase 1 cluster. Bring it up to unblock Phase 2.`,
      priority: 5
    });
  }

  // Deduplicate by cluster (keep highest priority per cluster) and return top 5
  const seen = new Set<string>();
  return items
    .sort((a, b) => a.priority - b.priority)
    .filter(item => {
      if (!item.cluster) return true;
      if (seen.has(item.cluster)) return false;
      seen.add(item.cluster);
      return true;
    })
    .slice(0, 5);
}
```

---

## 9. App Entry — `src/App.tsx`

```tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { ClusterPage } from './pages/ClusterPage';
import { LogPage } from './pages/LogPage';
import { WorkPage } from './pages/WorkPage';
import { WeeklyPage } from './pages/WeeklyPage';
import { SemanticLogger } from './components/logging/SemanticLogger';
import { useStore } from './lib/store';
import * as api from './lib/api';

export default function App() {
  const { setProgress, setWork, setLlmOnline, setPendingGitEntries, setLastGitScan } = useStore();

  // Load data on mount
  useEffect(() => {
    Promise.all([api.loadProgress(), api.loadWork(), api.checkOllama()])
      .then(([progress, work, llmOnline]) => {
        setProgress(progress);
        setWork(work);
        setLlmOnline(llmOnline);
      });
  }, []);

  // Git scan on mount + every 30 minutes
  useEffect(() => {
    const runScan = async () => {
      const groups = await api.runGitScan();
      if (groups.length === 0) return;

      // For each commit group, parse with LLM in parallel
      const pending = await Promise.all(
        groups.map(async (group) => {
          const text = `Repo: ${group.repo}\nCommits:\n${group.commits.join('\n')}`;
          const parsed = await api.parseText(text);
          return {
            id: `git_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            commit_group: group,
            parsed: parsed || undefined
          };
        })
      );

      setPendingGitEntries(pending);
      setLastGitScan(new Date());
    };

    runScan();
    const interval = setInterval(runScan, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cluster/:id" element={<ClusterPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/review" element={<WeeklyPage />} />
        </Routes>
      </Shell>
      {/* SemanticLogger is a global modal — lives outside routes */}
      <SemanticLogger />
    </BrowserRouter>
  );
}
```

---

## 10. Components — Detailed Specs

### 10.1 `Shell.tsx`

```tsx
// CSS Grid layout: fixed sidebar 220px + fluid main
// Sidebar is always visible. Main scrolls independently.
// className: "grid h-screen overflow-hidden" style={{ gridTemplateColumns: '220px 1fr' }}
// Children render into the main area with: "overflow-y-auto h-screen px-8 py-6"
```

### 10.2 `Sidebar.tsx`

```tsx
// Background: bg-surface-base border-r border-surface-border
// Logo at top: "GOAL OS" in font-semibold text-zinc-100, with a small filled circle ◉ in blue

// Nav items use React Router NavLink.
// Active state: left border 2px in cluster color, bg-surface-hover
// Inactive state: text-zinc-400, hover:text-zinc-100 hover:bg-surface-hover

// Nav structure:
// ─────────────────
// ◉ GOAL OS
// ─────────────────
// Dashboard
// Log Session        ← clicking this opens SemanticLogger (dispatch global event)
// ─────────────────
// CLUSTERS (section label in text-zinc-600 uppercase text-xs tracking-wider)
//   ⊗ Foundations    ← dot colored with cluster color
//   α Frontier AI
//   β Embodied AI
//   γ Embedded
//   δ Comp Physics
//   ε Infra
// ─────────────────
// Work Tracker
// Weekly Review
// ─────────────────
// [bottom, text-zinc-600 text-xs]
//   Git: synced 4m ago ●   ← green dot if llmOnline

// The "⊗ α β γ δ ε" characters are literal Unicode, not icons
// Cluster links: /cluster/foundations, /cluster/alpha, etc.
```

### 10.3 `ClusterCard.tsx`

Props: `cluster: ClusterState, logs: LogEntry[]`

```tsx
// Layout: relative flex items-start gap-4 p-4 rounded-lg
// Background: bg-surface-card border border-surface-border
// Left accent: absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg
//   style={{ backgroundColor: CLUSTER_COLORS[cluster.id] }}
// Hover: hover:bg-surface-hover transition-colors cursor-pointer
// onClick: navigate(`/cluster/${cluster.id}`)

// Inside:
// [Left] Progress arc (SVG, 48x48)
//   - SVG circle r=20, strokeWidth=4
//   - Background circle: stroke="#27272a"
//   - Progress arc: stroke=CLUSTER_COLORS[cluster.id]
//   - strokeDasharray: `${progress * 1.257} 125.7`  (circumference = 2π*20 ≈ 125.7)
//   - strokeLinecap="round", transform="rotate(-90 24 24)"
//   - Center text: "{progress}%" in text-xs font-semibold

// [Right]
//   Line 1: cluster.name in font-medium text-zinc-100
//   Line 2: status chip + last worked
//     Status chip: small rounded-full px-1.5 py-0.5 text-xs
//       Active = bg-emerald-950 text-emerald-400
//       Stale = bg-amber-950 text-amber-400
//       Slow = bg-orange-950 text-orange-400
//       Not started = bg-zinc-900 text-zinc-500
//       Closed = bg-zinc-900 text-zinc-500
//     Last worked: text-zinc-500 text-xs ml-2
//   Line 3: Closing checklist mini-indicators
//     Three dots: ● ● ● in cluster color if done, ○ ○ ○ in zinc-700 if not
//     Tooltip on hover: "Study / Experiment / Artifact"
```

### 10.4 `ActivityHeatmap.tsx`

Props: `logs: LogEntry[]`

```tsx
// Uses buildHeatmapData(logs) from utils.ts → array of 365 cells
// Grid: 53 cols × 7 rows (weeks × days)
// Each cell: 10×10px square, gap-[2px], rounded-[2px]
// Color: CLUSTER_COLORS[cell.clusterId] if hours > 0, else '#1f1f23'
// Opacity: scale with hours: 0h=bg, 0-1h=40%, 1-2h=60%, 2-3h=80%, 3h+=100%
// Tooltip on hover: "{date}: {hours}h — {CLUSTER_LABELS[clusterId]}"
// Use shadcn Tooltip component
// No labels needed (keep it simple)
// Wrap in: overflow-x-auto (scrollable on smaller screens)
```

### 10.5 `PaceBar.tsx`

Props: `progress: Progress`

```tsx
// Phase progress bar:
//   Label: "Phase 1: Foundation" (or current phase)
//   Bar: full-width, h-1.5, bg-surface-muted rounded-full
//   Fill: bg-cluster-alpha (or the primary cluster color for that phase)
//   Right: "{n}%"

// Below the bar, one line of text:
//   "At current pace, Phase 1 closes {projectedLabel} · {weeklyAvg}h/week avg · Target: {goal}h"
//   Text color: text-zinc-500 text-sm
//   If onTrack: append "· ON TRACK" in text-emerald-400
//   If behind: append "· BEHIND" in text-amber-400
```

### 10.6 `SemanticLogger.tsx`

```tsx
// Global Cmd+K command palette. Listens for keydown on document.
// useEffect: document.addEventListener('keydown', handler)
//   handler: if (e.metaKey && e.key === 'k') { e.preventDefault(); setOpen(true); }
// Also listens for custom event 'open-logger' for sidebar button

// Renders as shadcn Dialog (full-screen modal with blur backdrop)
// Dialog backdrop: bg-black/60 backdrop-blur-sm

// STATES:
// 1. 'input' — show textarea
// 2. 'loading' — show skeleton preview card
// 3. 'preview' — show parsed result for confirmation
// 4. 'manual' — LLM offline, show manual form

// STATE: 'input'
//   Large textarea (4 rows) — autoFocus
//   Placeholder: "What did you work on? (freeform — be specific)"
//   Submit on Enter (not Shift+Enter)
//   Below: small text in text-zinc-600 "Powered by Ollama · Cmd+K to open anytime"
//   On submit: set state → 'loading', call api.parseText(text)
//     If result: set state → 'preview', store parsed
//     If null (LLM offline): set state → 'manual'

// STATE: 'loading'
//   shadcn Skeleton cards (3 rows of skeleton lines)
//   Text: "Parsing..." in text-zinc-500

// STATE: 'preview'
//   Card showing: Cluster (colored badge), Topic, Duration, Status (Done/In Progress)
//   All fields are editable inline (click to edit)
//   Two buttons: [Edit fields] [Confirm ↵]
//   On confirm: build LogEntry, call store.confirmLogEntry(entry), close dialog

// STATE: 'manual'
//   Show a small note: "Ollama offline — fill in manually"
//   Form: cluster dropdown, topic text input, hours number input, done checkbox
//   [Save] button

// LogEntry built on confirm:
//   id: generateId()
//   date: new Date().toISOString().split('T')[0]
//   cluster: parsed.cluster_id
//   topic: parsed.topic_guess
//   hours: parsed.hours
//   is_completed: parsed.is_completed
//   source: 'manual'
//   notes: original input text
```

### 10.7 `GitPendingCard.tsx`

Props: `entry: PendingGitEntry, onConfirm: (log: LogEntry) => void, onDismiss: () => void`

```tsx
// Renders at the TOP of the Dashboard, above cluster cards, if pendingGitEntries.length > 0
// Card: bg-surface-card border border-surface-border rounded-lg p-4

// Header: "Git detected {n} session{s}" with a git branch icon (use text "⎇")
// Repo path: short version — show only last 2 path segments (e.g. "Dev/cuda-kernels")
// Commit list: up to 3 commits shown, rest hidden with "...and N more"
// Each commit: text-zinc-400 text-sm "→ {commit message}"

// If parsed (LLM online):
//   Show parsed result: cluster badge, topic, estimated hours, status
//   Fields are editable (same pattern as SemanticLogger preview state)
//   [Dismiss] [Confirm ↵] buttons

// If not parsed (LLM offline):
//   Show raw commits only
//   [Dismiss] [Log manually] buttons
//   "Log manually" opens SemanticLogger with pre-filled text from commits
```

### 10.8 `ClusterDetail.tsx`

```tsx
// Header row:
//   Back button (←) → navigate('/')
//   Cluster name with colored dot
//   Progress percentage (large, in cluster color)
//   Progress bar full-width below header

// Four sections below. Each section header has a toggle (collapse/expand).
// All sections start OPEN.

// Sections rendered in order:
// 1. ChecklistSection
// 2. TopicsSection
// 3. ResourcesSection
// 4. ProjectsSection
```

### 10.9 `ChecklistSection.tsx`

```tsx
// Three checkboxes: Study closed / Experiment done / Public artifact
// Each: shadcn Checkbox + label + description text
// onChange → store.updateChecklist(clusterId, field, value)
// When all three checked: show a green "Cluster Closed ✓" banner
```

### 10.10 `ProjectDrawer.tsx`

```tsx
// shadcn Drawer (from the right, not bottom)
// Trigger: clicking a project row in ProjectsSection
// Width: 480px on desktop

// Inside:
// Project title (editable inline — click to edit)
// Status selector: radio group (Not started / In Progress / Done)
//   onChange → store.updateProjectStatus(clusterId, projectId, status)
//   When set to Done: show date picker for finished_date (default today)
// Artifact URL: text input with external link icon
// Notes: textarea (multi-line, no character limit)
// Linked commits section: list of detected_commits from project.detected_commits
//   Each commit: "→ {message}" in text-zinc-500 text-sm
// [Save changes] button at bottom — saves all edits to store
```

### 10.11 `LogPage.tsx`

```tsx
// Header: "Activity Log" + [+ New Entry] button (opens SemanticLogger)

// Filter bar: cluster chips (⊗ α β γ δ ε + Work)
//   All selected by default. Toggle individual clusters to filter.
//   Chip style: rounded-full px-2 py-1 text-xs
//     Active: bg in cluster color at 20% opacity, text in cluster color, border in cluster color
//     Inactive: bg-surface-muted text-zinc-500

// Date grouping: entries grouped by month header "MAY 2026" in text-zinc-600 uppercase

// Each LogRow: 
//   Left: colored cluster dot (8px circle)
//   Date: text-zinc-400 text-sm "Fri 23"
//   Topic: text-zinc-100 font-medium
//   Right: hours badge + source badge + status badge
//     Hours: "2.5h" in text-zinc-400
//     Source badge: if git → small "git" pill in bg-zinc-800 text-zinc-400
//                   if manual → nothing (don't show "manual" badge)
//     Status: "✓" in text-emerald-400 if done, "⏳" if in_progress
//   Expand on click: show notes text in text-zinc-500 text-sm pl-6

// Bottom: "Week total: {n}h study | {n}h work" sticky footer
```

### 10.12 `WorkPage.tsx`

```tsx
// Two sections: Task List + Automation Log

// TASK LIST header: "Work" + [+ Task] button
// + Task opens an inline form ABOVE the list (not a modal):
//   Title input (required)
//   Status selector (default: todo)
//   Due date picker (optional)
//   [Save] [Cancel]
//   On save: store.addWorkTask(task)
//   After save, also call api.parseText(`Work task: ${title}`) to check automation potential
//   If automation detected (cluster_id === 'work' is irrelevant — check the raw output for
//   keywords: 'automate', 'manual', 'repetitive', 'copy', 'paste', 'report', 'standup')
//   Then show an inline suggestion below the new task

// Task status display:
//   ○ TODO   = text-zinc-500
//   ● WIP    = text-blue-400
//   ✓ DONE   = text-emerald-400 line-through
//   ⚠ STUCK  = text-red-400
//   ↺ WAIT   = text-amber-400
// Clicking the status badge cycles to next status (except done→todo which requires confirmation)

// AUTOMATION LOG section:
//   Header: "Automation" + total hours saved per week
//   List of automation entries with date, description, hours/week saved
//   Total at bottom: "Total freed: {sum}h/week"
//   [+ Log automation] button → inline form: description + hours_saved_per_week input
```

### 10.13 `WeeklyPage.tsx`

```tsx
// Header: "Weekly Review" + date range for current week

// FOCUS QUEUE section:
//   Title: "Suggested Focus"
//   Renders computeFocusQueue(progress) results
//   Each item: numbered (1, 2, 3...), cluster dot, reason, detail text below
//   Warning type: amber left border
//   Unlock type: blue left border
//   Suggestion type: cluster color left border

// SYSTEMS COACH section:
//   Title: "Systems Coach"
//   If last_coach_output exists: show CoachOutput with the stored text
//   Show date of last run: "Last run: {relativeTime(last_coach_run)}"
//   [Run Coach] button:
//     Disabled with spinner while running
//     On click: build logsText (last 7 days of logs as plain text), call api.runCoach(logsText)
//     logsText format: one log per line: "2026-05-23 | alpha | Triton kernel | 2.5h | done"
//     On success: update progress.meta.last_coach_output and last_coach_run, save to server
//     Display new output via CoachOutput component

// STATS section (below coach):
//   This week: {hoursThisWeek}h
//   4-week avg: {avg}h/week
//   Target: {goal}h/week
//   These three stat cards in a row: bg-surface-card rounded-lg p-4
```

### 10.14 `CoachOutput.tsx`

Props: `text: string`

```tsx
// Typewriter animation using Framer Motion
// Split text into characters. Render each character with a staggered delay.
// Delay per character: 15ms (so 200 chars takes ~3 seconds)
// Use motion.span for each character with initial={{ opacity: 0 }} animate={{ opacity: 1 }}
// Parent: motion.div with staggerChildren: 0.015

// Text style: font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap
// Section headers (MOMENTUM, ARCHITECTURE RISK, etc.) detected by ALL_CAPS lines
//   Render those lines in text-zinc-100 font-semibold
// Lines starting with → render in cluster color (use default blue if cluster unknown)
```

---

## 11. Page Components

### `DashboardPage.tsx`

```tsx
// Renders in order:
// 1. PaceBar (full width)
// 2. GitPendingCard (if pendingGitEntries.length > 0, full width)
// 3. Cluster cards grid (2 cols on wide, 1 col on narrow)
//    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))"
// 4. ActivityHeatmap (full width, with "Activity" heading)
```

### `ClusterPage.tsx`

```tsx
// Extract :id from useParams()
// Load cluster from store.progress.clusters[id]
// If not found: show "Cluster not found" with back button
// Renders: ClusterDetail with cluster + logs props
```

### `LogPage.tsx`

Renders `ActivityLog` component.

### `WorkPage.tsx`

Renders work tasks and automation section (per spec in 10.12).

### `WeeklyPage.tsx`

Renders focus queue + coach section (per spec in 10.13).

---

## 12. Page Transitions

In `Shell.tsx`, wrap the main content area with:

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const location = useLocation();

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

---

## 13. Seed Data — `data/progress.json`

Generate this from the blueprint files. The full structure with all clusters populated from the two blueprint MDs.

```json
{
  "meta": {
    "dev_root": "~/Dev",
    "git_author_email": "",
    "start_date": "2026-05-23",
    "target_years": 5,
    "weekly_goal_hours": 5,
    "last_coach_run": null,
    "last_coach_output": null
  },
  "clusters": {
    "foundations": {
      "id": "foundations",
      "name": "Foundations",
      "phase": 1,
      "checklist": { "study": false, "experiment": false, "artifact": false },
      "topics": [
        { "id": "linear_algebra", "label": "Linear algebra (SVD, eigen, matrix calculus)", "done": false },
        { "id": "probability", "label": "Probability & statistics (Bayesian, Monte Carlo)", "done": false },
        { "id": "optimization", "label": "Optimization (convex, gradient descent)", "done": false },
        { "id": "numerical", "label": "Numerical methods (ODE/PDE solvers)", "done": false },
        { "id": "dsa", "label": "Data structures & algorithms", "done": false },
        { "id": "os_concepts", "label": "OS concepts (processes, memory, file systems)", "done": false },
        { "id": "computer_arch", "label": "Computer architecture (pipeline, cache, RISC-V)", "done": false },
        { "id": "gpu_arch", "label": "GPU architecture (SM, warps, tensor cores)", "done": false },
        { "id": "networking", "label": "Networking (TCP/IP, RDMA, InfiniBand)", "done": false },
        { "id": "compilers", "label": "Compilers basics (LLVM, code generation)", "done": false }
      ],
      "resources": [
        { "id": "mml_book", "label": "Mathematics for Machine Learning (Deisenroth)", "done": false },
        { "id": "cohen_stats", "label": "Modern Statistics (Mike X Cohen)", "done": false },
        { "id": "neetcode", "label": "Neetcode 150 DSA problems", "done": false },
        { "id": "mit_6006", "label": "MIT 6.006 Introduction to Algorithms (YouTube)", "done": false },
        { "id": "cs61c", "label": "CS 61C: Machine Structures (UC Berkeley)", "done": false }
      ],
      "projects": [
        { "id": "svd_scratch", "label": "Implement SVD from scratch in NumPy, compress an image, publish blog post", "status": "not_started" },
        { "id": "neetcode_practice", "label": "Solve 50 Neetcode problems (graphs + DP focus)", "status": "not_started" }
      ]
    },
    "alpha": {
      "id": "alpha",
      "name": "Frontier AI / ML",
      "phase": 1,
      "checklist": { "study": false, "experiment": false, "artifact": false },
      "topics": [
        { "id": "transformers", "label": "Transformer architectures (self-attention, RoPE, MoE)", "done": false },
        { "id": "ssm", "label": "State-space models (Mamba, S4)", "done": false },
        { "id": "distributed", "label": "Distributed training: FSDP, DeepSpeed, Megatron", "done": false },
        { "id": "cuda", "label": "GPU programming: CUDA, Triton, CUTLASS, Nsight", "done": false },
        { "id": "inference", "label": "Inference optimization: GPTQ, AWQ, vLLM, TensorRT-LLM", "done": false },
        { "id": "rl", "label": "Reinforcement learning: PPO, SAC, RLHF, DPO", "done": false },
        { "id": "data_pipelines", "label": "Data pipelines: tokenization, streaming, curation", "done": false },
        { "id": "mixed_precision", "label": "Numerical stability: fp16/bf16, gradient accumulation", "done": false }
      ],
      "resources": [
        { "id": "karpathy", "label": "Karpathy — Neural Networks: Zero to Hero (YouTube)", "done": false },
        { "id": "annotated_transformer", "label": "The Annotated Transformer (Harvard NLP)", "done": false },
        { "id": "cuda_guide", "label": "NVIDIA CUDA Programming Guide", "done": false },
        { "id": "cuda_mode", "label": "CUDA Mode lectures — Mark Saroufim (YouTube)", "done": false },
        { "id": "pmpp", "label": "Programming Massively Parallel Processors (Kirk & Hwu)", "done": false },
        { "id": "vllm_github", "label": "vLLM GitHub — study PagedAttention, continuous batching", "done": false },
        { "id": "cs285", "label": "CS 285: Deep RL (UC Berkeley, YouTube)", "done": false },
        { "id": "spinning_up", "label": "Spinning Up in Deep RL (OpenAI)", "done": false },
        { "id": "triton_tutorials", "label": "Triton official tutorials (triton-lang.org)", "done": false }
      ],
      "projects": [
        { "id": "gpt2_fsdp", "label": "Train GPT-2 sized model from scratch on 2+ GPUs using FSDP — log loss curves, throughput, GPU utilization", "status": "not_started" },
        { "id": "cuda_kernel", "label": "Write a custom CUDA kernel for fused attention; benchmark against PyTorch", "status": "not_started" },
        { "id": "llm_quantize", "label": "Quantize an LLM to INT4 with GPTQ and deploy via vLLM; measure throughput/latency", "status": "not_started" },
        { "id": "ppo_mujoco", "label": "Train a PPO agent in MuJoCo, record video, write up reward curves", "status": "not_started" },
        { "id": "paper_repro", "label": "Reproduce a recent SSM or MoE paper from scratch; publish reproducibility report", "status": "not_started" }
      ]
    },
    "beta": {
      "id": "beta",
      "name": "Embodied AI",
      "phase": 2,
      "checklist": { "study": false, "experiment": false, "artifact": false },
      "topics": [
        { "id": "classical_control", "label": "Classical control: PID, root locus, frequency domain", "done": false },
        { "id": "state_space", "label": "State-space: LQR, LQG, pole placement", "done": false },
        { "id": "mpc", "label": "Model Predictive Control (MPC) and trajectory optimization", "done": false },
        { "id": "kalman", "label": "State estimation: KF, EKF, UKF, particle filters", "done": false },
        { "id": "factor_graphs", "label": "Factor graphs (GTSAM, g2o)", "done": false },
        { "id": "slam", "label": "SLAM: visual SLAM, LiDAR SLAM, graph-based", "done": false },
        { "id": "rigid_body", "label": "Rigid-body kinematics/dynamics (quaternions, Newton-Euler)", "done": false },
        { "id": "behavior_trees", "label": "Behavior trees for task planning", "done": false }
      ],
      "resources": [
        { "id": "modern_robotics", "label": "Coursera Modern Robotics (Northwestern, Kevin Lynch)", "done": false },
        { "id": "prob_robotics", "label": "Probabilistic Robotics (Thrun, Burgard, Fox)", "done": false },
        { "id": "stachniss_slam", "label": "Cyrill Stachniss SLAM lectures (YouTube, Univ. Bonn)", "done": false },
        { "id": "gtsam_docs", "label": "GTSAM documentation and examples", "done": false },
        { "id": "casadi_docs", "label": "CasADi documentation + examples", "done": false }
      ],
      "projects": [
        { "id": "kalman_scratch", "label": "Implement a Kalman filter from scratch for a 2D robot; publish derivation blog post", "status": "not_started" },
        { "id": "planar_slam", "label": "Build full planar SLAM using GTSAM or g2o with a public dataset", "status": "not_started" },
        { "id": "pendulum_ctrl", "label": "Control simulated inverted pendulum with PID, LQR, MPC; compare performance", "status": "not_started" },
        { "id": "orbslam3", "label": "Run ORB-SLAM3 on a public dataset and trace the full pipeline in code", "status": "not_started" },
        { "id": "ros2_sim", "label": "Build ROS 2 robot simulation with SLAM, navigation, obstacle avoidance", "status": "not_started" }
      ]
    },
    "gamma": {
      "id": "gamma",
      "name": "Embedded & Real-Time",
      "phase": 1,
      "checklist": { "study": false, "experiment": false, "artifact": false },
      "topics": [
        { "id": "realtime_cpp", "label": "Real-time C/C++: deterministic memory, MISRA, interrupt handling", "done": false },
        { "id": "rtos", "label": "RTOS: FreeRTOS, Zephyr, QNX awareness", "done": false },
        { "id": "embedded_linux", "label": "Embedded Linux: Yocto, Buildroot, device trees", "done": false },
        { "id": "microcontrollers", "label": "Microcontrollers: ARM Cortex-M, RISC-V", "done": false },
        { "id": "fpga", "label": "FPGAs and high-level synthesis (basic HDL)", "done": false },
        { "id": "comm_buses", "label": "Communication buses: CAN, SPI, I2C, UART, SpaceWire", "done": false },
        { "id": "edge_inference", "label": "Edge inference: TensorRT, ONNX Runtime, TFLite Micro, TVM", "done": false }
      ],
      "resources": [
        { "id": "freertos_tutorials", "label": "FreeRTOS official tutorials + STM32CubeIDE examples", "done": false },
        { "id": "freertos_udemy", "label": "Mastering FreeRTOS using STM32 (Udemy)", "done": false },
        { "id": "rtos_book", "label": "Hands-On RTOS with Microcontrollers (Amos)", "done": false },
        { "id": "tflite_micro", "label": "TensorFlow Lite Micro documentation", "done": false },
        { "id": "tvm_docs", "label": "TVM documentation — ML compiler for edge", "done": false }
      ],
      "projects": [
        { "id": "freertos_stm32", "label": "Set up FreeRTOS on STM32 Nucleo; read IMU via I2C, log to SD card in real-time task", "status": "not_started" },
        { "id": "tflite_deploy", "label": "Train small classifier, quantize, deploy via TFLite Micro on Nucleo; measure latency", "status": "not_started" },
        { "id": "hitl", "label": "Build HITL: Python sim streams sensor data to Nucleo, which runs EKF, sends back commands", "status": "not_started" },
        { "id": "jetson_trt", "label": "Deploy quantized transformer on Jetson with TensorRT; benchmark throughput", "status": "not_started" }
      ]
    },
    "delta": {
      "id": "delta",
      "name": "Computational Physics",
      "phase": 2,
      "checklist": { "study": false, "experiment": false, "artifact": false },
      "topics": [
        { "id": "classical_mech", "label": "Classical mechanics (Lagrangian/Hamiltonian, perturbation theory)", "done": false },
        { "id": "electromagnetism", "label": "Electromagnetism: Maxwell, radiation, antenna theory", "done": false },
        { "id": "plasma", "label": "Plasma physics: MHD, particle-in-cell methods", "done": false },
        { "id": "pde_methods", "label": "Numerical PDEs: finite difference, finite volume, spectral methods", "done": false },
        { "id": "pinns", "label": "Physics-informed neural networks (PINNs)", "done": false },
        { "id": "hpc_patterns", "label": "Scientific computing: HPC patterns, GPU-accelerated PDE solvers", "done": false }
      ],
      "resources": [
        { "id": "plasma_conde", "label": "Introduction to Plasma Physics (Conde, 2025)", "done": false },
        { "id": "plasma_chen", "label": "Introduction to Plasma Physics (Chen) — classic", "done": false },
        { "id": "griffiths", "label": "Introduction to Electrodynamics (Griffiths) — first 4 chapters", "done": false },
        { "id": "pinns_paper", "label": "Original PINNs paper (Raissi et al.)", "done": false }
      ],
      "projects": [
        { "id": "kp_prediction", "label": "Download real solar wind data; build DL model to predict Kp index 1hr ahead; benchmark vs NOAA", "status": "not_started" },
        { "id": "heat_pinn", "label": "Implement PINN to solve 1D heat equation in PyTorch; compare to finite-difference", "status": "not_started" },
        { "id": "double_pendulum", "label": "Simulate double pendulum via Lagrangian mechanics; compare to numerical integration", "status": "not_started" }
      ]
    },
    "epsilon": {
      "id": "epsilon",
      "name": "Infra / MLOps",
      "phase": 1,
      "checklist": { "study": false, "experiment": false, "artifact": false },
      "topics": [
        { "id": "cloud", "label": "Cloud: AWS basics (EC2, S3, Lambda)", "done": false },
        { "id": "iac", "label": "Infrastructure-as-code: Terraform, Kubernetes basics, Docker", "done": false },
        { "id": "cicd", "label": "CI/CD: GitHub Actions, automated testing (pytest, GTest)", "done": false },
        { "id": "build_systems", "label": "Build systems: CMake, Bazel, PlatformIO", "done": false },
        { "id": "data_pipelines", "label": "Data pipelines: Kafka, Ray, distributed data loading", "done": false },
        { "id": "experiment_tracking", "label": "Experiment tracking: Weights & Biases, MLflow, DVC", "done": false }
      ],
      "resources": [
        { "id": "github_actions", "label": "GitHub Actions documentation", "done": false },
        { "id": "docker_docs", "label": "Docker documentation", "done": false },
        { "id": "wandb_quickstart", "label": "Weights & Biases quickstart", "done": false },
        { "id": "cmake_tutorial", "label": "CMake official tutorial", "done": false }
      ],
      "projects": [
        { "id": "docker_wandb", "label": "Containerize PyTorch training script with Docker, run on cloud GPU, log metrics to W&B, version dataset with DVC", "status": "not_started" },
        { "id": "cicd_pipeline", "label": "Set up CI/CD pipeline for a C++ or Python project with automated tests via GitHub Actions", "status": "not_started" }
      ]
    }
  },
  "logs": [],
  "git_pending": []
}
```

Create `data/work.json`:

```json
{
  "tasks": [],
  "automation_log": []
}
```

---

## 14. Build Checklist

Work through this in order. Do not skip ahead. Each item is a unit of work that can be completed and verified independently.

### Phase 1 — Project Shell

- [ ] 1.1 Run `npm create vite@latest goal-os -- --template react-ts`, confirm it runs with `npm run dev`
- [ ] 1.2 Install all dependencies from Section 1.2
- [ ] 1.3 Create `tailwind.config.ts` exactly as in Section 1.5
- [ ] 1.4 Create `src/index.css` exactly as in Section 1.6
- [ ] 1.5 Create `vite.config.ts` exactly as in Section 1.4
- [ ] 1.6 Create `.env` with all fields from Section 1.7 (leave values blank for now)
- [ ] 1.7 Create `data/` directory with `progress.json` and `work.json` from Section 13
- [ ] 1.8 Add Inter font import to `index.html` `<head>`: `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`
- [ ] 1.9 Create `src/lib/types.ts` exactly as in Section 3
- [ ] 1.10 Create `src/lib/utils.ts` exactly as in Section 7
- [ ] 1.11 Create `src/lib/rules.ts` exactly as in Section 8
- [ ] 1.12 Create all empty placeholder files for every path in the file tree (Section 2) so imports resolve

### Phase 2 — Express Server

- [ ] 2.1 Create `server/index.ts` from Section 4.1
- [ ] 2.2 Create `server/routes/progress.ts` from Section 4.2
- [ ] 2.3 Create `server/routes/work.ts` (copy of progress.ts with `work.json`)
- [ ] 2.4 Create `server/gitScanner.ts` from Section 4.4
- [ ] 2.5 Create `server/routes/git.ts` from Section 4.5
- [ ] 2.6 Create `server/routes/llm.ts` from Section 4.6
- [ ] 2.7 Update `package.json` scripts from Section 1.3
- [ ] 2.8 Test: `npm run server`, then `curl http://localhost:3001/api/progress` — should return the seed JSON
- [ ] 2.9 Test: `curl -X PUT http://localhost:3001/api/progress -H "Content-Type: application/json" -d '{"test":1}'` — file should update on disk
- [ ] 2.10 Test: `curl -X POST http://localhost:3001/api/git/scan` — should return `{ groups: [] }` or actual commits

### Phase 3 — State + API Layer

- [ ] 3.1 Create `src/lib/api.ts` from Section 6
- [ ] 3.2 Create `src/lib/store.ts` from Section 5
- [ ] 3.3 Create `src/App.tsx` from Section 9
- [ ] 3.4 Create `src/main.tsx` (standard Vite React entry: `ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)`)
- [ ] 3.5 Test: `npm run dev` — app loads without console errors, network tab shows GET /api/progress returning data

### Phase 4 — Layout

- [ ] 4.1 Create `Shell.tsx` — CSS grid layout, sidebar 220px + main fluid (see Section 10.1)
- [ ] 4.2 Create `Sidebar.tsx` — nav links with cluster color dots, git sync status at bottom (Section 10.2)
- [ ] 4.3 Create all 5 page files as empty components that just render `<div>PageName</div>`
- [ ] 4.4 Wire pages into `App.tsx` routes
- [ ] 4.5 Add Framer Motion `AnimatePresence` page transition in Shell (Section 12)
- [ ] 4.6 Test: clicking each nav item renders the correct placeholder page with smooth fade transition

### Phase 5 — Dashboard

- [ ] 5.1 Create `PaceBar.tsx` — reads from store, computes phase progress, projected date (Section 10.5)
- [ ] 5.2 Create `ClusterCard.tsx` — SVG progress arc, left border, status chip, checklist dots (Section 10.3)
- [ ] 5.3 Create `ActivityHeatmap.tsx` — 365-cell grid, colored by cluster, tooltip (Section 10.4)
- [ ] 5.4 Create `DashboardPage.tsx` — PaceBar + ClusterCard grid + Heatmap (Section 11)
- [ ] 5.5 Test: Dashboard renders all 6 cluster cards with correct colors. All progress at 0% (seed data). Heatmap renders 365 empty grey cells.
- [ ] 5.6 Test: Click a cluster card — navigates to `/cluster/alpha` (empty page for now)

### Phase 6 — Cluster Detail

- [ ] 6.1 Create `ChecklistSection.tsx` — 3 checkboxes, calls `store.updateChecklist` on change
- [ ] 6.2 Create `TopicsSection.tsx` — list of checkboxes, calls `store.toggleTopic` on change
- [ ] 6.3 Create `ResourcesSection.tsx` — list with done/not-done state, calls `store.toggleResource`
- [ ] 6.4 Create `ProjectsSection.tsx` — list of projects with status icons, click opens `ProjectDrawer`
- [ ] 6.5 Create `ProjectDrawer.tsx` — shadcn Drawer, status selector, artifact URL, notes, save button (Section 10.10)
- [ ] 6.6 Create `ClusterDetail.tsx` — header with back button + progress bar + 4 sections
- [ ] 6.7 Create `ClusterPage.tsx` — reads `:id` from useParams, loads cluster from store, renders ClusterDetail
- [ ] 6.8 Test: Navigate to Cluster α. Check a topic — progress percentage on card should update. Check a resource — finished_date is set. Open a project drawer — change status to in_progress — close and reopen — status persists. Verify changes are written to `data/progress.json` on disk.

### Phase 7 — Logging

- [ ] 7.1 Create `SemanticLogger.tsx` — Cmd+K global listener, 4 states (input/loading/preview/manual) (Section 10.6)
- [ ] 7.2 Test LLM offline path: with Ollama stopped, press Cmd+K, type something, submit — should fall through to manual form, no error shown
- [ ] 7.3 Start Ollama (`ollama run qwen2.5:7b-instruct`), test online path: type "read Karpathy video on transformers for 2 hours" — should parse to cluster=alpha, topic~=transformers, hours=2.0
- [ ] 7.4 Confirm an entry — verify it appears in `progress.json` logs array
- [ ] 7.5 Create `LogRow.tsx` — cluster dot, date, topic, hours, source badge, expand on click (Section 10.11)
- [ ] 7.6 Create `LogPage.tsx` — full log view with cluster filter chips and month grouping
- [ ] 7.7 Test: confirmed log entry appears in Log page. Filter chips hide/show entries correctly.

### Phase 8 — Git Scanner

- [ ] 8.1 Fill in `GIT_AUTHOR_EMAIL` and `DEV_ROOT` in `.env`
- [ ] 8.2 Test git scanner directly: `curl -X POST http://localhost:3001/api/git/scan` — should return commit groups from your actual repos
- [ ] 8.3 Create `GitPendingCard.tsx` — pending entry UI with confirm/dismiss (Section 10.7)
- [ ] 8.4 Add `GitPendingCard` rendering to `DashboardPage.tsx` above cluster cards
- [ ] 8.5 Test: make a test commit in any repo under `~/Dev/`, open the app — pending card should appear within 30 minutes (or immediately on manual scan button)
- [ ] 8.6 Test: confirm the pending entry — it should appear in Log page and disappear from pending cards

### Phase 9 — Work Tracker

- [ ] 9.1 Create `TaskRow.tsx` — status badge that cycles on click, title, due date (Section 10.12)
- [ ] 9.2 Create `AutomationSection.tsx` — automation log list + total hours freed counter
- [ ] 9.3 Create `WorkPage.tsx` — task list + inline add form + automation section
- [ ] 9.4 Test: add a task → appears in list. Click status badge → status cycles. Data persists to `work.json`.
- [ ] 9.5 Test automation scanner: add a task with title "copy-paste tickets to slack" — check console for LLM automation suggestion

### Phase 10 — Weekly Review

- [ ] 10.1 Create `CoachOutput.tsx` — typewriter animation, section header detection (Section 10.14)
- [ ] 10.2 Create `WeeklyPage.tsx` — focus queue + coach section + stats row (Section 10.13)
- [ ] 10.3 Test focus queue: with fresh seed data, all Phase 2 clusters should show as locked. Check a couple topics in alpha — confirm rules fire correctly.
- [ ] 10.4 Add a Gemini API key to `.env`. Click "Run Coach". Verify the response streams into the CoachOutput component with typewriter animation.
- [ ] 10.5 Test: coach output is saved to `progress.json` meta fields. On page reload, last output is still shown.

### Phase 11 — Polish

- [ ] 11.1 Verify all Framer Motion transitions are smooth (page fade, logger scale-in)
- [ ] 11.2 Verify cluster colors are consistent across: sidebar dots, card borders, topic/resource done states, heatmap cells, log row dots, focus queue items
- [ ] 11.3 Verify all store actions persist to disk (check `data/progress.json` after every test action)
- [ ] 11.4 Test Ollama offline scenario: stop Ollama, reload app. Git scanner should still work (without LLM parsing). Semantic Logger should fall through to manual form. No red errors or crashes anywhere.
- [ ] 11.5 Test with 0 logs (fresh state): all pages render without crash. No division by zero. Heatmap renders all grey. Pace shows "No data yet".
- [ ] 11.6 Add PWA manifest to `public/manifest.json` and link in `index.html` so the app can be installed as a desktop app

---

## 15. Common Pitfalls to Avoid

| Pitfall | Prevention |
|---|---|
| LLM offline crashing the UI | Every LLM call is wrapped in try/catch. api.parseText returns null, never throws. |
| Git scan finding node_modules or nested .git | gitScanner.ts skips entries starting with `.` and `node_modules`. Returns early if `.git` found (no nesting). |
| Progress percentage going over 100% | computeClusterProgress uses `Math.min(100, ...)` |
| JSON write corrupting the file | writeFileSync is synchronous — no partial writes. Express handles one request at a time. |
| Stale pending git entries duplicating | Each scan rebuilds the pending list entirely. Store setter replaces, not appends. |
| Framer Motion causing layout shift | Use `mode="wait"` on AnimatePresence. Keep y-offset small (6px). |
| shadcn components not styled | Verify `tailwind.config.ts` content array includes `./src/**/*.{ts,tsx}`. |
| TypeScript errors on `cluster[id]` | Use `clusters[id as keyof typeof clusters]` or define a type-safe getter function. |
| Cmd+K hijacked by browser | Use `e.preventDefault()` before setting open state. |
| Coach API key exposed to frontend | Gemini key only lives in `.env` on server. Frontend calls `/api/llm/coach`, server proxies. |
