import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination/pagination.validation';

const slugRegex = /^[a-z0-9-]+$/;
const s3KeyPrefixRegex = /^content\//;

const SUPPORTED_LANGUAGES = ['en', 'gu'] as const;

// 1. Base Translation Schemas
const translationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  story: z.string().optional(),
  inspiration: z.string().optional(),
  meaning: z.string().optional(),
  process: z.string().optional(),
});

const updateTranslationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  story: z.string().optional(),
  inspiration: z.string().optional(),
  meaning: z.string().optional(),
  process: z.string().optional(),
});

// 2. Base SEO Translation Schemas
const seoTranslationSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
});

// --------------------------------------------------
// PUBLIC QUERIES
// --------------------------------------------------

export const contentQuerySchema = z.object({
  query: z.object({
    lang: z.enum(SUPPORTED_LANGUAGES).optional().default('en'),
    search: z.string().optional(),
    contentType: z.string().optional(),
    category: z.string().optional(),
    collection: z.string().optional(),
    style: z.string().optional(),
    bodyPlacement: z.string().optional(),
    tag: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    isFeatured: z.preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return Boolean(val);
    }, z.boolean()).optional(),
    sort: z.enum(['latest', 'oldest', 'title']).optional().default('latest'),
  }).merge(paginationQuerySchema),
});

export const contentSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
  }),
  query: z.object({
    lang: z.enum(SUPPORTED_LANGUAGES).optional().default('en'),
  }),
});

export const contentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid content ID'),
  }),
});

// --------------------------------------------------
// ADMIN MUTATIONS
// --------------------------------------------------

// POST /contents
export const createContentSchema = z.object({
  body: z.object({
    slug: z.string().min(1).regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
    isFeatured: z.boolean().optional(),
    contentTypeId: z.string().uuid('Invalid Content Type ID'),
    categoryId: z.string().uuid('Invalid Category ID').optional().nullable(),
    collectionId: z.string().uuid('Invalid Collection ID').optional().nullable(),
    styleId: z.string().uuid('Invalid Style ID').optional().nullable(),
    bodyPlacementId: z.string().uuid('Invalid Body Placement ID').optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
    translations: z.object({
      en: translationSchema,
      gu: updateTranslationSchema.optional(),
    }),
    tagIds: z.array(z.string().uuid('Invalid Tag ID')).optional().default([]),
  }),
});

// PATCH /contents/:id
export const updateContentBasicSchema = z.object({
  body: z.object({
    slug: z.string().min(1).regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens').optional(),
    isFeatured: z.boolean().optional(),
    translations: z.object({
      en: updateTranslationSchema.optional(),
      gu: updateTranslationSchema.optional(),
    }).optional(),
  }),
});

// PATCH /contents/:id/media
export const updateContentMediaSchema = z.object({
  body: z.object({
    media: z.array(
      z.object({
        role: z.enum(['COVER', 'GALLERY', 'PROCESS', 'VIDEO']),
        mediaType: z.enum(['IMAGE', 'VIDEO']),
        s3Key: z.string().regex(s3KeyPrefixRegex, 's3Key must start with content/'),
        altText: z.string().optional().nullable(),
        sortOrder: z.number().int().min(0),
        isActive: z.boolean().default(true),
      })
    ),
  }),
});

// PATCH /contents/:id/taxonomy
export const updateContentTaxonomySchema = z.object({
  body: z.object({
    contentTypeId: z.string().uuid('Invalid Content Type ID'),
    categoryId: z.string().uuid('Invalid Category ID').optional().nullable(),
    collectionId: z.string().uuid('Invalid Collection ID').optional().nullable(),
    styleId: z.string().uuid('Invalid Style ID').optional().nullable(),
    bodyPlacementId: z.string().uuid('Invalid Body Placement ID').optional().nullable(),
    tagIds: z.array(z.string().uuid('Invalid Tag ID')),
  }),
});

// PATCH /contents/:id/display
export const updateContentDisplaySchema = z.object({
  body: z.object({
    displays: z.array(
      z.object({
        surface: z.enum(['HOME', 'DISCOVER', 'MUSEUM', 'COMMUNITY']),
        displayType: z.enum(['FEATURED', 'LATEST', 'EDITOR_PICK', 'SPOTLIGHT']),
        sortOrder: z.number().int().min(0),
        isActive: z.boolean().default(true),
      })
    ),
  }),
});

// PATCH /contents/:id/seo
export const updateContentSeoSchema = z.object({
  body: z.object({
    ogImageKey: z.string().regex(s3KeyPrefixRegex, 's3Key must start with content/').optional().nullable(),
    canonicalUrl: z.string().url('Invalid Canonical URL').optional().nullable(),
    translations: z.object({
      en: seoTranslationSchema.optional(),
      gu: seoTranslationSchema.optional(),
    }).optional(),
  }),
});

// PATCH /contents/:id/status
export const updateContentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  }),
});
