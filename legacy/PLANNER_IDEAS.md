# Goal OS — Self-Planner & Execution Tracker

> Single source of truth for what we're building, why, and how.

---

## What This Is

A **local-first web app** that turns your two blueprint files into a living execution system. It watches your actual coding work through git, understands it with a local LLM, and keeps your progress state accurate without you having to click anything. For study sessions without code, you type one sentence and it does the same thing.

Runs in a browser tab on `localhost`. Data lives in JSON files you own. No cloud, no subscription, no accounts.

---

## Problems → Solutions

| Problem | Solution |
|---|---|
| "Where am I across 5 years / 5 clusters?" | Blueprint Dashboard |
| "I code every day but never log it" | Git Scanner — auto-reads `~/Dev/` |
| "I don't want to click 3 dropdowns to log a study session" | Semantic Logger — type one sentence |
| "What should I work on today?" | Rule-based focus queue |
| "Am I on pace for the 5-year plan?" | Live timeline projection |
| "Work tasks are slipping" | Office Work Tracker |
| "How much study time have I freed by automating work?" | Automation Flywheel counter |
| "Give me a real diagnosis of my week" | Weekly Systems Coach (LLM) |

---

## Tech Stack

```
Vite + React + TypeScript
├── shadcn/ui          ← component library (Radix UI + Tailwind)
├── Framer Motion      ← page transitions, card animations
├── Recharts           ← activity heatmap, pace chart
├── server.js          ← 20-line Express server, reads/writes JSON files
└── data/
    ├── progress.json  ← all study progress, cluster state, project status
    └── work.json      ← office tasks and automation log
```

**LLM setup — two tiers, both free:**

| Task | Model | Where |
|---|---|---|
| Git commit → cluster mapping (daily) | Qwen 2.5 7B | Ollama, `localhost:11434` |
| Semantic Logger (daily) | Qwen 2.5 7B | Ollama, `localhost:11434` |
| Automation Flywheel scan (per task) | Qwen 2.5 7B | Ollama, `localhost:11434` |
| Weekly Systems Coach report | Gemini 2.0 Flash | AI Studio free key |

Ollama on Apple Silicon runs Qwen 2.5 7B at 40+ tok/s. Zero cost, fully offline, no rate limits.

**One rule, never broken:** The LLM is a suggestion engine, not a state manager. It proposes. You confirm. It never writes to `progress.json` directly.

---

## UI Design Language

The app should feel like **Linear meets Raycast** — not a student planner, not a hacker terminal. Dark, focused, premium. Every interaction feels intentional.

### Color System

Each cluster has its own identity color, used consistently across all components:

| Cluster | Color | Hex |
|---|---|---|
| ⊗ Foundations | Slate | `#94a3b8` |
| α Frontier AI | Electric Blue | `#60a5fa` |
| β Embodied AI | Emerald | `#34d399` |
| γ Embedded | Amber | `#fbbf24` |
| δ Comp Physics | Violet | `#a78bfa` |
| ε Infra/MLOps | Rose | `#fb7185` |
| Work | Neutral | `#6b7280` |

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ◉ GOAL OS     [sidebar, 220px]  [main content, fluid]  │
│  ─────────────                                          │
│    Dashboard                                            │
│    Log Session                                          │
│  ─────────────                                          │
│    Clusters                                             │
│      ⊗  Foundations                                     │
│      α  Frontier AI  ←  active highlight (blue tint)   │
│      β  Embodied AI                                     │
│      γ  Embedded                                        │
│      δ  Comp Physics                                    │
│      ε  Infra                                           │
│  ─────────────                                          │
│    Work Tracker                                         │
│    Weekly Review                                        │
│  ─────────────                                          │
│    Git: synced 4m ago ●                                 │
└─────────────────────────────────────────────────────────┘
```

### Typography & Surface

- Font: **Inter** (variable weight)
- Background: `#09090b` (near-black, not pure black)
- Cards: `#111113` with `1px` border at `#1f1f23`
- Text primary: `#fafafa`, secondary: `#71717a`
- Hover states: `2px` left border in cluster color, background lifts to `#18181b`
- Radius: `8px` on cards, `6px` on inputs
- No heavy shadows — subtle `0 0 0 1px rgba(255,255,255,0.05)` ring

---

## Feature 1 — Blueprint Dashboard

The home screen. Visual state of the entire 5-year plan at a glance.

