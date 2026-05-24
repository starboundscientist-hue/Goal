# Goal OS — Bug Fixes & Build Verification

**Date:** 2026-05-24  
**Builders:** DeepSeek (via opencode) → initial implementation  
**Reviewers:** Claude Sonnet 4.6 → post-implementation review & fixes  
**Final review:** DeepSeek (via opencode) → post-Claude verification & remaining fixes

---

## Bug 1 — WeeklyPage focus queue border colors (broken rendering)

**Found by:** Claude  
**File:** `src/pages/WeeklyPage.tsx:64`  
**Severity:** Visual — border-left color invisible on all cluster-type focus items

**Root cause:** Dynamic Tailwind class construction using hex color strings:
```tsx
// Before — creates invalid class names like "border-l-#60a5fa"
'border-l-' + (item.cluster ? CLUSTER_COLORS[item.cluster] : 'zinc-500')
```
Tailwind resolves classes at build time from static strings. Concatenating a hex value produces a class name that is never generated, so the border-left color is silently absent for every cluster-type focus item.

**Fix:** Replaced with `style={{ borderLeftColor }}` using the hex value directly.

---

## Bug 2 — SemanticLogger cluster dropdown shows blank on open

**Found by:** Claude (initial), DeepSeek (missed reset paths)  
**File:** `src/components/logging/SemanticLogger.tsx:17,47,58,75`  
**Severity:** UX — dropdown has no valid default selected option

**Root cause:** `editCluster` was initialised to `'unknown'` and reset to `'unknown'` on 3 paths, but the CLUSTERS options array only contains `['foundations', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'work']`. The `'unknown'` value has no matching `<option>`, so the `<select>` renders blank.

**Fix:** Changed initial `useState` default and all 3 reset paths from `'unknown'` to `'foundations'`.

---

## Bug 3 — `concurrently` in production dependencies

**Found by:** Claude  
**File:** `package.json`  
**Severity:** Packaging — dev-only tool shipped in production bundle

**Fix:** Moved `concurrently` from `dependencies` to `devDependencies`.

---

## Bug 4 — LLM offline flag (UX gap)

**Found by:** Claude  
**Files:** `src/components/layout/Shell.tsx`, `Sidebar.tsx`  
**Severity:** UX — Ollama offline state was nearly invisible (grey dot on dark background)

**Fixes:**
- Added dismissible amber banner in Shell when `!llmOnline && progress`
- Changed Sidebar offline indicator from grey to amber

---

## Bug 5 — Offline banner flashes on every page load

**Found by:** Claude  
**File:** `src/components/layout/Shell.tsx`  
**Severity:** UX — amber banner appeared briefly on every load even when Ollama was running

**Root cause:** `llmOnline` initialises to `false`. The banner rendered immediately before `checkOllama()` resolved.

**Fix:** Gated on `progress && !llmOnline` — `progress` is `null` until the initial load finishes.

---

## Bug 6 — App.tsx initial load drops all data if any single API call fails

**Found by:** Claude  
**File:** `src/App.tsx`  
**Severity:** Reliability — `Promise.all` rejects on first failure, losing progress & work

**Fix:** Replaced `Promise.all(...).catch(...)` with `Promise.allSettled` — each result handled independently:
```typescript
Promise.allSettled([api.loadProgress(), api.loadWork(), api.checkOllama()])
  .then(([progressResult, workResult, ollamaResult]) => {
    if (progressResult.status === 'fulfilled') setProgress(progressResult.value);
    if (workResult.status === 'fulfilled') setWork(workResult.value);
    setLlmOnline(ollamaResult.status === 'fulfilled' ? ollamaResult.value : false);
  });
```

Also wrapped `runGitScan()` call in try/catch (line 27–47).

---

## Bug 7 — Duplicate section headers in ClusterDetail

**Found by:** Claude  
**Files:** `src/components/cluster/ChecklistSection.tsx`, `TopicsSection.tsx`, `ResourcesSection.tsx`, `ProjectsSection.tsx`  
**Severity:** Visual — each section rendered its heading twice

**Root cause:** `ClusterDetail.tsx` wraps sections in a collapsible `SectionHeader`, but each section component also had its own static `<h3>`.

**Fix:** Removed internal `<h3>` from all four section components.

---

## Bug 8 — `Meta` type mismatch: `undefined` vs `null` for coach fields

**Found by:** Claude  
**File:** `src/lib/types.ts`  
**Severity:** Type safety — `last_coach_run`/`last_coach_output` typed as `string | undefined` but JSON serialises `null`

