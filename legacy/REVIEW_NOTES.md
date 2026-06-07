# Goal OS: Architectural Review & Handoff Fixes

> This document reviews PLANNER_IDEAS.md and IMPLEMENTATION.md for gaps a weaker model would struggle with.
> Each point is assessed: **Valid / Partially Valid / Invalid**.
> Items marked **[Added by Claude]** were not in Gemini's original review.

---

## Assessment of Gemini's Points

---

### G1. "Component Desert" — Frontend components are prose-only
**VALID.**

Gemini is correct. 10 of 14 UI components are described in comments and bullet points, not code. A weaker model will hallucinate layout, get SVG math wrong, misuse shadcn/ui component APIs, and produce broken Tailwind class combinations.

Gemini provided full code for `ClusterCard.tsx` and `ActivityHeatmap.tsx` — both are correct and should be used verbatim. The SVG approach (`strokeDashoffset` instead of `strokeDasharray` manipulation) is cleaner than what the spec described.

**Remaining components that still need full code** (Gemini missed these — see Claude additions C1–C5 below):
- `Shell.tsx` and `Sidebar.tsx`
- `SemanticLogger.tsx` (the most complex component)
- `CoachOutput.tsx` (typewriter has a performance trap)
- `PaceBar.tsx`
- `LogRow.tsx`

---

### G2. Tailwind Overwrite Bug
**PARTIALLY VALID — but the diagnosis is wrong, the fix is still right.**

Gemini claims the config "completely replaces the default color palette." That is incorrect — the spec uses `theme.extend`, not `theme`, so Tailwind defaults are preserved.

The **real problem** is different: `npx shadcn-ui@latest init` generates CSS variable token mappings in `tailwind.config.ts` (e.g., `border: 'hsl(var(--border))'`) AND a CSS variables block in `src/index.css`. If the implementer copies the spec's tailwind config verbatim without running `shadcn init` first, those CSS variable mappings are absent, breaking all shadcn components (buttons render without borders, dialogs are invisible, etc.).

**Additionally**, the spec's `index.css` contains:
```css
* { @apply border-surface-border; }
```
This conflicts with shadcn's generated `* { @apply border-border; }`. One of them overwrites the other depending on order.

**Use Gemini's tailwind config fix** — it adds the required CSS variable token mappings. Then merge `index.css` carefully: keep shadcn's generated CSS variable block, replace `* { @apply border-border; }` with `* { @apply border-surface-border; }`.

The corrected `tailwind.config.ts` from Gemini's review is correct. Use it.

---

### G3. Express Startup Crash on Missing Data Files
**VALID.**

`readFileSync` throws if the file doesn't exist. The spec says to create the files manually before running, but a weaker model will run the server first and hit a crash with an unhelpful error message.

Gemini's `ensureDataFilesExist()` function is correct. Add this call in `server/index.ts` immediately after `dotenv.config()`.

**One addition to Gemini's fix:** the seed object inside `ensureDataFilesExist` has `clusters: {}` (empty). Replace it with the full cluster seed from Section 13 of IMPLEMENTATION.md, or the app loads with no clusters visible and nothing works. The function should import the seed from a separate `server/seed.ts` file rather than inline a minimal skeleton.

---

### G4. Git Pending ID Mismatch
**ANALYSIS VALID. THE FIX CODE IS WRONG.**

Gemini correctly identified the bug: confirmed git entries stay stuck on screen forever because the ID used to filter `pendingGitEntries` doesn't match.

**However, Gemini's "fix" code is byte-for-byte identical to the original spec.** Nothing was actually changed. The real bug is not in `store.ts` — it's in `GitPendingCard.tsx`, which is never shown as full code. The issue: when `GitPendingCard` constructs the `LogEntry` to pass to `onConfirm`, it must set `entry.id` to the `PendingGitEntry.id`, not call `generateId()`.

**The actual fix** belongs in `GitPendingCard.tsx` confirm handler:

```typescript
// Inside GitPendingCard.tsx, on confirm button click:
const logEntry: LogEntry = {
  id: entry.id,  // ← CRITICAL: use the PendingGitEntry's id, not generateId()
  date: new Date().toISOString().split('T')[0],
  cluster: editedParsed?.cluster_id || 'unknown',
  topic: editedParsed?.topic_guess || entry.commit_group.commits[0] || 'Git session',
  hours: editedParsed?.hours || 1.0,
  is_completed: editedParsed?.is_completed ?? true,
  source: 'git',
  git_repo: entry.commit_group.repo,
  commits: entry.commit_group.commits,
  notes: entry.commit_group.commits.join('\n')
};
onConfirm(logEntry);
```

