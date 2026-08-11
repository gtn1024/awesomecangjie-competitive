import type { OjAdapter } from './types';

const modules = import.meta.glob('./*.ts', { eager: true });

const registry = new Map<string, OjAdapter>();

for (const [path, mod] of Object.entries(modules)) {
  const filename = path.slice(path.lastIndexOf('/') + 1);
  if (filename === 'registry.ts' || filename === 'types.ts') continue;

  const adapter = (mod as { default?: OjAdapter }).default;
  if (adapter && typeof adapter.id === 'string') {
    registry.set(adapter.id, adapter);
  }
}

export function getAdapter(oj: string): OjAdapter | undefined {
  return registry.get(oj);
}

export function listOjs(): OjAdapter[] {
  return [...registry.values()];
}
