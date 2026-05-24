import { scanRecentCommits } from './gitScanner.js';

process.on('message', ({ devRoot, email }: { devRoot: string; email: string }) => {
  const groups = scanRecentCommits(devRoot, email);
  process.send!(groups);
  process.exit(0);
});