The `store.ts` `confirmLogEntry` function is already correct as-is. No change needed there.

---

### G5. Express Event Loop Freezing
**VALID.**

Synchronous `readdirSync` + `statSync` on a large dev folder blocks the Express event loop. During a scan, all API requests queue up and the UI appears frozen.

Gemini's fix (the `EXCLUDE_DIRS` set) is correct and significantly reduces traversal time. The expanded list adds `.next`, `dist`, `build`, `venv`, `.venv`, `target` — all correct.

**[Added by Claude]** Even with excludes, synchronous traversal still blocks for deep repos. The complete fix wraps the git scan in a child process so it never runs on the Express event loop. Update `server/routes/git.ts`:

```typescript
import { Router } from 'express';
import { fork } from 'child_process';
import { resolve } from 'path';

const router = Router();

router.post('/scan', (req, res) => {
  const devRoot = process.env.DEV_ROOT
    ? process.env.DEV_ROOT.replace(/^~/, process.env.HOME || '')
    : `${process.env.HOME}/Dev`;
  const email = process.env.GIT_AUTHOR_EMAIL || '';

  if (!email) return res.status(400).json({ error: 'GIT_AUTHOR_EMAIL not set in .env' });

  // Run git scan in a worker so the event loop never blocks
  const worker = fork(resolve(__dirname, '../gitScannerWorker.js'), [], { silent: true });
  worker.send({ devRoot, email });

  const timeout = setTimeout(() => {
    worker.kill();
    res.json({ groups: [] }); // timeout gracefully
  }, 10000);

  worker.once('message', (groups) => {
    clearTimeout(timeout);
    res.json({ groups });
  });

  worker.on('error', () => {
    clearTimeout(timeout);
    res.json({ groups: [] });
  });
});
```

Create `server/gitScannerWorker.ts` (compiled to `.js`):
```typescript
import { scanRecentCommits } from './gitScanner';

process.on('message', ({ devRoot, email }: { devRoot: string; email: string }) => {
  const groups = scanRecentCommits(devRoot, email);
  process.send!(groups);
  process.exit(0);
});
```

---

### G6. ts-node as devDependency Missing
**VALID.**

`ts-node` is used in `npm run server` but is not in the install commands. Without it, the first `npm run dev` fails.

**However**, Gemini's fix (just add `ts-node`) is incomplete. See Claude addition C6 below — `ts-node --esm` requires non-trivial tsconfig setup and will fail with ESM import errors. The better fix is to replace it with `tsx` entirely.

---

### G7. lucide-react Missing
**VALID.**

shadcn/ui components (Dialog close button, Select chevrons, Drawer handle, etc.) internally import from `lucide-react`. Without it, the app crashes at runtime the moment any of those components mount.

Add to the install command in Section 1.2:
```bash
npm install lucide-react
```

---

## Additions by Claude

Items below were not identified in Gemini's review.

---

### C1. `ts-node --esm` Will Fail — Replace with `tsx` [CRITICAL]
**[Added by Claude]**

The spec's server script is:
```json
"server": "npx ts-node --esm server/index.ts"
```

Running `ts-node --esm` with ES module imports (`import` statements) requires:
- `"type": "module"` in `package.json`, which breaks the Vite build toolchain
- OR a separate `tsconfig.server.json` with `"module": "ESNext"` and `"moduleResolution": "bundler"`
- AND a `.env` file understood by `ts-node/esm` loader

This configuration is underdetermined in the spec. A weaker model will spend hours debugging `ERR_REQUIRE_ESM` or `Cannot use import statement in a module` errors.

**Fix: Replace `ts-node` with `tsx`** — it handles ESM automatically with zero config.

```bash
# Add to devDependencies install command:
npm install -D tsx
```

Change `package.json` scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"vite --port 5173\"",
    "server": "tsx watch server/index.ts",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

`tsx watch` also gives you hot-reload on server file changes, which `ts-node` does not.

Also move `concurrently` to devDependencies — it was listed as a regular dependency in the spec, which is wrong:
```bash
npm install -D concurrently tsx
```

---

### C2. Tilde `~` in DEV_ROOT Path Won't Expand in Node.js [CRITICAL]
**[Added by Claude]**

The `.env` example in the spec uses:
```
DEV_ROOT=/Users/yourname/Dev
```