Each cluster renders as a card with:
- **Left border** in cluster color (2px, full height)
- **Progress arc** (circular, cluster color fill) showing % complete
- **Status chip**: Active / Stale / Locked / Closed
- **Last worked**: relative time, turns amber if >7 days
- **Mini sparkline**: last 30 days of activity

```
╔═══════════════════════════════════════════════════════════════╗
║  GOAL OS                                         May 2026     ║
║  Phase 1: Foundation  ━━━━━━━━━━━━━━━━━━━░░░░  41%           ║
║  Pace: On track  ·  4.8h/week avg  ·  Phase 1 closes Oct '26 ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ▏ ⊗ Foundations   ◕ 62%   Active   ·  2h today     ·  ▁▃▅▂ ║
║  ▏ α Frontier AI   ◕ 71%   Active   ·  2d ago        ·  ▂▅▇▃ ║
║  ▏ β Embodied AI   ◔ 48%   Active   ·  1w ago  ⚠     ·  ▁▂▁░ ║
║  ▏ γ Embedded      ◔ 25%   Stale    ·  2w ago  ⚠⚠    ·  ▁░░░ ║
║  ▏ δ Comp Physics  ○  0%   —        ·  never         ·  ░░░░ ║
║  ▏ ε Infra         ◔ 38%   Active   ·  3d ago        ·  ▃▂▄▁ ║
║                                                               ║
║  Activity  ─────────────────────────────────────────────────  ║
║  [GitHub-style heatmap, 52 weeks, colored by cluster]        ║
╚═══════════════════════════════════════════════════════════════╝
```

The left border `▏` glows in cluster color. The heatmap at the bottom is a 52-week contribution graph where each square's color is the cluster you worked on that day (mixed if multiple).

---

## Feature 2 — Cluster Detail

Same structure for every cluster. Clean, dense, scannable.

```
← Back                α  Frontier AI / ML                    71%

  CLOSE THE LOOP ─────────────────────────────────────────────
  [x] Study closed     can teach the core ideas
  [ ] Experiment done  toy version built and broken
  [ ] Public artifact  repo / blog / video

  TOPICS ──────────────────────────────────────────────────────
  [x] Transformer architectures
  [x] State-space models — Mamba, S4
  [ ] Mixture-of-Experts                          in progress ⏳
  [ ] Distributed training — FSDP, DeepSpeed
  [ ] Custom CUDA kernels / Triton

  STUDY RESOURCES ─────────────────────────────────────────────
  [x] Karpathy — Zero to Hero                   ✓ Apr 10 2025
  [ ] Annotated Transformer (Harvard NLP)
  [ ] CUDA Mode lectures — Mark Saroufim
  [ ] Programming Massively Parallel Processors

  PROJECTS ────────────────────────────────────────────────────
  [x] Train GPT-2 on 2 GPUs w/ FSDP             ✓ Mar 20 2025
      github.com/you/gpt2-fsdp · 3.2 tok/s achieved

  [ ] Fused attention CUDA kernel                ⏳ in progress
      ↳ 3 commits in the last week

  [ ] Quantize LLM to INT4, deploy via vLLM     🔒 not started
  [ ] Reproduce SSM/MoE paper from scratch       🔒 not started
```

Clicking a project opens a **slide-in drawer** from the right with: notes, artifact URL, date closed, hours, and the git commits the app has detected against this project.

---

## Feature 3 — Git Scanner (Auto-Logger)

**What it does:** On app start and every 30 minutes, scans every git repo under `~/Dev/`, pulls commits from the last 24 hours by your author email, and sends the commit messages to the local LLM to map them to blueprint clusters. The result appears as pending log entries you confirm with one click.

```
GIT SCAN  ·  last run 4 min ago                    [Scan Now]
─────────────────────────────────────────────────────────────

  PENDING — confirm these commits?

  ┌──────────────────────────────────────────────────────┐
  │  ~/Dev/cuda-kernels   ·  3 commits today             │
  │                                                      │
  │  "add block-level matmul, 95% cuBLAS perf"          │
  │  "fix shared memory bank conflict"                   │
  │  "benchmark against cublas baseline"                 │
  │                                                      │
  │  → α  Frontier AI  ·  Low-level GPU / Triton         │
  │    Estimated: 2.5h  ·  Status: Done ✓                │
  │                                                      │
  │  [Edit]                          [Confirm ↵]         │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │  ~/Dev/ros2-slam-bot  ·  1 commit today              │
  │                                                      │
  │  "tune EKF covariance for IMU noise floor"           │
  │                                                      │
  │  → β  Embodied AI  ·  State Estimation / Kalman      │
  │    Estimated: 1.0h  ·  Status: In Progress ⏳         │
  │                                                      │
  │  [Edit]                          [Confirm ↵]         │
  └──────────────────────────────────────────────────────┘
```

