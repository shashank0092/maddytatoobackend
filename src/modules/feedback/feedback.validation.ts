import { z } from 'zod';
import { FeedbackStatus, FeedbackMediaType } from '@prisma/client';

const s3KeyRegex = /^feedback\/testimonials\/.+$/;

const mediaSchema = z.object({
  mediaType: z.nativeEnum(FeedbackMediaType),
  s3Key: z.string().regex(s3KeyRegex, 'Invalid S3 key format for feedback media'),
  mimeType: z.string().refine((val) => val.startsWith('video/') || val.startsWith('image/'), {
    message: 'MIME type must be video/* or image/*',
  }),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
}).superRefine((data, ctx) => {
  if (data.mediaType === 'VIDEO' && !data.mimeType.startsWith('video/')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'VIDEO mediaType must have a video/* MIME type',
      path: ['mimeType'],
    });
  }
  if (data.mediaType === 'IMAGE' && !data.mimeType.startsWith('image/')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'IMAGE mediaType must have an image/* MIME type',
      path: ['mimeType'],
    });
  }
});

const translationSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Content too long'),
});

export const createFeedbackSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').max(255),
    email: z.string().trim().email('Invalid email format').optional().nullable(),
    rating: z.number().int().min(1).max(5),
    consentToPublish: z.boolean(),
    translations: z.object({
      en: translationSchema.optional(),
      gu: translationSchema.optional(),
    }).refine(data => data.en || data.gu, {
      message: 'At least one translation (en or gu) must be provided',
    }),
    media: z.array(mediaSchema).optional(),
  }),
});

export const updateFeedbackSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().trim().min(1).max(255).optional(),
    email: z.string().trim().email().optional().nullable(),
    rating: z.number().int().min(1).max(5).optional(),
    consentToPublish: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    translations: z.object({
      en: translationSchema.optional(),
      gu: translationSchema.optional(),
    }).optional(),
  }),
});

export const updateFeedbackStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(FeedbackStatus),
  }),
});

export const updateFeedbackMediaSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    media: z.array(mediaSchema),
  }),
});

export const feedbackListQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().min(1).max(100).default(10)),
    status: z.nativeEnum(FeedbackStatus).optional(),
    rating: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(5).optional()),
    isFeatured: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
    isVerified: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
    consentToPublish: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
    mediaType: z.nativeEnum(FeedbackMediaType).optional(),
    language: z.enum(['en', 'gu']).optional().default('en'),
    search: z.string().trim().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'submittedAt', 'publishedAt', 'rating', 'name']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const feedbackIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