But if a user follows convention and types `DEV_ROOT=~/Dev`, `existsSync('~/Dev')` returns `false` on every machine because `~` is a shell construct, not a Node.js path. The git scanner silently finds zero repos.

Add a tilde-expansion helper to `server/gitScanner.ts`:

```typescript
import { homedir } from 'os';

function expandPath(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return p.replace('~', homedir());
  }
  return p;
}
```

Use it in `scanRecentCommits`:
```typescript
export function scanRecentCommits(devRoot: string, ...): CommitGroup[] {
  const repos = findGitRepos(expandPath(devRoot));
  ...
}
```

And in `server/routes/git.ts`, the fallback also needs it:
```typescript
const devRoot = expandPath(process.env.DEV_ROOT || '~/Dev');
```

---

### C3. `git_pending` in Seed JSON Conflicts with Progress Interface [CRITICAL]
**[Added by Claude]**

The seed `progress.json` in Section 13 includes:
```json
{
  "logs": [],
  "git_pending": []
}
```

But the `Progress` TypeScript interface in `types.ts` has no `git_pending` field:
```typescript
export interface Progress {
  meta: Meta;
  clusters: Record<ClusterId, ClusterState>;
  logs: LogEntry[];
  // NO git_pending field
}
```

When TypeScript loads the JSON and types it as `Progress`, the extra field causes a type mismatch. In strict mode this silently passes but the field is unreachable and confusing. Pending git entries should only live in Zustand store memory (`PendingGitEntry[]`), never persisted to `progress.json`.

**Fix:** Remove `"git_pending": []` from the seed JSON in Section 13. It doesn't belong there.

---

### C4. `checkOllama` Makes a Direct Browser → Ollama Request [Minor]
**[Added by Claude]**

In `src/lib/api.ts`:
```typescript
export async function checkOllama(): Promise<boolean> {
  const res = await fetch('http://localhost:11434/api/tags', ...);
```

This is a browser-side fetch directly to Ollama, bypassing the Express proxy. Ollama does allow CORS from localhost by default, so it works. But it's architecturally inconsistent (everything else goes through `/api/*`), and if the Ollama URL is ever changed or CORS settings tightened, it breaks silently.

**Fix:** Add a health-check route to `server/routes/llm.ts`:
```typescript
router.get('/health', async (_req, res) => {
  try {
    const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1500) });
    res.json({ online: r.ok });
  } catch {
    res.json({ online: false });
  }
});
```

Update `api.ts`:
```typescript
export async function checkOllama(): Promise<boolean> {
  try {
    const res = await fetch('/api/llm/health');
    const data = await res.json();
    return data.online === true;
  } catch {
    return false;
  }
}
```

---

### C5. `CoachOutput.tsx` Typewriter Will Cause Performance Problems [CRITICAL]
**[Added by Claude]**

The spec says:
> "Split text into characters. Render each character with a staggered delay. Use `motion.span` for each character."

A 200-word coach output is ~1,200 characters. Rendering 1,200 `motion.span` elements with Framer Motion stagger causes a noticeable freeze on mount and scrolls jankily. This is a known Framer Motion anti-pattern.

**Fix: Use `setInterval` + `useState` instead.** Much simpler, zero performance issue.

Full `CoachOutput.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';

interface Props {
  text: string;
  speed?: number; // ms per character, default 18
}

export function CoachOutput({ text, speed = 18 }: Props) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes (new coach run)
    setDisplayed('');
    indexRef.current = 0;

    if (!text) return;

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  // Render each line — detect ALL_CAPS section headers
  const lines = displayed.split('\n');

  return (
    <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
      {lines.map((line, i) => {
        const isSectionHeader = /^[A-Z][A-Z\s]{3,}$/.test(line.trim());
        const isActionLine = line.trim().startsWith('→');
        return (
          <div key={i} className={
            isSectionHeader ? 'text-zinc-100 font-semibold mt-4 mb-1' :
            isActionLine ? 'text-blue-400 mt-1' :
            'text-zinc-300'
          }>
            {line || ' '}
          </div>
        );
      })}
    </div>
  );
}
```

---

### C6. Full `Shell.tsx` and `Sidebar.tsx` Code Missing
**[Added by Claude]**

These are the outermost structural components. A weaker model getting the layout wrong causes every single page to look broken, and it's the first thing rendered. Providing full code prevents this.

**`Shell.tsx`:**
```tsx
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';

interface Props {
  children: React.ReactNode;
}

export function Shell({ children }: Props) {
  const location = useLocation();
  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="min-h-full px-8 py-6 max-w-5xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
```

