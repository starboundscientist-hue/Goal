import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const EXCLUDE_DIRS = new Set([
  '.git', '.next', 'dist', 'build', 'venv', '.venv', 'target',
  'node_modules', '.cache', '__pycache__', '.DS_Store'
]);

function expandPath(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return p.replace('~', homedir());
  }
  return p;
}

function findGitRepos(root: string, maxDepth = 3, depth = 0): string[] {
  if (depth > maxDepth) return [];
  const expanded = expandPath(root);
  if (!existsSync(expanded)) return [];

  const repos: string[] = [];

  if (existsSync(join(expanded, '.git'))) {
    repos.push(expanded);
    return repos;
  }

  try {
    const entries = readdirSync(expanded);
    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      if (EXCLUDE_DIRS.has(entry)) continue;
      const full = join(expanded, entry);
      try {
        if (statSync(full).isDirectory()) {
          repos.push(...findGitRepos(full, maxDepth, depth + 1));
        }
      } catch { /* skip unreadable dirs */ }
    }
  } catch { /* skip unreadable root */ }

  return repos;
}

export function scanRecentCommits(
  devRoot: string,
  authorEmail: string,
  since = '24 hours ago'
): Array<{ repo: string; commits: string[] }> {
  const repos = findGitRepos(devRoot);
  const results: Array<{ repo: string; commits: string[] }> = [];

  for (const repo of repos) {
    try {
      const output = execSync(
        `git -C "${repo}" log --since="${since}" --author="${authorEmail}" --pretty=format:"%s"`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 5000 }
      ).trim();

      if (output) {
        const commits = output.split('\n').filter(Boolean);
        if (commits.length > 0) {
          results.push({ repo, commits });
        }
      }
    } catch { /* repo has no commits or git error — skip */ }
  }

  return results;
}