Confirmed entries merge into the regular log. The project detail page links to detected commits automatically.

**The scanner command under the hood:**
```bash
find ~/Dev -maxdepth 3 -name ".git" -type d | while read gitdir; do
  git -C "$(dirname $gitdir)" log \
    --since="24 hours ago" \
    --author="your@email.com" \
    --pretty=format:"%s" 2>/dev/null
done
```

The app runs this via a Node child process on the Express server, batches the output, sends it to Ollama in one call.

**LLM prompt for commit mapping:**
```
You are a silent classifier for Goal OS.
Map these git commit messages to a blueprint cluster.

Clusters:
- alpha: CUDA, Triton, transformers, LLMs, distributed training, RL
- beta: SLAM, Kalman filter, control, MuJoCo, robotics, rigid-body
- gamma: FreeRTOS, RTOS, embedded C, STM32, edge inference, FPGAs
- delta: plasma, PDEs, PINNs, numerical methods, physics simulation
- epsilon: Docker, k8s, CI/CD, MLOps, Ray, data pipelines
- foundations: math, linear algebra, statistics, DSA, OS concepts
- work: anything else (day job, infra, meetings)

Commits: {{COMMIT_LIST}}

Output ONLY JSON: { "cluster_id": string, "topic_guess": string, "hours": float, "is_completed": boolean }
```

---

## Feature 4 — Semantic Logger (For Study Sessions)

For sessions where you're reading, watching lectures, or working on paper — no git commits. Type one sentence, the LLM fills the form.

The input lives as a **command palette** — `Cmd+K` opens it from anywhere:

```
╔═══════════════════════════════════════════════╗
║                                               ║
║   What did you work on?                       ║
║   ─────────────────────────────────────────   ║
║   > read through the MML book chapters on     ║
║     SVD for about 90 minutes, did the         ║
║     exercises                                 ║
║                                         ↵     ║
╚═══════════════════════════════════════════════╝

         ↓  Qwen 2.5 7B  (~250ms)

╔═══════════════════════════════════════════════╗
║  Confirm log entry                            ║
║  ─────────────────────────────────────────    ║
║  Cluster   ⊗  Foundations                     ║
║  Topic     Linear Algebra — SVD               ║
║  Duration  1.5 hrs                            ║
║  Status    Done ✓                             ║
║                                               ║
║  [Edit fields]          [Confirm ↵]           ║
╚═══════════════════════════════════════════════╝
```

Backdrop blurs behind it (Framer Motion `AnimatePresence`). If Ollama is offline, it opens the same panel with empty fields for manual entry — no error, no crash, invisible degradation.

---

## Feature 5 — Activity Log

Chronological view of everything — git-sourced and manual entries combined.

```
MAY 2026                                         [⊗ α β γ δ ε]
─────────────────────────────────────────────────────────────
Fri 23  α  Triton matmul kernel             git · 2.5h  ✓
        ⊗  SVD — MML book exercises         manual · 1.5h  ✓
Thu 22  α  FSDP multi-GPU debug             git · 2.0h  ⏳
Tue 20  γ  FreeRTOS context switch fix      git · 1.0h  ✓
Mon 19  WORK  data pipeline refactor        git · 3.0h  ⏳
─────────────────────────────────────────────────────────────
Week: 10.0h study  |  Goal: 5h/week  ✓ above target
```

`git` badge means it was auto-detected from commits. `manual` means Semantic Logger. The filter chips at top right let you isolate by cluster (colored). Click any row to expand notes and linked commits.

---

## Feature 6 — Focus Queue (Rule-Based, Always Works Offline)

No LLM. Pure logic from the blueprint's dependency graph.

**Rules:**
- Foundational Substrate must be >50% before α advances past 70%
- Phase 2 branches unlock only when all Phase 1 clusters average >60%
- An "Active" cluster not touched for >10 days → `Stale` status, surfaced first
- If checklist state is `study ✓ / experiment ✓ / artifact ✗` → "ship the artifact" is priority 1
- After a project closes, next project in same cluster auto-queues

