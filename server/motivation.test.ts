import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { writeFileSync, mkdirSync, rmSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const SAMPLE = `# Goal OS — Motivation & Timeline

## North Star

Build rare, **high-ground** expertise at the intersection of frontier AI and embodied systems.

> That is not a race to the bottom. That is the summit.

The wrapper era is noise.

---

## Timeline

### 2026-07-10

**Context:** Org change at work.

**Realignment:** Keep climbing.

### 2026-07-11

**Context:** Second entry.

- win one
- win two
`;

let testDir: string;
let motivationPath: string;
let app: express.Express;

beforeEach(async () => {
  testDir = join(tmpdir(), `goal-os-motivation-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(testDir, { recursive: true });
  motivationPath = join(testDir, 'MOTIVATION.md');
  writeFileSync(motivationPath, SAMPLE, 'utf-8');

  process.env.DATA_DIR = testDir;
  process.env.MOTIVATION_PATH = motivationPath;

  vi.resetModules();
  const { default: expressApp } = await import('./testApp');
  app = expressApp;
});

afterEach(() => {
  delete process.env.MOTIVATION_PATH;
  if (existsSync(testDir)) rmSync(testDir, { recursive: true });
});

describe('GET /api/motivation', () => {
  it('returns 200 with parsed northStar and entries', async () => {
    const res = await request(app).get('/api/motivation');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('northStar');
    expect(res.body).toHaveProperty('entries');
  });

  it('extracts the north star section without headings or separators', async () => {
    const res = await request(app).get('/api/motivation');
    expect(res.body.northStar).toContain('high-ground');
    expect(res.body.northStar).toContain('That is the summit');
    expect(res.body.northStar).not.toContain('## North Star');
    expect(res.body.northStar).not.toContain('---');
    expect(res.body.northStar).not.toContain('Timeline');
  });

  it('parses timeline entries with dates and bodies in file order', async () => {
    const res = await request(app).get('/api/motivation');
    expect(res.body.entries).toHaveLength(2);
    expect(res.body.entries[0].date).toBe('2026-07-10');
    expect(res.body.entries[0].body).toContain('Org change at work');
    expect(res.body.entries[1].date).toBe('2026-07-11');
    expect(res.body.entries[1].body).toContain('win two');
  });

  it('returns 404 when MOTIVATION.md does not exist', async () => {
    unlinkSync(motivationPath);
    const res = await request(app).get('/api/motivation');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('reflects file edits on subsequent requests', async () => {
    writeFileSync(motivationPath, SAMPLE.replace('Keep climbing', 'Edited realignment'), 'utf-8');
    const res = await request(app).get('/api/motivation');
    expect(res.body.entries[0].body).toContain('Edited realignment');
  });
});
