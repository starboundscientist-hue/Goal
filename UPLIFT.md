# Goal OS — UI/UX Uplift Plan

> **Active plan.** The cockpit is a wide, immersive task modal — Linear meets Things 3 meets Arc.
> When clicking a `WorkTask` in the Work tracker, its subtasks open in a **two-pane ~1024px modal** with a sticky hero, drag-to-reorder subtasks, inline editing, AI-suggested breakdowns, and a status-aware visual language.
>
> **Status:** Approved. Implementation in progress.
>
> **Date:** 2026-06-07

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