```
FOCUS THIS WEEK ─────────────────────────────────────────────
  1  ⊗  Foundations   →  SVD blog post             artifact missing
  2  α  Frontier AI   →  fused attention kernel     50% done, keep going
  3  γ  Embedded      →  FreeRTOS HITL setup        14d stale, Phase 1 gap

  ⛔ Phase 2 locked  —  δ Comp Physics at 0%  (need any progress first)
─────────────────────────────────────────────────────────────
```

The Systems Coach (below) overlays richer reasoning on top of this. But this queue always runs.

---

## Feature 7 — Weekly Systems Coach

On-demand, once a week. You click "Run Coach". It sends the last 7 days of logs + cluster states to **Gemini 2.0 Flash** (free AI Studio key) and returns a dense diagnostic. Not a bar chart, an actual analysis.

```
SYSTEMS COACH  ·  Week of May 19–23
─────────────────────────────────────────────────────────────
MOMENTUM
  Strong week in α — 5 commits, 4.5h, GPU-level depth.
  β has 1 session after a 10-day gap. Decay starting.

ARCHITECTURE RISK
  You are doing CUDA/Triton work with Foundations at 62%.
  Specifically: no SVD experiment closed yet. You are
  optimizing memory layouts without grounded intuition
  for the linear maps underneath.
  → Close SVD experiment before next CUDA session.

PHASE 1 GAP
  δ (Comp Physics) is at 0%. This locks Phase 2 orbit
  mechanics track. 30 min/week for 8 weeks closes it.
  → Add 1 δ session next week.

PACE
  This week: 10.0h  ·  4-week avg: 6.2h  ·  Target: 5h  → ON TRACK
─────────────────────────────────────────────────────────────
```

The output renders as styled text, not a form. Animate it in line by line with a 20ms delay per character (typewriter effect via Framer Motion) — feels alive.

---

## Feature 8 — Office Work Tracker

Completely separate sidebar section. Never pollutes study data.

```
WORK  ─────────────────────────────────────────  [+ Task]

  ● WIP    data pipeline refactor (ingestion)
  ✓ DONE   k8s node pool PR review
  ⚠ STUCK  prod DB access — waiting on DBA since Tue
  ○ TODO   Q2 report for manager                  due Fri

AUTOMATION ──────────────────────────────────────────────
  May 10  Jira → Slack standup script     +3.75h/week
  Apr 28  weekly report generation        +2.0h/week
  ─────────────────────────────────────────────────────
  Total freed:  5.75h/week  →  study budget unlocked
```

**Automation Flywheel Scanner:** When you save a work task description, Ollama scans it and flags automation potential inline:

```
You entered: "copy-paste Jira tickets to Slack for standup"

  → AUTOMATION: HIGH
    10-line Python, slack-sdk + jira-python, launchd schedule.
    Saves ~45 min/day.   [Add to automation log]
```

---

## System Architecture (Clean)

```
                    ┌─────────────────┐
                    │   React UI      │
                    │  (localhost)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼────┐  ┌──────▼──────┐  ┌───▼────────────┐
    │ progress.json│  │  work.json  │  │  Express server │
    │   (data)     │  │   (data)    │  │  (file I/O,     │
    └─────────┬────┘  └──────┬──────┘  │   git scanner)  │
              └──────────────┘         └───┬────────────┘
                                           │
                          ┌────────────────┼──────────────┐
                          │                │              │
                   ┌──────▼──────┐  ┌──────▼──────┐  ┌───▼───────┐
                   │ Ollama 7B   │  │ Gemini Flash │  │  ~/Dev/   │
                   │ (localhost) │  │ (weekly only)│  │ git repos │
                   └─────────────┘  └─────────────┘  └───────────┘
```

**The data flow for a git log entry:**
1. Express server runs git scan every 30min
2. Batches commit messages, sends to Ollama
3. Ollama returns JSON (cluster, topic, hours, status)
4. `parseLLMResponse` sanitizes the output
5. UI shows a "pending entries" card
6. You confirm → written to `progress.json`

**The LLM never touches the file.** The Express server writes only on user confirmation.

---

## The `parseLLMResponse` Utility

Handles every failure mode of small models:

