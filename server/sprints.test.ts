import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

let testDir: string;
let app: express.Express;

beforeEach(async () => {
  testDir = join(tmpdir(), `goal-os-test-sprints-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });
  process.env.DATA_DIR = testDir;
  vi.resetModules();
  const { default: expressApp } = await import('./testApp');
  app = expressApp;
});

afterEach(() => {
  delete process.env.DATA_DIR;
  if (existsSync(testDir)) rmSync(testDir, { recursive: true });
});

describe('GET /api/sprints', () => {
  it('returns 200 with auto-seeded sprint data', async () => {
    const res = await request(app).get('/api/sprints');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sprints');
    expect(Array.isArray(res.body.sprints)).toBe(true);
    expect(res.body.sprints[0]).toHaveProperty('name');
    expect(res.body.sprints[0]).toHaveProperty('goals');
    expect(res.body.sprints[0].closed).toBe(false);
  });
});

describe('PUT /api/sprints', () => {
  it('saves and persists data', async () => {
    const payload = {
      backlog: [],
      sprints: [
        {
          id: 'sprint_test',
          name: 'Test Sprint',
          startDate: '2026-07-21',
          endDate: '2026-08-03',
          goals: [
            { id: 'g1', label: 'Goal one', lane: 'main', status: 'not_started' as const }
          ],
          closed: false
        }
      ]
    };
    const putRes = await request(app).put('/api/sprints').send(payload);
    expect(putRes.status).toBe(200);
    expect(putRes.body.ok).toBe(true);

    const getRes = await request(app).get('/api/sprints');
    expect(getRes.body.sprints).toHaveLength(1);
    expect(getRes.body.sprints[0].goals[0].label).toBe('Goal one');
  });
});
