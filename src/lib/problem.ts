import type { CollectionEntry } from 'astro:content';
import { getAdapter, listOjs } from '../adapters/registry';
import type { OjAdapter } from '../adapters/types';
import { gitAddDate } from './gitDate';

export type ProblemEntry = CollectionEntry<'problems'>;

export interface ProblemView {
  oj: string;
  pid: string;
  title: string;
  difficulty?: string;
  tags: string[];
  timeLimit?: string;
  memoryLimit?: string;
  sourceUrl?: string;
  date?: Date;
  adapter: OjAdapter;
  entry: ProblemEntry;
}

export function assertOjRegistered(oj: string): OjAdapter {
  const adapter = getAdapter(oj);
  if (!adapter) {
    throw new Error(
      `No adapter registered for OJ "${oj}". ` +
        `Add src/adapters/${oj}.ts.`,
    );
  }
  return adapter;
}

export function toProblemView(entry: ProblemEntry): ProblemView {
  const { oj, pid } = entry.data;
  const adapter = assertOjRegistered(oj);
  const sourceUrl = adapter.problemUrl(pid) ?? entry.data.sourceUrl;

  return {
    oj,
    pid,
    title: entry.data.title,
    difficulty: entry.data.difficulty,
    tags: entry.data.tags,
    timeLimit: entry.data.timeLimit,
    memoryLimit: entry.data.memoryLimit,
    sourceUrl,
    date: entry.data.date ?? (entry.filePath ? gitAddDate(entry.filePath) : undefined),
    adapter,
    entry,
  };
}

export function slugFromEntry(entry: ProblemEntry): { oj: string; pid: string } {
  return { oj: entry.data.oj, pid: entry.data.pid };
}

export function groupProblemsByOj(
  problems: ProblemView[],
): Map<string, ProblemView[]> {
  const adapters = listOjs();
  const byOj = new Map<string, ProblemView[]>();
  for (const a of adapters) byOj.set(a.id, []);
  for (const p of problems) {
    if (!byOj.has(p.oj)) byOj.set(p.oj, []);
    byOj.get(p.oj)!.push(p);
  }
  for (const list of byOj.values()) {
    list.sort((a, b) => a.pid.localeCompare(b.pid, 'en', { numeric: true }));
  }
  return byOj;
}

export function groupProblemsByTag(
  problems: ProblemView[],
): Map<string, ProblemView[]> {
  const byTag = new Map<string, ProblemView[]>();
  for (const p of problems) {
    for (const tag of p.tags) {
      let list = byTag.get(tag);
      if (!list) {
        list = [];
        byTag.set(tag, list);
      }
      list.push(p);
    }
  }
  for (const list of byTag.values()) {
    list.sort((a, b) =>
      a.oj === b.oj
        ? a.pid.localeCompare(b.pid, 'en', { numeric: true })
        : a.oj.localeCompare(b.oj, 'en'),
    );
  }
  return byTag;
}

export const PAGE_SIZE = 30;

export interface Pagination {
  items: ProblemView[];
  page: number;
  totalPages: number;
  total: number;
}

export function paginate(
  list: ProblemView[],
  page: number,
): Pagination {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    items: list.slice(start, start + PAGE_SIZE),
    page: safePage,
    totalPages,
    total,
  };
}

export const RECENT_LIMIT = 20;

export function recentSolutions(
  problems: ProblemView[],
  limit: number = RECENT_LIMIT,
): ProblemView[] {
  return problems
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.getTime() - a.date.getTime();
    })
    .slice(0, limit);
}
