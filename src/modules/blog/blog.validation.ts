import { z } from 'zod';

const languageSchema = z.enum(['en', 'gu']);
const statusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

// Reusable slug validation: URL-safe, lowercase, no spaces, no special unsafe chars, no HTML
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugSchema = z
  .string()
  .min(3)
  .max(100)
  .regex(slugRegex, 'Slug must be lowercase, URL-safe, with no spaces or special characters');

const blogTranslationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Content is required'), // Sanitized in service
});

const blogSeoTranslationSchema = z.object({
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(200).optional(),
  keywords: z.string().max(200).optional(),
  ogTitle: z.string().max(100).optional(),
  ogDescription: z.string().max(200).optional(),
});

const updateBlogSeoBodySchema = z.object({
  canonicalUrl: z.string().url().max(2000).optional().nullable(),
  ogImageKey: z.string().max(500).optional().nullable(),
  translations: z.object({
    en: blogSeoTranslationSchema.optional(),
    gu: blogSeoTranslationSchema.optional(),
  }).optional(),
});

export const createBlogSchema = z.object({
  body: z.object({
    slug: slugSchema,
    authorName: z.string().max(100).optional(),
    readingTime: z.number().int().min(1).optional(),
    translations: z.object({
      en: blogTranslationSchema,
      gu: blogTranslationSchema.partial().optional(),
    }),
    seo: updateBlogSeoBodySchema.optional(),
  }),
});

export const updateBlogBasicSchema = z.object({
  body: z.object({
    slug: slugSchema.optional(),
    authorName: z.string().max(100).optional(),
    readingTime: z.number().int().min(1).optional(),
    translations: z.object({
      en: blogTranslationSchema.partial().optional(),
      gu: blogTranslationSchema.partial().optional(),
    }).optional(),
  }),
});

export const updateBlogStatusSchema = z.object({
  body: z.object({
    status: statusSchema,
  }),
});

export const updateBlogSeoSchema = z.object({
  body: updateBlogSeoBodySchema,
});

export const updateBlogMediaSchema = z.object({
  body: z.object({
    coverMediaKey: z.string().max(500).optional().nullable(),
  }),
});

export const blogQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().int().min(1).max(100000)),
    limit: z.preprocess((val) => Number(val) || 10, z.number().int().min(1).max(100)),
    language: languageSchema.optional(),
    search: z.string().max(100).optional(),
    status: statusSchema.optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title', 'readingTime']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const blogSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
  query: z.object({
    language: languageSchema.optional(),
  }),
});

export const blogIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Blog ID'),
  }),
});
