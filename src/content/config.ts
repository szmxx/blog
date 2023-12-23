import { defineCollection, z } from "astro:content";
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),
    minutesRead: z.string().optional(),
    modifiedtime: z.coerce.date().optional(),
    keywords: z.string().optional(),
    catalog: z.string().optional(),
    headings: z
      .array(
        z.object({
          depth: z.number().optional(),
        })
      )
      .optional(),
    prev: z
      .object({
        slug: z.string(),
        data: z.object({}),
      })
      .optional(),
    next: z
      .object({
        slug: z.string(),
        data: z.object({}),
      })
      .optional(),
  }),
});

export const collections = { blog };
