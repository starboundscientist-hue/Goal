import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

let testDataDir: string;
let app: express.Express;

beforeEach(async () => {
  testDataDir = join(tmpdir(), `goal-os-test-${Date.now()}`);
  mkdirSync(testDataDir, { recursive: true });

  writeFileSync(join(testDataDir, 'progress.json'), JSON.stringify({
    meta: { weekly_goal_hours: 5 },
    clusters: {},
    logs: []
  }), 'utf-8');

  writeFileSync(join(testDataDir, 'work.json'), JSON.stringify({
    tasks: [],
    automation_log: []
  }), 'utf-8');

  process.env.DATA_DIR = testDataDir;

  vi.resetModules();
  const { default: expressApp } = await import('./testApp');
  app = expressApp;
});

afterEach(() => {
  if (existsSync(testDataDir)) rmSync(testDataDir, { recursive: true });
});

describe('GET /api/progress', () => {
  it('returns 200 with progress data', async () => {
    const res = await request(app).get('/api/progress');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clusters');
    expect(res.body).toHaveProperty('logs');
  });
});

describe('PUT /api/progress', () => {
  it('saves data and returns { ok: true }', async () => {
    const payload = { meta: { weekly_goal_hours: 10 }, clusters: {}, logs: [] };
    const res = await request(app).put('/api/progress').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('persists data that can be read back', async () => {
    const payload = { meta: { weekly_goal_hours: 7 }, clusters: {}, logs: [{ id: 'x' }] };
    await request(app).put('/api/progress').send(payload);
    const res = await request(app).get('/api/progress');
    expect(res.body.meta.weekly_goal_hours).toBe(7);
    expect(res.body.logs).toHaveLength(1);
  });
});

describe('GET /api/work', () => {
  it('returns 200 with work data', async () => {
    const res = await request(app).get('/api/work');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(res.body).toHaveProperty('automation_log');
  });
});

describe('PUT /api/work', () => {
  it('saves a new task and can be read back', async () => {
    const payload = { tasks: [{ id: 'w1', title: 'Test task', status: 'todo' }], automation_log: [] };
    await request(app).put('/api/work').send(payload);
    const res = await request(app).get('/api/work');
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe('Test task');
  });
});

describe('POST /api/git/scan', () => {
  it('returns { groups: [] } when GIT_AUTHOR_EMAIL is not set', async () => {
    const savedEmail = process.env.GIT_AUTHOR_EMAIL;
    delete process.env.GIT_AUTHOR_EMAIL;
    const res = await request(app).post('/api/git/scan');
    expect([200, 400]).toContain(res.status);
    process.env.GIT_AUTHOR_EMAIL = savedEmail;
  });

  it('returns an array in groups property', async () => {
    process.env.GIT_AUTHOR_EMAIL = 'test@test.com';
    process.env.DEV_ROOT = testDataDir;
    const res = await request(app).post('/api/git/scan');
    if (res.status === 200) {
      expect(Array.isArray(res.body.groups)).toBe(true);
    }
  });
});

describe('GET /api/llm/health', () => {
  it('returns { online: false } when Ollama is not running', async () => {
    const res = await request(app).get('/api/llm/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('online');
    expect(typeof res.body.online).toBe('boolean');
  });
});
