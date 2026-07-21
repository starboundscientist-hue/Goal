import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const router = Router();
const DATA_DIR = resolve(process.env.DATA_DIR || './data');
const DATA_PATH = resolve(DATA_DIR, 'progress.json');

function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_PATH)) {
    const seed = {
      meta: {
        dev_root: '~/Dev',
        git_author_email: '',
        start_date: new Date().toISOString().split('T')[0],
        target_years: 5,
        weekly_goal_hours: 5,
        last_coach_run: null,
        last_coach_output: null
      },
      clusters: {},
      logs: []
    };
    writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2), 'utf-8');
  }
}

ensureDataFile();

router.get('/', (_req, res) => {
  try {
    const data = readFileSync(DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: 'Could not read progress.json' });
  }
});

router.put('/', (req, res) => {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not write progress.json' });
  }
});

router.get('/resources', (_req, res) => {
  try {
    const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
    const clusters = data.clusters || {};
    const entries: { resource: any; clusterId: string }[] = [];
    for (const [clusterId, cluster] of Object.entries(clusters)) {
      const c = cluster as any;
      if (Array.isArray(c.resources)) {
        for (const r of c.resources) {
          entries.push({ resource: r, clusterId });
        }
      }
    }
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Could not read progress.json' });
  }
});

export default router;
