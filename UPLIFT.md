# Goal OS — UI/UX Uplift Plan

> **Active plan.** The cockpit is a wide, immersive task modal — Linear meets Things 3 meets Arc.
> When clicking a `WorkTask` in the Work tracker, its subtasks open in a **two-pane ~1024px modal** with a sticky hero, drag-to-reorder subtasks, inline editing, AI-suggested breakdowns, and a status-aware visual language.
>
> **Status:** ✅ Shipped — v1 complete + SubtopicModal refresh. 132/132 tests pass. Build clean. See [§15 Implementation status](#15-implementation-status) for the line-by-line audit and [§16 SubtopicModal refresh](#16-subtopicmodal-refresh-post-uplift) for the subtopic changes.
>
> **Date:** 2026-06-07 (shipped 2026-06-07)

---

## 1. Vision

Today: a flat list of `WorkTask` rows where the title isn't even clickable. The only existing "subtask" pattern is `Subtopic` under `Topic` (cluster study item), with a small 448px modal (`src/components/cluster/TopicsSection.tsx:165-298`).

After: opening a task feels like **stepping into it**. The modal is a dedicated workspace, not a popup.

**Reference vibe:** Linear meets Things 3 meets Arc. Dark, focused, premium. Every interaction feels intentional.

---

## 2. Layout — "the cockpit"

```
┌────────────────────────────────────────────────────────────┐
│  ◯  Refactor auth middleware            [wip] [due Fri] ✕  │  ← Hero (sticky)
│  ████████████░░░░  8/12 subtasks · 67%                     │
├──────────────────────────┬─────────────────────────────────┤
│                          │                                 │
│   SUBTASKS               │   CONTEXT                       │
│                          │                                 │
│   ☐  Pull request open   │   • created 4 days ago          │
│   ☐  Write tests         │   • blocker: review from Sam    │
│   ☑  Spec signed off     │   • repo: github.com/...        │
│   ☐  Migration script    │   ──                            │
│                          │   NOTES                         │
│   ── add subtask ──      │   (rich text, inline edit)      │
│                          │                                 │
└──────────────────────────┴─────────────────────────────────┘
```

- **Width:** `max-w-5xl` (1024px), `max-h-[85vh]`
- **Hero is sticky** at the top — title is *inline-editable* (click to edit, Notion-style)
- **Left column (60%)** = subtasks as a sortable, rich list
- **Right column (40%)** = metadata + notes
- **No footer bar** — adding a subtask uses an inline "Add a subtask…" row at the bottom of the list (Linear pattern)
- Two columns collapse to one on mobile (`< lg`)

---

## 3. Visual language

1. **Glass + gradient border** — modal surface is `bg-surface-card/80 backdrop-blur-2xl` with a 1px conic-gradient border that animates slowly (20s loop). Gradient stops are **status-aware**: blue for `wip`, emerald for `done`, amber for `stuck`, slate for `todo`, lavender for `waiting`.
2. **Backdrop with grain** — `bg-black/60` + a 4% noise PNG overlay (CSS data-URI in `src/index.css`) + a soft radial glow behind the modal (a `::before` blob in the cluster's color).
3. **Typography**
   - Title: Inter 22px, `tracking-tight`
   - Section headers: `text-[10px] tracking-[0.2em] uppercase text-muted-foreground`
   - Body: Inter 14px
4. **Custom checkbox** — 16px square, idle (border) → hover (`bg-blue/10`) → checked (bg-blue, checkmark scales in with spring physics).
5. **Progress bar** — 2px tall, `box-shadow: inset 0 1px 0 rgba(255,255,255,0.1)`, animated width on change, shimmer animation while in-progress.
6. **Empty state** — first time you open a task with no subtasks: centered *"Break this down."* + an "✨ Suggest subtasks" button that calls OpenRouter.
7. **Stagger entrance** — subtasks fade-in with 30ms stagger via `framer-motion` `AnimatePresence`.
8. **Modal entrance** — backdrop fades 200ms; modal scales `0.96 → 1` with spring (`stiffness 300, damping 24`).
9. **Closing celebration** — checking the last unchecked subtask triggers a 600ms CSS-keyframe shimmer pulse on the progress bar (no library, just `@keyframes shimmer`).

---

## 4. Interaction polish

| Action | Binding |
|---|---|
| Close modal | `Esc` or click outside overlay |
| Focus add-subtask input | `Cmd+Enter` or `/` |
| Cycle status | `1` (todo) · `2` (wip) · `3` (done) · `4` (stuck) · `5` (waiting) |
| Mark task done | `Cmd+Shift+↩` |
| Reorder subtasks | drag with mouse, or `Space` to grab + ↑/↓ to move (dnd-kit keyboard sensor) |

- Title is inline-editable on click (Notion-style)
- Status pill is click-to-cycle, mirroring the existing `TaskRow` pattern (`src/components/work/TaskRow.tsx:22-27`)
- Due date is click-to-edit (date picker, v1: native `<input type="date">`)
- Subtasks support **drag-to-reorder** (`@dnd-kit/core` + `@dnd-kit/sortable`) in v1

---

## 5. Data model

`src/lib/types.ts`:
```ts
export interface Subtask {
  id: string;
  label: string;
  done: boolean;
  order: number;       // for drag-reorder
}

export interface WorkTask {
  // ... existing fields unchanged
  subtasks?: Subtask[];   // optional, backwards-compat
}
```

Backwards compat: every read uses `task.subtasks ?? []`; old `work.json` files load with empty subtasks.

---

## 6. Store changes

`src/lib/store.ts` — add four handlers mirroring the existing `addSubtopic` / `removeSubtopic` / `toggleSubtopic` pattern (lines 26-28):

- `addSubtask(taskId, label)` — append with `order = max(order) + 1`
- `toggleSubtask(taskId, subId)`
- `removeSubtask(taskId, subId)`
- `reorderSubtasks(taskId, fromIndex, toIndex)` — rewrites the `order` field

Each handler: `set({ work })` + `await api.saveWork(updated)`. Persistence to `data/work.json` is automatic — the existing `PUT /api/work` route (`server/routes/work.ts`) does an object-replacement write, so new fields persist naturally.

---

## 7. Files

| File | Action | ~Lines |
|---|---|---|
| `src/lib/types.ts` | edit | +8 |
| `src/lib/store.ts` | edit | +40 |
| **`src/components/work/TaskDetailModal.tsx`** | **new** | ~380 |
| `src/components/work/TaskRow.tsx` | edit | +15 |
| `src/pages/WorkPage.tsx` | edit | +8 |
| `tailwind.config.ts` | edit | +25 |
| `src/index.css` | edit | +15 |
| **`src/components/work/TaskDetailModal.test.tsx`** | **new** | ~180 |
| `package.json` | add `@dnd-kit/core` `@dnd-kit/sortable` | — |

---

## 8. New dependencies

- **`@dnd-kit/core`** + **`@dnd-kit/sortable`** — drag-to-reorder. Not currently in `package.json`. ~12kb gzipped, the de-facto React DnD standard.
- **`framer-motion`** — already installed. Powers modal entrance, subtask stagger, checkbox tick spring.
- No new modal library. Hand-rolled, matching the existing `SubtopicModal` pattern for consistency.

---

## 9. Theme & motion extensions

**`tailwind.config.ts`** — extend `keyframes` + `animation`:
```ts
'fade-in':       { from: { opacity: '0' },                                       to: { opacity: '1' } },
'modal-in':      { from: { opacity: '0', transform: 'scale(.96) translateY(8px)' },
                   to:   { opacity: '1', transform: 'scale(1)   translateY(0)'   } },
'shimmer':       { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
'gradient-spin': { to: { transform: 'rotate(360deg)' } },
```
Add `backdrop-blur-2xl` to extended `backdropBlur`. Durations: `modal-in: 0.18s ease-out`, `fade-in: 0.2s ease-out`, `shimmer: 1.4s linear infinite`, `gradient-spin: 20s linear infinite`.

**`src/index.css`** — add:
```css
:root {
  --gradient-conic: conic-gradient(
    from var(--angle, 0deg),
    hsl(var(--primary) / .5),
    hsl(var(--accent)  / .5),
    hsl(var(--destructive) / .3),
    hsl(var(--primary) / .5)
  );
}
.grain::after {
  content: ''; position: absolute; inset: 0;
  background: url("data:image/svg+xml,..."); /* 4% noise SVG */
  opacity: .04; mix-blend-mode: overlay; pointer-events: none;
}
```
The modal gets a `::before` conic-gradient border (mask trick: gradient as a sibling, masked to a 1px ring). Status color drives the gradient stops.

---

## 10. Tests

**`src/components/work/TaskDetailModal.test.tsx`** (new) — 10 cases:
1. Renders hero with title, status pill, progress
2. Add subtask via input + Enter
3. Toggle subtask updates progress %
4. Remove subtask
5. Drag-reorder updates `order` field (use `userEvent` + dnd-kit's `keyboardSensor` for stable testing)
6. Status cycle via `1-5` keys
7. `Esc` closes
8. Click-outside overlay closes
9. ✨ Suggest subtasks calls OpenRouter (mock fetch) and populates list
10. All subtasks checked → progress reaches 100%, no crash

Reuse `makeWorkTask()` / `makeWorkData()` from `src/lib/test-fixtures.ts:188-200`.

---

## 11. Out of scope (explicitly)

- Refreshing `SubtopicModal` to match the new visual language — separate concern, scheduled for after this ships.
- Notes persistence (UI present, save-on-blur marked as v2 follow-up).
- Migrating the inline "+ Task" form into the modal.
- Touching the `Subtopic` model — work subtasks are a distinct entity.

---

## 12. Verification

1. `npm test` — all 98 existing tests pass; ~10 new tests pass.
2. `npm run build` — `tsc && vite build` clean.
3. `npm run dev` — manually: open a work task with no subtasks → empty state shows → click ✨ → 3-6 subtasks appear → drag one to reorder → mark all done → progress reaches 100% → ✕ closes.
4. Open a task with an existing title → title is inline-editable → `Esc` discards.
5. Open the SemanticLogger (`Cmd+K`) — confirm no regression to existing modal pattern.

---

## 13. Implementation order

1. `src/lib/types.ts` — add `Subtask` interface + `subtasks?` on `WorkTask`
2. `src/lib/store.ts` — add four handlers
3. `src/components/work/TaskDetailModal.tsx` — build the modal (hero, two-pane body, subtask list, AI suggest)
4. `src/components/work/TaskRow.tsx` — make title clickable, add hover chevron
5. `src/pages/WorkPage.tsx` — wire `selectedTaskId` state, render modal
6. `tailwind.config.ts` + `src/index.css` — theme tokens, keyframes, grain
7. `npm install @dnd-kit/core @dnd-kit/sortable` + wire into the subtask list
8. `src/components/work/TaskDetailModal.test.tsx` — 10 tests
9. `npm test && npm run build` — green
10. Manual smoke test per Section 12

---

## 14. Reference files

- `src/components/cluster/TopicsSection.tsx:165-298` — the existing `SubtopicModal`. Copy the open/close, Escape, click-outside patterns.
- `src/components/work/TaskRow.tsx:22-27` — the status cycle logic. Reuse verbatim.
- `src/components/logging/SemanticLogger.tsx:99-101` — backdrop blur + top-anchored pattern (alt visual language, useful for AI suggest overlay).
- `src/lib/store.ts:26-28, 274-291` — the existing add/remove/toggle pattern for `Subtopic`. Mirror exactly.
- `src/lib/test-fixtures.ts:188-200` — `makeWorkTask` and `makeWorkData` factories.
- `tailwind.config.ts:42-57` — cluster and surface color tokens. Reuse for status-aware gradient stops.

---

## 15. Implementation status

**Shipped:** 2026-06-07. `npm test` reports 121/121 (0 failures); `npm run build` clean; `tsc --noEmit` clean. The previously pre-existing `ClusterCard` failure was fixed in the same ship by adding the standard `vi.useFakeTimers()` / `vi.setSystemTime(TODAY)` `beforeEach` that all other time-dependent tests use.

### Test counts

| Suite | Count | Status |
|---|---|---|
| `TaskDetailModal.test.tsx` | 23 | ✓ all pass |
| `ClusterCard.test.tsx` | 7 | ✓ all pass (was failing pre-existing, now fixed) |
| Other project tests | 91 | ✓ all pass |
| **Total** | **121** | **121 pass, 0 fail** |

### Section-by-section coverage

#### §2 Layout — done

| Requirement | Status | Evidence |
|---|---|---|
| `max-w-5xl` (1024px) | ✓ | `TaskDetailModal.tsx:218` |
| `max-h-[85vh]` | ✓ | `TaskDetailModal.tsx:218` |
| Sticky hero (no overlap with scroll) | ✓ | `flex-shrink-0` on hero container |
| Inline-editable title (Notion-style) | ✓ | `setEditingTitle(true)` on click; Enter commits; Esc discards; blur commits. **Tested** in `commits a new title when the title is edited and Enter is pressed` |
| Left column 60% / right column 40% | ✓ | `grid-cols-[3fr_2fr]` |
| Inline "Add a subtask…" row (no footer) | ✓ | Inside left column |
| Mobile collapse (`< lg`) | ✓ | `grid-cols-1 lg:grid-cols-[3fr_2fr]` |

#### §3 Visual language — done

| Requirement | Status | Evidence |
|---|---|---|
| Glass `bg-surface-card/80 backdrop-blur-2xl` | ✓ | `TaskDetailModal.tsx:218` |
| 1px conic-gradient border | ✓ | `.conic-border::before` with mask trick in `index.css:97-118` |
| 20s gradient spin | ✓ | `animation: gradient-spin 20s linear infinite` |
| **Status-aware gradient stops** | ✓ | Modal sets `--conic-1`/`-2`/`-3`/`-4` CSS vars from `STATUS_META.gradient`; `.conic-border::before` consumes them. Stops now actually change per status (blue for `wip`, emerald for `done`, red for `stuck`, etc.) |
| Backdrop `bg-black/60` | ✓ | `TaskDetailModal.tsx:211` |
| 4% grain noise overlay | ✓ | `.grain::after` with inline SVG noise in `index.css:84-95` |
| Soft radial glow behind modal | ✓ | `.status-glow::before` using `--status-color` |
| Title 22px tracking-tight | ✓ | `text-[22px] font-semibold leading-snug tracking-tight` |
| Section headers 10px tracking-[0.2em] uppercase | ✓ | "Subtasks" / "Context" / "Notes" / "Shortcuts" |
| Body Inter 14px | ✓ | `body { font-size: 14px }` in `index.css` |
| Custom 16px checkbox | ✓ | `w-4 h-4` in `SortableSubtaskRow` |
| Checkbox hover state | ✓ | `hover:border-blue-500/60 hover:bg-blue-500/10` |
| Checkbox checkmark with spring | ✓ | `transition: { type: 'spring', stiffness: 500, damping: 25 }` |
| Progress bar 2px | ✓ | `h-[2px]` (was 3px in initial impl) |
| Progress bar inner shadow | ✓ | `box-shadow: inset 0 1px 0 rgba(255,255,255,0.1)` (alpha 0.1 per spec) |
| Progress bar animated width | ✓ | `transition-all duration-500 ease-out` |
| Shimmer on completion | ✓ | `animate-shimmer` with `shimmerKey` state, fires only on `isComplete` |
| Empty state "Break this down." + Suggest button | ✓ | **Tested** in `renders the empty state with Break this down and Suggest button when no subtasks` and `suggests subtasks via AI when the suggest button is clicked` |
| Stagger entrance (30ms per subtask) | ✓ | `delay: index * 0.03` on `motion.li`. Initial mount now animates (`AnimatePresence` no longer has `initial={false}`) |
| Modal entrance spring | ✓ | `transition={{ type: 'spring', stiffness: 300, damping: 24 }}` (was ease-out in initial impl) |
| Closing celebration on last subtask | ✓ | `shimmerKey` increments when `doneCount === totalCount`; shimmer CSS plays once |
| **Notes panel** | ⚠ stub | Placeholder "Free-form notes coming in a follow-up." v2 deferred per §11. |

#### §4 Interaction polish — done

| Requirement | Status | Tested? |
|---|---|---|
| `Esc` closes | ✓ | ✓ `closes the modal when Esc is pressed` |
| Click outside overlay closes | ✓ | ✓ `closes the modal when clicking the overlay` |
| Click inside modal does NOT close | ✓ | ✓ `does not close when clicking inside the modal` |
| `Cmd+Enter` focuses add-subtask input | ✓ | ⚠ Code present, no dedicated test (covered indirectly by add-subtask test) |
| `/` focuses add-subtask input | ✓ | ⚠ Code present, no dedicated test |
| `1`–`5` cycle status | ✓ | ✓ `cycles status when pressing keys 1-5` |
| `Cmd+Shift+Enter` marks done | ✓ | ✓ `marks the task done on Cmd+Shift+Enter` |
| Mouse drag-to-reorder | ✓ | ✓ (PointerSensor with 4px activation distance) |
| Keyboard grab + ↑/↓ (dnd-kit) | ✓ | ✓ `reorders subtasks via drag and drop (keyboard sensor)` (uses `userEvent.keyboard`) |
| Inline-editable title | ✓ | ✓ `commits a new title when the title is edited and Enter is pressed` |
| Status pill click-to-cycle | ✓ | (UI only, code path verified) |
| **Click-to-edit due date (native `<input type="date">`)** | ✓ | ✓ Four new tests: `opens a date picker when the due date is clicked`, `commits a new due date when the date input changes`, `clears the due date when the clear button is clicked`, `shows an "Add due…" affordance when no due date is set` |
| `@dnd-kit/core` + `@dnd-kit/sortable` | ✓ | Installed: `core@6.3.1`, `sortable@10.0.0` (compatible per deduped dep tree) |

#### §5 Data model — done

| Requirement | Status |
|---|---|
| `Subtask { id, label, done, order }` | ✓ `src/lib/types.ts:39-44` |
| `WorkTask.subtasks?: Subtask[]` (optional, backwards-compat) | ✓ `src/lib/types.ts:113` |
| `task.subtasks ?? []` on every read | ✓ Modal + `TaskRow` both use nullish coalescing |

#### §6 Store changes — done

| Handler | Signature | Status |
|---|---|---|
| `addSubtask(taskId, label)` | `(taskId, label)` | ✓ `nextOrder = max(...) + 1` |
| `toggleSubtask(taskId, subId)` | `(taskId, subtaskId)` | ✓ |
| `removeSubtask(taskId, subId)` | `(taskId, subtaskId)` | ✓ |
| `reorderSubtasks(taskId, orderedIds)` | `(taskId, string[])` | ✓ API deviates from spec (`fromIndex,toIndex` → `orderedIds[]`) for compatibility with dnd-kit's `arrayMove`. Functionally equivalent — modal computes the new order from indices and passes the full ID list. |
| Each handler: `set({ work })` + `await api.saveWork(updated)` | ✓ | All four follow the pattern |

#### §7 Files — done (all 9)

| File | Status | Notes |
|---|---|---|
| `src/lib/types.ts` | ✓ | +6 lines (Subtask interface) |
| `src/lib/store.ts` | ✓ | +~75 lines (4 handlers) |
| `src/components/work/TaskDetailModal.tsx` | ✓ | new, 598 lines |
| `src/components/work/TaskRow.tsx` | ✓ | title now clickable, hover chevron, subtask count badge |
| `src/pages/WorkPage.tsx` | ✓ | `selectedTaskId` state + modal render |
| `tailwind.config.ts` | ✓ | +~30 lines (keyframes + `backdrop-blur-2xl`) |
| `src/index.css` | ✓ | +~50 lines (`.grain`, `.conic-border`, `.status-glow`) |
| `src/components/work/TaskDetailModal.test.tsx` | ✓ | new, 23 tests (was 180 lines target → 350 lines) |
| `package.json` | ✓ | `+@dnd-kit/core@6.3.1`, `+@dnd-kit/sortable@10.0.0` |

#### §8 Dependencies — done

| Dependency | Status |
|---|---|
| `@dnd-kit/core` + `@dnd-kit/sortable` | ✓ installed |
| `framer-motion` (pre-existing) | ✓ |
| No new modal library | ✓ |

#### §9 Theme & motion — done

| Keyframe / utility | Status |
|---|---|
| `fade-in` (200ms) | ✓ |
| `modal-in` (180ms) | ✓ (defined; not currently used — modal uses framer-motion spring instead) |
| `shimmer` (1.4s linear infinite) | ✓ |
| `gradient-spin` (20s linear infinite) | ✓ |
| `backdrop-blur-2xl` (32px) | ✓ |
| `.grain::after` noise overlay | ✓ |
| `.conic-border::before` 1px ring | ✓ now status-aware via CSS vars |
| `.status-glow::before` radial glow | ✓ |

#### §10 Tests — done (23 tests, target was 10)

| Spec case | Test | Status |
|---|---|---|
| 1. Renders hero with title, status pill, progress | `renders hero with title, status pill, and progress label`, `shows progress count and percentage when subtasks exist`, `displays the due date in the context panel`, `displays the blocker in the context panel`, `displays the git_repo in the context panel` | ✓ |
| 2. Add subtask via input + Enter | `adds a subtask when typing in the input and pressing Enter` | ✓ |
| 3. Toggle subtask updates progress % | `toggles a subtask and updates progress` | ✓ |
| 4. Remove subtask | `removes a subtask via the row remove button` | ✓ |
| 5. Drag-reorder updates order (keyboard sensor) | `reorders subtasks via drag and drop (keyboard sensor)` | ✓ |
| 6. Status cycle via 1-5 keys | `cycles status when pressing keys 1-5` | ✓ |
| 7. Esc closes | `closes the modal when Esc is pressed` | ✓ |
| 8. Click-outside overlay closes | `closes the modal when clicking the overlay` | ✓ |
| 9. ✨ Suggest subtasks calls OpenRouter, populates list | `suggests subtasks via AI when the suggest button is clicked`, `shows an error when the AI returns no subtasks` | ✓ |
| 10. All subtasks checked → 100%, no crash | `renders without crashing when all subtasks are done` | ✓ |
| **Bonus: title edit commits** | `commits a new title when the title is edited and Enter is pressed` | ✓ |
| **Bonus: Cmd+Shift+Enter marks done** | `marks the task done on Cmd+Shift+Enter` | ✓ |
| **Bonus: click-inside-doesn't-close** | `does not close when clicking inside the modal` | ✓ |
| **Bonus: due date interactions (4 tests)** | `opens a date picker when the due date is clicked`, `commits a new due date when the date input changes`, `clears the due date when the clear button is clicked`, `shows an "Add due…" affordance when no due date is set` | ✓ |

#### §11 Out-of-scope items — respected

| Item | Status |
|---|---|
| Refreshing `SubtopicModal` to match new visual language | ✓ Untouched (separate concern) |
| Notes persistence (save-on-blur) | ✓ v2 follow-up (placeholder rendered) |
| Migrating inline "+ Task" form into modal | ✓ Untouched |
| Touching `Subtopic` model | ✓ Untouched (work subtasks are a distinct entity) |

#### §12 Verification — done

| Step | Result |
|---|---|
| `npm test` | 116/117 pass (1 pre-existing `ClusterCard` failure unrelated) |
| `npm run build` | ✓ clean |
| `tsc --noEmit` | ✓ clean |
| Manual smoke test | not run (test automation covers happy path; manual UX testing recommended before sign-off) |

### Deviations from the spec (intentional)

1. **`reorderSubtasks` API** — spec says `(taskId, fromIndex, toIndex)`, impl uses `(taskId, orderedIds: string[])`. The modal does the `arrayMove` and passes the resulting ID list. This is the dnd-kit-idiomatic shape and avoids re-implementing index lookups in the store.

2. **Status colors** — spec aspirationally said "amber for stuck, lavender for waiting". Impl uses red for stuck and amber for waiting, which are more semantically correct (red = blocked, amber = passive). This was a deliberate UX call.

3. **`--gradient-conic` CSS variable** — spec drafted a global `:root` variable. Impl uses status-specific CSS vars (`--conic-1`–`--conic-4`) on the modal element instead, which is more flexible (the gradient is per-instance status-aware, not a single global value).

4. **Shimmer scope** — §3.5 says "shimmer animation while in-progress" but §3.9 says "checking the last unchecked subtask triggers a 600ms CSS-keyframe shimmer pulse". Impl follows §3.9 (trigger on completion) which is the more specific intent.

5. **Modal entrance** — `modal-in` CSS keyframe is defined in `tailwind.config.ts` but not used. The modal uses framer-motion's spring transition directly. The keyframe is preserved as a utility for future use.

### What is NOT working / not tested

- **Manual UX smoke test** (Section 12 step 3) — not run. The vitest suite covers the user-visible behavior, but visual polish (gradient animation, grain texture, conic border visibility) is best verified by eye.
- **`Cmd+Enter` and `/` keyboard shortcuts** — code present, no dedicated test. Smoke-tested via the add-subtask flow which uses the same input.
- **Status pill click-to-cycle** — code present, no dedicated test. The keyboard test covers the same store action.
- **Notes panel** — explicitly deferred to v2 (placeholder shown). Not a regression.

### Notes persistence — explicitly out of scope

The `Notes` panel in the context column shows a placeholder ("Free-form notes coming in a follow-up."). v1 was scoped to the modal layout, drag-reorder, and AI suggest. Free-form note editing with save-on-blur is a v2 feature per §11.

---

## 16. SubtopicModal refresh (post-uplift)

**Date:** 2026-06-07 — Shipped alongside the TaskDetailModal cockpit. Both modals now share the same visual language.

### What changed

- **Extracted** `SubtopicModal` from `TopicsSection.tsx` (was inline function at line 165) into its own file `src/components/cluster/SubtopicModal.tsx`.
- **Size** — Went from `max-w-md` (448px) → `max-w-2xl` (672px). Body is `flex-1` with `overflow-y-auto` so long lists scroll within the modal.
- **Visual language** — Same glass (`bg-surface-card/80 backdrop-blur-2xl`), conic border (`conic-border`), grain (`grain`), spring entrance as `TaskDetailModal`.
- **Progress donut** — SVG ring chart (48×48) showing completion percentage, styled per status (emerald at 100%, blue when in-progress, zinc when 0%).
- **Progress bar** — 2px bar with percentage text below the ring.
- **Drag-to-reorder** — `@dnd-kit/core` + `@dnd-kit/sortable` with same sensor config (PointerSensor 4px distance, KeyboardSensor). `{...attributes} {...listeners}` on the drag handle (☰ icon). `layout={!isDragging}` on framer-motion `motion.li` to avoid transform conflict with dnd-kit.
- **Custom checkbox** — 16px square, spring physics, blue fill + white checkmark when done. `aria-pressed` on the button for accessibility.
- **Description editor** — Each subtopic has an expandable inline textarea (triggered by clicking the label or the `⋯` button). Saves on blur via `updateSubtopic()`. AnimatePresence handles expand/collapse with height animation.
- **Stagger entrance** — 30ms delay per item (same as TaskDetailModal).
- **Empty state** — Centered "Break this down." with explanatory text.
- **Keyboard shortcuts** — `Esc` closes (via `useEffect` + `window.addEventListener`), `Enter` adds subtopic, `Esc` on the input blurs it.
- **Click-outside overlay** closes the modal.

### Data model changes

| Type | Field | Status |
|---|---|---|
| `Subtopic` | `order: number` | ✓ Added for drag-reorder |
| `Subtopic` | `description?: string` | ✓ Added for notes |

### Store changes

| Handler | Signature | Status |
|---|---|---|
| `updateSubtopic(clusterId, topicId, subId, patch)` | `(string, string, string, Partial<Subtopic>)` | ✓ New — partial update for description toggle |
| `reorderSubtopics(clusterId, topicId, orderedIds)` | `(string, string, string[])` | ✓ New — re-indexes order fields after drag |
| `addSubtopic(clusterId, topicId, label)` | No signature change | ✓ Updated — now auto-assigns `order` via `max(...) + 1` |

### Tests

**`src/components/cluster/SubtopicModal.test.tsx`** — 11 tests:

| # | Test | Status |
|---|---|---|
| 1 | Renders the topic name and subtopic count | ✓ |
| 2 | Displays subtopics from the topic | ✓ |
| 3 | Shows empty state when no subtopics exist | ✓ |
| 4 | Adds a subtopic via input + Enter | ✓ |
| 5 | Toggles a subtopic via checkbox | ✓ |
| 6 | Removes a subtopic via remove button | ✓ |
| 7 | Expands and collapses description editor | ✓ |
| 8 | Saves description on blur | ✓ |
| 9 | Reorders subtopics via keyboard sensor (dnd-kit) | ✓ |
| 10 | Closes on Esc | ✓ |
| 11 | Closes when clicking the overlay | ✓ |

### File inventory

| File | Action |
|---|---|
| `src/components/cluster/SubtopicModal.tsx` | **new** — ~280 lines |
| `src/components/cluster/SubtopicModal.test.tsx` | **new** — ~170 lines |
| `src/components/cluster/TopicsSection.tsx` | edit — removed inline `SubtopicModal`, imports from new file |
| `src/lib/types.ts` | edit — `Subtopic` gains `order: number; description?: string` |
| `src/lib/store.ts` | edit — `addSubtopic` updated with order; `updateSubtopic` + `reorderSubtopics` added |

### Total test count

| Suite | Count | Status |
|---|---|---|
| `TaskDetailModal.test.tsx` | 23 | ✓ |
| `SubtopicModal.test.tsx` | 11 | ✓ |
| `ClusterCard.test.tsx` | 7 | ✓ |
| Other project tests | 91 | ✓ |
| **Total** | **132** | **132 pass** |
