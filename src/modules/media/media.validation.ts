import { z } from 'zod';
import { MediaType, MediaRole } from '@prisma/client';

const translationSchema = z.object({
  altText: z.string().nullable().optional(),
});

export const createMediaSchema = z.object({
  body: z.object({
    contentId: z.string().uuid('Invalid content ID format'),
    s3Key: z.string().min(1).refine((val) => {
      // Must start with content/
      if (!val.startsWith('content/')) return false;
      // Prevent path traversal and absolute paths
      if (val.includes('../') || val.includes('..\\') || val.startsWith('/')) return false;
      // Prevent URLs
      if (val.startsWith('http://') || val.startsWith('https://')) return false;
      return true;
    }, { message: 'Invalid S3 key format. Must be a relative path within the content/ directory.' }),
    mediaType: z.nativeEnum(MediaType, {
      message: 'Invalid mediaType',
    }),
    role: z.nativeEnum(MediaRole, {
      message: 'Invalid role',
    }),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    translations: z.object({
      en: translationSchema.optional(),
      gu: translationSchema.optional(),
    }).optional(),
  }),
});

export const updateMediaSchema = z.object({
  body: z.object({
    role: z.nativeEnum(MediaRole, {
      message: 'Invalid role',
    }).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    translations: z.object({
      en: translationSchema.optional(),
      gu: translationSchema.optional(),
    }).optional(),
  }),
});

export const mediaIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid media ID format'),
  }),
});
