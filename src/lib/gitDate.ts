import { execFileSync } from 'node:child_process';
import path from 'node:path';

const cache = new Map<string, Date | undefined>();
let repoRoot: string | undefined;

function getRepoRoot(): string | undefined {
  if (repoRoot === undefined) {
    try {
      repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    } catch {
      repoRoot = undefined;
    }
  }
  return repoRoot;
}

export function gitAddDate(filePath: string): Date | undefined {
  if (cache.has(filePath)) return cache.get(filePath);

  let date: Date | undefined;
  const root = getRepoRoot();
  if (root) {
    const rel = path.relative(root, filePath);
    try {
      const out = execFileSync(
        'git',
        ['log', '--diff-filter=A', '--format=%ct', '--', rel],
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      );
      const stamps = out
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const first = stamps.pop();
      if (first) date = new Date(Number(first) * 1000);
    } catch {
      // ignore
    }
  }
  cache.set(filePath, date);
  return date;
}
