import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const optionalMeta = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional()
});

const docs = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: '../docs'
  }),
  schema: optionalMeta
});

const docsFr = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: '../docs-fr'
  }),
  schema: optionalMeta
});

export const collections = { docs, docsFr };
