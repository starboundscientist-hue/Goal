import { Router } from 'express';
import { fork } from 'child_process';
import { resolve } from 'path';
import { homedir } from 'os';

const router = Router();

function expandPath(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return p.replace('~', homedir());
  }
  return p;
}

router.post('/scan', (req, res) => {
  const devRoot = expandPath(process.env.DEV_ROOT || `${process.env.HOME || homedir()}/Dev`);
  const email = process.env.GIT_AUTHOR_EMAIL || '';

  if (!email) {
    return res.status(400).json({ error: 'GIT_AUTHOR_EMAIL not set in .env' });
  }

  const worker = fork(resolve(process.cwd(), 'server/gitScannerWorker.ts'), [], { silent: true, execArgv: ['--import', 'tsx'] });
  worker.send({ devRoot, email });

  const timeout = setTimeout(() => {
    worker.kill();
    res.json({ groups: [] });
  }, 10000);

  worker.once('message', (groups) => {
    clearTimeout(timeout);
    res.json({ groups });
  });

  worker.on('error', () => {
    clearTimeout(timeout);
    res.json({ groups: [] });
  });
});

export default router;