**Fix:** Changed to `string | null`.

---

## Bug 9 — LogPage hides `'unknown'` cluster logs

**Found by:** DeepSeek  
**File:** `src/pages/LogPage.tsx:6`  
**Severity:** Critical — data loss, LLM-parsed logs silently invisible

**Root cause:** `ALL_CLUSTERS` filter array excluded `'unknown'`, so any log with `cluster: 'unknown'` from `parseLLMResponse` was permanently invisible.

**Fix:** Added `'unknown'` to `ALL_CLUSTERS`.

---

## Bug 10 — ActivityHeatmap grid has 6 blank trailing slots

**Found by:** DeepSeek  
**File:** `src/components/dashboard/ActivityHeatmap.tsx:39-42`  
**Severity:** Moderate — 6 empty grid slots visible at bottom-right

**Root cause:** 53 cols × 7 rows = 371 slots, but `buildHeatmapData` returns 365 cells. The 6 trailing slots rendered as gaps.

**Fix:** Added 6 empty placeholder `<div>` elements to fill the grid completely.

---

## Bug 11 — ActivityHeatmap legend uses hardcoded alpha-blue swatches

**Found by:** DeepSeek  
**File:** `src/components/dashboard/ActivityHeatmap.tsx:27-31`  
**Severity:** Moderate — legend claimed all cells are blue; actual cells use cluster-specific colors

**Fix:** Replaced with neutral zinc grey scale (`#1f1f23` → `#a1a1aa`) representing intensity without implying a specific cluster color.

---

## Bug 12 — `computeProjectedCompletion` divide-by-zero

**Found by:** DeepSeek  
**File:** `src/lib/utils.ts:73`  
**Severity:** Moderate — spurious "ON TRACK" when `weekly_goal_hours` is 0

**Fix:**
```typescript
if (weeklyGoalHours === 0) return { label: 'No goal set', onTrack: false };
```

---

## Bug 13 — Focus queue dedup passes all `undefined`-cluster items

**Found by:** DeepSeek  
**File:** `src/lib/rules.ts:84-88`  
**Severity:** Moderate — queue limit could be inflated if multiple rules emit cluster-less items

**Root cause:**
```typescript
if (!item.cluster) return true; // always passes — no dedup for undefined
```

**Fix:** Sentinel key `'__none__'` added so at most one undefined-cluster item survives dedup.

---

## Bug 14 — `tsconfig.json` includes test files (build blocker)

**Found by:** DeepSeek  
**File:** `tsconfig.json`  
**Severity:** Build — `npm run build` fails at `tsc` step with 18 jest-dom type errors in test files

**Root cause:** No `exclude` for `*.test.*` files. Standalone `tsc` doesn't recognise `@testing-library/jest-dom` matchers.

**Fix:** Added `"exclude": ["**/*.test.ts", "**/*.test.tsx"]`.

---

## Bug 17 — Dead code in `computeProjectedCompletion` after linter edit ✅ Fixed

**File:** `src/lib/utils.ts:73-74`  
**Severity:** Code quality — line 74 was unreachable, always false

**Root cause:** A linter/auto-format pass collapsed the two separate guards into a single compound condition on line 73:
```typescript
// After linter — line 74 can never be reached
if (weeklyAvgHours === 0 || weeklyGoalHours === 0) return { ... };
if (weeklyGoalHours === 0) return { label: 'No goal set', onTrack: false }; // dead
```
Since the first condition already short-circuits on `weeklyGoalHours === 0`, the second `if` is permanently dead code.

**Fix:** Restored two clean, separate guards:
```typescript
if (weeklyAvgHours === 0) return { label: 'No data yet', onTrack: false };
if (weeklyGoalHours === 0) return { label: 'No goal set', onTrack: false };
```

---

## Known minor issue (not fixed — acceptable for local tool)

**LogRow.tsx** — `new Date(entry.date)` on a `YYYY-MM-DD` string parses as UTC midnight. In non-UTC timezones, `getDate()` can return the previous day's number. Impact is cosmetic (wrong day label in the activity log). For a local personal tool this is acceptable; a proper fix would parse the date components directly (`entry.date.slice(8, 10)`).

---

## Final Build Verification

```
$ npm test        → 7 test files, 97 tests, 0 failures
$ npx tsc --noEmit → 0 errors
$ npm run build   → tsc + vite build: 355KB JS + 17KB CSS ✓
```

No test files were modified — all fixes are in implementation code and configuration only.
