export interface ProblemMetadata {
  title: string;
  difficulty?: string;
  tags?: string[];
  timeLimit?: string;
  memoryLimit?: string;
  sourceUrl?: string;
}

export interface OjAdapter {
  id: string;
  displayName: string;
  normalizeId(raw: string): string;
  validateId(id: string): boolean;
  problemUrl(id: string): string;
  fetchMetadata?(id: string): Promise<Partial<ProblemMetadata>>;
}

export function defineOjAdapter<T extends OjAdapter>(adapter: T): T {
  return adapter;
}