**`Sidebar.tsx`:**
```tsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { CLUSTER_COLORS } from '../../lib/types';
import { relativeTime } from '../../lib/utils';

const CLUSTER_NAV = [
  { id: 'foundations', label: 'Foundations', symbol: '⊗' },
  { id: 'alpha',       label: 'Frontier AI',  symbol: 'α' },
  { id: 'beta',        label: 'Embodied AI',  symbol: 'β' },
  { id: 'gamma',       label: 'Embedded',     symbol: 'γ' },
  { id: 'delta',       label: 'Comp Physics', symbol: 'δ' },
  { id: 'epsilon',     label: 'Infra',        symbol: 'ε' },
] as const;

const navBase = 'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors w-full text-left';
const navInactive = 'text-zinc-400 hover:text-zinc-100 hover:bg-surface-hover';
const navActive = 'text-zinc-100 bg-surface-hover';

export function Sidebar() {
  const { llmOnline, lastGitScan } = useStore();

  const openLogger = () => {
    window.dispatchEvent(new CustomEvent('open-logger'));
  };

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-surface-border bg-surface-base">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2">
        <span className="text-blue-400 text-base">◉</span>
        <span className="font-semibold text-zinc-100 tracking-tight">GOAL OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {/* Main nav */}
        <NavLink to="/" end className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          Dashboard
        </NavLink>

        <button onClick={openLogger} className={`${navBase} ${navInactive}`}>
          Log Session
          <span className="ml-auto text-xs text-zinc-600">⌘K</span>
        </button>

        {/* Clusters */}
        <div className="pt-3 pb-1 px-3">
          <span className="text-xs uppercase tracking-wider text-zinc-600 font-medium">Clusters</span>
        </div>

        {CLUSTER_NAV.map(({ id, label, symbol }) => (
          <NavLink
            key={id}
            to={`/cluster/${id}`}
            className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}
          >
            <span className="text-xs font-mono w-4 text-center" style={{ color: CLUSTER_COLORS[id] }}>
              {symbol}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Secondary nav */}
        <div className="pt-3" />
        <NavLink to="/work" className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          Work Tracker
        </NavLink>
        <NavLink to="/review" className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          Weekly Review
        </NavLink>
      </nav>

      {/* Footer — git sync status */}
      <div className="px-4 py-3 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${llmOnline ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          <span className="text-xs text-zinc-600">
            {llmOnline ? 'Ollama online' : 'Ollama offline'}
          </span>
        </div>
        {lastGitScan && (
          <div className="text-xs text-zinc-700 mt-0.5">
            Git: synced {relativeTime(lastGitScan)}
          </div>
        )}
      </div>
    </aside>
  );
}
```

Note that `Sidebar.tsx` dispatches `new CustomEvent('open-logger')`. The `SemanticLogger.tsx` must listen for it:
```typescript
// Inside SemanticLogger useEffect:
const handleOpenEvent = () => setOpen(true);
window.addEventListener('open-logger', handleOpenEvent);
return () => window.removeEventListener('open-logger', handleOpenEvent);
```

---

### C7. Full `SemanticLogger.tsx` Code Missing [CRITICAL]
**[Added by Claude]**

This is the most complex component — a 4-state machine with LLM calls, fallback handling, and a custom confirm UI. Without full code, a weaker model will produce something completely different.

