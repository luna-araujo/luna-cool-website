import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    coverCaption: z.string().optional()
  })
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string().optional(),
    year: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional()
  })
});

const cards = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    accent: z.enum(["accent", "accent-alt"]),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    open: z.boolean().default(false),
    kind: z.enum(["text", "tags"]),
    order: z.number(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = { blog, projects, cards }; 