```javascript
export function parseLLMResponse(rawText, fallback) {
  try {
    if (!rawText) return fallback;
    let text = rawText.trim();

    // Strip ```json ... ``` block if present
    const block = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (block?.[1]) text = block[1].trim();

    // Extract first { ... } if model wrapped output in prose
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
  } catch (e) {
    console.warn('LLM parse failed, using fallback:', e);
  }
  return fallback;
}
```

---

## Data Schema

```json
{
  "meta": {
    "dev_root": "~/Dev",
    "git_author_email": "you@email.com",
    "start_date": "2026-01-01",
    "target_years": 5,
    "weekly_goal_hours": 5
  },
  "clusters": {
    "alpha": {
      "name": "Frontier AI/ML",
      "color": "#60a5fa",
      "phase": 1,
      "checklist": { "study": false, "experiment": false, "artifact": false },
      "topics": [
        { "id": "transformers", "label": "Transformer architectures", "done": true }
      ],
      "resources": [
        { "id": "karpathy", "label": "Karpathy Zero to Hero", "done": true, "finished_date": "2025-04-10" }
      ],
      "projects": [
        {
          "id": "gpt2_fsdp",
          "label": "Train GPT-2 on 2 GPUs using FSDP",
          "status": "done",
          "artifact_url": "https://github.com/...",
          "finished_date": "2025-03-20",
          "notes": "3.2 tok/s throughput",
          "git_repos": ["~/Dev/gpt2-fsdp"]
        }
      ]
    }
  },
  "logs": [
    {
      "id": "log_001",
      "date": "2026-05-23",
      "cluster": "alpha",
      "topic": "Low-level GPU programming / Triton",
      "hours": 2.5,
      "notes": "Triton block matmul at 95% cuBLAS perf",
      "is_completed": true,
      "source": "git",
      "git_repo": "~/Dev/cuda-kernels",
      "commits": ["add block-level matmul", "fix shared memory bank conflict"]
    }
  ],
  "work_tasks": [
    {
      "id": "w1",
      "title": "Data pipeline refactor",
      "status": "wip",
      "due": null,
      "blocker": null,
      "git_repo": "~/Dev/work/data-pipeline"
    }
  ],
  "automation_log": [
    {
      "date": "2026-05-10",
      "description": "Jira → Slack standup script",
      "hours_saved_per_week": 3.75
    }
  ]
}
```

---

## Build Order

### Week 1 — Shell + Data (2 evenings)
- Scaffold Vite + React + TypeScript + Tailwind + shadcn/ui
- One-time script to parse blueprint MDs → `progress.json` (all checkboxes start unchecked)
- Dashboard page with cluster cards, color system, progress arcs
- Sidebar navigation
- Data persistence via Express server (not localStorage — commit to this from day one)

### Week 2 — Logging + Git Scanner (2 evenings)
- Activity Log view
- Semantic Logger command palette (`Cmd+K`)
- Ollama integration + `parseLLMResponse`
- Git Scanner: Node child process runs git log, sends to Ollama, surfaces pending cards
- Fallback: Ollama offline → manual form opens automatically

### Week 3 — Cluster Detail + Focus Queue (2 evenings)
- Cluster Detail pages (topics, resources, projects, checklist)
- Project drawer (slide-in from right, Framer Motion)
- Rule-based Focus Queue
- Link confirmed git commits to projects on the detail page

### Week 4 — Work Tracker + Coach (1–2 evenings)
- Office Work Tracker (tasks, automation log, flywheel counter)
- Automation Flywheel Scanner (Ollama)
- Weekly Systems Coach (Gemini Flash free key)
- Typewriter animation on coach output

### Week 5 — Heatmap + Polish (1 evening)
- 52-week activity heatmap on dashboard
- Pace timeline projection chart
- Keyboard shortcuts: `J/K` navigate, `Cmd+K` logger, `R` run coach
- PWA manifest so it installs like a desktop app

**Total: ~14–18 hours of coding**

---

## What to Skip

| Feature | Why |
|---|---|
| Mobile app | You study at a desk |
| Cloud sync | Git handles this |
| Pomodoro timer | Use your phone |
| Gamification / streaks | Weekly review is sufficient |
| LLM writing your notes | You write the reflection — that's the learning |
| GitHub API | Local git is faster, works offline, sees unpushed repos |
| Web search API | All intelligence needed lives in your blueprint and log data |

---

## Say "go" to build it

I'll scaffold the full app in one session: parse your blueprint MDs, generate the component tree, wire up Ollama and the git scanner, and give you a running app with your actual blueprint data loaded.