```tsx
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useStore } from '../../lib/store';
import * as api from '../../lib/api';
import { CLUSTER_COLORS, CLUSTER_LABELS, type AnyClusterId, type ParsedLogEntry, type LogEntry } from '../../lib/types';
import { generateId } from '../../lib/utils';

type State = 'input' | 'loading' | 'preview' | 'manual';

const CLUSTERS: AnyClusterId[] = ['foundations', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'work'];

export function SemanticLogger() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>('input');
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState<ParsedLogEntry | null>(null);
  // Editable preview fields
  const [editCluster, setEditCluster] = useState<AnyClusterId>('unknown');
  const [editTopic, setEditTopic] = useState('');
  const [editHours, setEditHours] = useState(1.0);
  const [editDone, setEditDone] = useState(true);

  const { confirmLogEntry, llmOnline } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Global keyboard shortcut + custom event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') { e.preventDefault(); setOpen(true); }
    };
    const onEvent = () => setOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('open-logger', onEvent);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('open-logger', onEvent);
    };
  }, []);

  // Reset to input state when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setState('input');
        setInputText('');
        setParsed(null);
      }, 200); // wait for close animation
    } else {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    if (!llmOnline) {
      setState('manual');
      return;
    }

    setState('loading');
    const result = await api.parseText(inputText);

    if (result) {
      setParsed(result);
      setEditCluster(result.cluster_id);
      setEditTopic(result.topic_guess);
      setEditHours(result.hours);
      setEditDone(result.is_completed);
      setState('preview');
    } else {
      setState('manual');
    }
  };

  const handleConfirm = () => {
    const entry: LogEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      cluster: state === 'manual' ? editCluster : (parsed?.cluster_id || editCluster),
      topic: state === 'manual' ? editTopic : (parsed?.topic_guess || editTopic),
      hours: state === 'manual' ? editHours : (parsed?.hours || editHours),
      is_completed: state === 'manual' ? editDone : (parsed?.is_completed ?? editDone),
      source: 'manual',
      notes: inputText
    };
    confirmLogEntry(entry);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-surface-card border-surface-border max-w-lg">
        <DialogTitle className="text-zinc-100 text-sm font-medium">
          {state === 'input' && 'What did you work on?'}
          {state === 'loading' && 'Parsing...'}
          {state === 'preview' && 'Confirm log entry'}
          {state === 'manual' && 'Log session manually'}
        </DialogTitle>

        {/* STATE: input */}
        {state === 'input' && (
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
              placeholder="e.g. worked on Triton matmul kernel for 2 hours, got 95% of cuBLAS perf"
              className="bg-surface-base border-surface-border text-zinc-100 placeholder:text-zinc-600 resize-none min-h-[80px]"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">
                {llmOnline ? 'Ollama online · auto-tagging enabled' : 'Ollama offline · will use manual form'}
              </span>
              <Button size="sm" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-500 text-white">
                Parse ↵
              </Button>
            </div>
          </div>
        )}

        {/* STATE: loading */}
        {state === 'loading' && (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-3/4 bg-surface-muted" />
            <Skeleton className="h-4 w-1/2 bg-surface-muted" />
            <Skeleton className="h-4 w-2/3 bg-surface-muted" />
          </div>
        )}

        {/* STATE: preview */}
        {state === 'preview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Cluster */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Cluster</label>
                <select
                  value={editCluster}
                  onChange={e => setEditCluster(e.target.value as AnyClusterId)}
                  className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100"
                >
                  {CLUSTERS.map(c => (
                    <option key={c} value={c}>{CLUSTER_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              {/* Hours */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={editHours}
                  onChange={e => setEditHours(parseFloat(e.target.value))}
                  className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100"
                />
              </div>
            </div>
            {/* Topic */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Topic</label>
              <input
                type="text"
                value={editTopic}
                onChange={e => setEditTopic(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100"
              />
            </div>
            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="done"
                checked={editDone}
                onChange={e => setEditDone(e.target.checked)}
                className="accent-blue-500"
              />
              <label htmlFor="done" className="text-sm text-zinc-300">Completed / done</label>
              {/* Cluster color badge */}
              <div
                className="ml-auto w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CLUSTER_COLORS[editCluster] }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setState('manual')}
                className="border-surface-border text-zinc-400 hover:text-zinc-100">
                Edit manually
              </Button>
              <Button size="sm" onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-500 text-white">
                Confirm ↵
              </Button>
            </div>
          </div>
        )}

        {/* STATE: manual */}
        {state === 'manual' && (
          <div className="space-y-3">
            {!llmOnline && (
              <p className="text-xs text-amber-400">Ollama offline — fill in manually</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Cluster</label>
                <select
                  value={editCluster}
                  onChange={e => setEditCluster(e.target.value as AnyClusterId)}
                  className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100"
                >
                  {CLUSTERS.map(c => (
                    <option key={c} value={c}>{CLUSTER_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Hours</label>
                <input
                  type="number" step="0.5" min="0.5" max="12"
                  value={editHours}
                  onChange={e => setEditHours(parseFloat(e.target.value))}
                  className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Topic</label>
              <input
                type="text" value={editTopic}
                onChange={e => setEditTopic(e.target.value)}
                placeholder="e.g. Kalman filter implementation"
                className="w-full bg-surface-base border border-surface-border rounded-md px-2 py-1.5 text-sm text-zinc-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="done2" checked={editDone}
                onChange={e => setEditDone(e.target.checked)} className="accent-blue-500" />
              <label htmlFor="done2" className="text-sm text-zinc-300">Completed</label>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-500 text-white">
                Save entry
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

### C8. Missing `tsconfig.json` Content [CRITICAL]
**[Added by Claude]**

The file tree lists `tsconfig.json` and `tsconfig.node.json` but neither is provided. `tsx` (the replacement for `ts-node`) works without complex config, but TypeScript compilation for the overall project still needs a correct `tsconfig.json`.

**`tsconfig.json`** (for the React/Vite frontend):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`tsconfig.node.json`** (for Vite config and server):
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": false
  },
  "include": ["vite.config.ts", "server/**/*.ts", "tailwind.config.ts"]
}
```

