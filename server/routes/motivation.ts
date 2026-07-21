import { Router } from 'express';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const router = Router();
const MOTIVATION_PATH = resolve(process.env.MOTIVATION_PATH || './MOTIVATION.md');

interface MotivationEntry {
  date: string;
  body: string;
}

function parseMotivation(text: string): { northStar: string; entries: MotivationEntry[] } {
  const [northPart, timelinePart] = text.split(/^## Timeline.*$/m);

  const northStar = (northPart || '')
    .replace(/^# .*$/m, '')
    .replace(/^## North Star.*$/m, '')
    .replace(/^---\s*$/gm, '')
    .trim();

  const entries: MotivationEntry[] = [];
  if (timelinePart) {
    const chunks = timelinePart.split(/^### /m).slice(1);
    for (const chunk of chunks) {
      const nl = chunk.indexOf('\n');
      if (nl === -1) continue;
      entries.push({
        date: chunk.slice(0, nl).trim(),
        body: chunk.slice(nl + 1).trim()
      });
    }
  }

  return { northStar, entries };
}

router.get('/', (_req, res) => {
  try {
    if (!existsSync(MOTIVATION_PATH)) {
      res.status(404).json({ error: 'MOTIVATION.md not found' });
      return;
    }
    const text = readFileSync(MOTIVATION_PATH, 'utf-8');
    res.json(parseMotivation(text));
  } catch {
    res.status(500).json({ error: 'Could not read MOTIVATION.md' });
  }
});

export default router;
