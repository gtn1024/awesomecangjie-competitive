import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const problems = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/problems' }),
  schema: z.object({
    oj: z.string(),
    pid: z.string(),
    title: z.string(),
    date: z.coerce.date().optional(),
    difficulty: z.string().optional(),
    tags: z.array(z.string()).default([]),
    timeLimit: z.string().optional(),
    memoryLimit: z.string().optional(),
    sourceUrl: z
      .string()
      .regex(/^https?:\/\//, 'must be a URL')
      .optional(),
  }),
});

export const collections = { problems };