---

### C9. `WeeklyPage.tsx` logsText Builder Code Not Specified
**[Added by Claude]**

The spec says "build logsText (last 7 days of logs as plain text)" but never shows the code. A weaker model will format this incorrectly, which degrades coach quality since the prompt is tightly coupled to the format.

Add this helper to `src/lib/utils.ts`:

```typescript
export function buildCoachContext(progress: Progress): string {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = progress.logs
    .filter(l => new Date(l.date) >= sevenDaysAgo && l.cluster !== 'work')
    .sort((a, b) => a.date.localeCompare(b.date));

  const logLines = recentLogs.map(l =>
    `${l.date} | ${l.cluster} | ${l.topic} | ${l.hours}h | ${l.is_completed ? 'done' : 'in-progress'}`
  ).join('\n');

  const clusterSummary = Object.entries(progress.clusters).map(([id, c]) => {
    const prog = computeClusterProgress(c);
    return `${id}: ${prog}% (study:${c.checklist.study}, experiment:${c.checklist.experiment}, artifact:${c.checklist.artifact})`;
  }).join('\n');

  const weeklyHours = recentLogs.reduce((sum, l) => sum + l.hours, 0);
  const avgHours = computeWeeklyAvgHours(progress.logs);

  return `
RECENT LOGS (last 7 days):
${logLines || 'No sessions logged this week.'}

CLUSTER STATE:
${clusterSummary}

STATS:
- This week: ${weeklyHours}h
- 4-week avg: ${avgHours}h/week
- Weekly goal: ${progress.meta.weekly_goal_hours}h/week
  `.trim();
}
```

Use it in `WeeklyPage.tsx`:
```typescript
import { buildCoachContext } from '../lib/utils';

const logsText = buildCoachContext(progress);
const result = await api.runCoach(logsText);
```

---

## Updated Build Checklist Additions

Add these items to the build checklist in IMPLEMENTATION.md after Phase 1 setup:

- [ ] 0.1 Replace `ts-node` with `tsx`: `npm install -D tsx` and update package.json scripts
- [ ] 0.2 Verify `tsconfig.json` and `tsconfig.node.json` match Section C8 above
- [ ] 0.3 Set `DEV_ROOT` in `.env` using full absolute path (not `~/Dev`), e.g. `/Users/yourname/Dev`
- [ ] 0.4 Install `lucide-react`: `npm install lucide-react`
- [ ] 0.5 After running `npx shadcn-ui@latest init`, check that `tailwind.config.ts` now contains shadcn CSS variable mappings. Then manually add the `cluster` and `surface` color blocks from Section 1.5 **inside the existing extend block** — do not replace the file.
- [ ] 0.6 After `shadcn init`, check `src/index.css`. It will have a `:root` and `.dark` block with shadcn CSS variables. Keep that block. Replace shadcn's `* { @apply border-border; }` with `* { @apply border-surface-border; }`. Add the scrollbar styles from the spec below shadcn's generated styles.
- [ ] 0.7 Remove `"git_pending": []` from seed `progress.json` — it doesn't belong in the Progress type

---

## Summary: What to Give a Weaker Model

The implementing model should receive files in this order, telling it to follow IMPLEMENTATION.md but with these overrides applied:

1. `IMPLEMENTATION.md` as the base spec
2. This `REVIEW_NOTES.md` as the override/fix layer
3. Explicit instruction: **"When REVIEW_NOTES.md contradicts IMPLEMENTATION.md, REVIEW_NOTES.md wins"**
4. Explicit instruction: **"Do not generate code for Shell.tsx, Sidebar.tsx, SemanticLogger.tsx, CoachOutput.tsx, ClusterCard.tsx, or ActivityHeatmap.tsx — use the exact code from REVIEW_NOTES.md verbatim"**
5. For all other components: follow the spec in IMPLEMENTATION.md Section 10
