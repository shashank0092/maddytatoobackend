import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from './tag.types';
import { paginationQuerySchema } from '../../shared/pagination/pagination.validation';

const slugRegex = /^[a-z0-9-]+$/;

const translationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const updateTranslationSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
});

export const createTagSchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
    isActive: z.boolean().optional().default(true),
    translations: z.object({
      en: translationSchema,
      gu: translationSchema.optional(),
    }),
  }),
});

export const updateTagSchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(1)
      .regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens')
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

export const tagQuerySchema = z.object({
  query: z.object({
    lang: z
      .enum([...SUPPORTED_LANGUAGES] as [string, ...string[]])
      .optional()
      .default('en'),
    search: z.string().optional(),
    sort: z.enum(['latest', 'oldest', 'name']).optional().default('name'),
  }).merge(paginationQuerySchema),
});

export const tagIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid tag ID'),
  }),
});

export const tagSlugParamSchema = z.object({
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
