import { z } from "zod";

// Mirrors backend ProjectCreate (app/schemas/project.py). The slug regex must
// match the backend pattern exactly: ^[a-z0-9]+(?:-[a-z0-9]+)*$
export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and single hyphens"),
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().min(1, "Summary is required").max(400),
  stack: z.array(z.string().trim().min(1)).default([]),
  links: z
    .object({
      repo: z.string().trim().url("Enter a valid URL").or(z.literal("")).optional(),
      demo: z.string().trim().url("Enter a valid URL").or(z.literal("")).optional(),
    })
    .optional(),
  featured: z.boolean().default(false),
  order: z.coerce.number().int().min(0).default(999),
});

export type ProjectInput = z.infer<typeof projectSchema>;
