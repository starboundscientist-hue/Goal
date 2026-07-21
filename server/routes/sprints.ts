import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const router = Router();
const DATA_DIR = resolve(process.env.DATA_DIR || './data');
const DATA_PATH = resolve(DATA_DIR, 'sprints.json');

function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_PATH)) {
    const today = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + 13);
    const seed = {
      sprints: [
        {
          id: 'sprint_1',
          name: 'Sprint 1',
          startDate: today,
          endDate: end.toISOString().split('T')[0],
          goals: [],
          closed: false
        }
      ],
      backlog: []
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
    res.status(500).json({ error: 'Could not read sprints.json' });
  }
});

router.put('/', (req, res) => {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not write sprints.json' });
  }
});

export default router;
