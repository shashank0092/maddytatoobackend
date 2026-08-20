import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from './category.types';
import { paginationQuerySchema } from '../../shared/pagination/pagination.validation';

const slugRegex = /^[a-z0-9-]+$/;
const coverImageRegex = /^content\/categories\/.*$/;

const translationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  altText: z.string().optional(),
});

const updateTranslationSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  description: z.string().optional(),
  altText: z.string().optional(),
});

export const createCategorySchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
    coverImageKey: z
      .string()
      .regex(coverImageRegex, 'Cover image key must start with content/categories/')
      .optional(),
    isActive: z.boolean().optional().default(true),
    translations: z.object({
      en: translationSchema,
      gu: translationSchema.optional(),
    }),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens')
      .optional(),
    coverImageKey: z
      .string()
      .regex(coverImageRegex, 'Cover image key must start with content/categories/')
      .optional(),
    isActive: z.boolean().optional(),
    translations: z
      .object({
        en: updateTranslationSchema.optional(),
        gu: updateTranslationSchema.optional(),
      })
      .optional(),
  }),
});

export const categoryQuerySchema = z.object({
  query: z.object({
    lang: z
      .enum([...SUPPORTED_LANGUAGES] as [string, ...string[]])
      .optional()
      .default('en'),
    search: z.string().optional(),
    sort: z.enum(['latest', 'oldest', 'name']).optional().default('latest'),
  }).merge(paginationQuerySchema),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

export const categorySlugParamSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
  }),
  query: z.object({
    lang: z
      .enum([...SUPPORTED_LANGUAGES] as [string, ...string[]])
      .optional()
      .default('en'),
  }),
});
