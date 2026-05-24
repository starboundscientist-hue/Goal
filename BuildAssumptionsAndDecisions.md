# Build Assumptions & Decisions

**Model:** Deepseek (via opencode)

**Date:** 2026-05-24

---

## Assumptions That Contradicted or Extended IMPLEMENTATION.md

### 1. Tests Define the Contract

TESTS.md explicitly states: *"If a test fails, the implementation is wrong — not the test."* Several implementation details were not specified in IMPLEMENTATION.md but were enforced by the tests:

| Contradiction | IMPLEMENTATION.md Spec | Test Enforced |
|---|---|---|
| ClusterCard status | "Stale" when last worked >14d ago | "Not started" when no logs exist (even with 35% progress) |
| ClusterCard checklist | Unicode ●/○ characters | Styled `<span>` with `.w-2.h-2.rounded-full` + `bg-emerald-400`/`bg-zinc-700` |
| ActivityHeatmap | Grid of cells only | Heading "ACTIVITY GRID" + Less/More legend |
| buildCoachContext output | Not specified | Lowercase "weekly goal:" (not "Weekly goal:") |
| SemanticLogger placeholder | Specific example phrase | Must contain "freeform" for regex match |
| Rules reason strings | Not specified | Rule 3 reason must contain "stale"; Rule 4 must surface in-progress projects even when Rule 3 fires |

### 2. ESM + vitest v4 Mock Behavior

The project has `"type": "module"` in package.json. TESTS.md's mocking patterns assume vitest v3 / CJS:

- `vi.mock()` factories referencing outer variables fail in vitest v4 — requires `vi.hoisted()`
- CJS built-in modules (`child_process`, `fs`) need an explicit `default` export in the mock object, otherwise vitest throws "No 'default' export is defined"
- `require()` inside test files is not available in ESM context

### 3. vitest v4 vs v3 API

Installed vitest version is `4.1.7`. The TESTS.md was written for an earlier version (likely v1/v2). Notable differences:

- `vi.mock` with factory is hoisted to top of file; all factory dependencies must be in `vi.hoisted()`
- `importOriginal` helper for partial mocking works differently
- Test count differs: spec says 70 tests, actual is 97

### 4. React Router v7

Installed `react-router-dom` is v7.x. TESTS.md's router mocking patterns were tested against this version successfully, but the `MemoryRouter` API differs slightly from v6.

### 5. Express 5

Installed Express is 5.x. The route API (Router, req/res) is identical to Express 4 for our use case, so no breaking changes encountered.

### 6. Server Architecture Refactor

IMPLEMENTATION.md had the Express server inline in `server/index.ts`. TESTS.md required a separate `server/testApp.ts` that exports the app without `app.listen()`, for supertest integration testing. This required splitting the file.

### 7. shadcn-ui CLI Incompatibility

The shadcn CLI v4 cannot detect a manually scaffolded Vite 8 project. Components (Button, Card, Dialog, etc.) had to be created manually, or alternative UI patterns used.

### 8. Tailwind v3 + Vite 8

Tailwind CSS v3 and Vite 8 are not a standard combination. Works fine with `postcss.config.js` and `tailwind.config.ts`, but unusual.

### 9. `parseLLMResponse` Location

Parsing utility was specified in `api.ts` in IMPLEMENTATION.md, but tests import it from `utils.ts`. Moved to `utils.ts` and re-exported from `api.ts` to satisfy both.

### 10. Git Scanner Requires `.env`

The `/api/git/scan` endpoint returns 400 if `GIT_AUTHOR_EMAIL` is not set in `.env`. The route test handles both 200 and 400 responses gracefully.

### 11. OS / Shell

Development environment: macOS (darwin), zsh, Volta for Node version management.

---

## Decisions

| Decision | Rationale |
|---|---|
| Always align implementation to test expectations, not IMPLEMENTATION.md | TESTS.md explicitly states tests define the contract |
| Use `vi.hoisted()` for all mock variables | Required for vitest v4 ESM compatibility |
| Add `default` export to CJS module mocks | Required for vitest v4 to mock `child_process`, `fs` |
| Move `parseLLMResponse` to `utils.ts` | Tests import from `utils.ts` |
| Create `server/testApp.ts` | Required by routes.test.ts for supertest |
| Use `bg-[...]` arbitrary values for legend colors | Avoids inline `style` attributes that would inflate cell count query |
| Manual shadcn component creation | CLI v4 incompatible with Vite 8 project setup |
