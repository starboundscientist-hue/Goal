import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const router = Router();
const DATA_PATH = resolve(process.env.DATA_DIR || './data', 'work.json');

function ensureDataFile() {
  if (!existsSync(DATA_PATH)) {
    writeFileSync(DATA_PATH, JSON.stringify({ tasks: [], automation_log: [] }, null, 2), 'utf-8');
  }
}

ensureDataFile();

router.get('/', (_req, res) => {
  try {
    const data = readFileSync(DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: 'Could not read work.json' });
  }
});

router.put('/', (req, res) => {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not write work.json' });
  }
});

export default router;
