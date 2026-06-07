# Goal OS

Personal study/work tracking dashboard. React 18 + TypeScript + Vite 8 frontend, Express 5 backend, persisted to JSON files on disk.

## Documentation

- **`UPLIFT.md`** — active UI/UX uplift plan (the WorkTask cockpit). Read this before any UI work.
- **`legacy/`** — historical planning/bugfix docs from the initial build (blueprints, IMPLEMENTATION.md, REVIEW_NOTES.md, TESTS.md, BUGS_FIXED.md, etc.). Reference only.

## Project structure

- Root `package.json` is the real app. `goal-os/` is a **dead Vite scaffold** — do not touch.
- `server/index.ts` imports `server/testApp.ts` (no `app.listen`) and calls `app.listen` itself. Use `testApp.ts` for supertest, not `index.ts`.
- `src/lib/types.ts` is the **single source of truth** for all TypeScript interfaces. Never define inline types.
- `src/components/cluster/SubtopicModal.tsx` is the new SubtopicModal (separate file extracted from `TopicsSection.tsx`). The old inline `SubtopicModal` function was removed.

## Commands

```sh
npm run dev            # concurrently: Express on :3001 + Vite on :5173
npm run server         # tsx watch server/index.ts (standalone)
npm test               # vitest run (132 tests passing)
npm run test:watch     # vitest interactive
npm run test:coverage  # vitest with coverage
npm run build          # tsc && vite build
```

## Testing

- Tests **define the contract** — align implementation to test expectations, not prose specs.
- Vitest **v4** (not v3). Use `vi.hoisted()` for all mock variables. CJS module mocks (`fs`, `child_process`) need explicit `default` export in mock factory.
- `src/lib/test-fixtures.ts` is the shared fixture source — import there, never inline.
- Uses jsdom environment, fake timers (`vi.useFakeTimers()`), `@testing-library/jest-dom`.
- `tsconfig.json` excludes `**/*.test.ts` and `**/*.test.tsx` from type checking.

## Dev server

- Vite proxies `/api/*` to `http://localhost:3001`.
- `.env` required for: `GIT_AUTHOR_EMAIL`, `DEV_ROOT`, `OPENROUTER_API_KEY`, `DATA_DIR`, `PORT`.
- OpenRouter (`google/gemma-2-9b-it`) for semantic log parsing and weekly coach.
- No database — all data in `data/progress.json` and `data/work.json`, read/written by Express routes.

## Architecture notes

- State management: Zustand store in `src/lib/store.ts`. Action handlers mutate local state AND persist to server (no separate save step).
- Git scanner runs in a forked child process (`gitScannerWorker.ts`) with 10s timeout. Scans `DEV_ROOT` recursively for `.git` repos (max depth 3) and queries recent commits by author email.
- Path alias `@/*` → `./src/*` in both Vite config and vitest config.
- Tailwind CSS v3 with custom dark theme (surface colors, cluster colors). Dark mode via `class` strategy.
- The sidebar "Log Session" button dispatches a `CustomEvent('open-logger')` to open the SemanticLogger modal.
- Focus queue rules in `src/lib/rules.ts`: artifact missing > foundations gate > stale clusters > in-progress projects > phase 2 unlock. Max 5 items, one per cluster.
